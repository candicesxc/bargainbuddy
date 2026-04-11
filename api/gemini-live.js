// api/gemini-live.js
// Confirmed working config (tested via WebSocket):
//   model: gemini-2.5-flash-native-audio-latest
//   responseModalities: ['AUDIO'] only — TEXT modality rejected by this API key
//   systemInstruction: supported

const LIVE_WS_URL = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';

export async function startNegotiation(state, onTranscript, onDone) {
  const apiKey = window.CONFIG?.GEMINI_API_KEY || (typeof CONFIG !== 'undefined' ? CONFIG.GEMINI_API_KEY : null);
  if (!apiKey || apiKey.includes('PASTE')) {
    throw new Error("Invalid API Key. Please update config.js.");
  }

  let micStream;
  let captureCtx;
  let playbackCtx;
  let micSource;
  let processor;
  let ws;
  let isMuted = false;
  let sessionEnded = false;
  let playbackQueue = Promise.resolve();

  micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

  // 16kHz input — Gemini Live expects PCM16 at 16kHz
  captureCtx = new AudioContext({ sampleRate: 16000 });
  await captureCtx.resume();

  // 24kHz output — Gemini Live sends PCM16 at 24kHz
  playbackCtx = new AudioContext({ sampleRate: 24000 });
  await playbackCtx.resume();

  return new Promise((resolve, reject) => {
    ws = new WebSocket(`${LIVE_WS_URL}?key=${apiKey}`);
    ws.binaryType = 'arraybuffer'; // receive binary frames as ArrayBuffer, not Blob

    ws.onopen = () => {
      ws.send(JSON.stringify({
        setup: {
          model: 'models/gemini-2.5-flash-native-audio-latest',
          systemInstruction: {
            parts: [{ text: buildSystemPrompt(state) }]
          },
          generationConfig: {
            responseModalities: ['AUDIO']
          }
        }
      }));
    };

    ws.onmessage = (event) => {
      let msg;
      try {
        const text = event.data instanceof ArrayBuffer
          ? new TextDecoder().decode(event.data)
          : event.data;
        msg = JSON.parse(text);
      } catch (e) { console.error('WS parse error:', e); return; }

      if (msg.setupComplete) {
        startMicCapture();
        const lang = state.detectedLanguage === 'Auto-detect' ? 'the local language' : state.detectedLanguage;
        ws.send(JSON.stringify({
          clientContent: {
            turns: [{
              role: 'user',
              parts: [{ text: `Begin the negotiation now in ${lang}. Make your opening offer immediately.` }]
            }],
            turnComplete: true
          }
        }));
        resolve({ stop: stopEverything, mute: (val) => { isMuted = val; } });
        return;
      }

      // Audio output from the model
      const parts = msg.serverContent?.modelTurn?.parts ?? [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          enqueueAudio(part.inlineData.data);
        }
      }

      // Log full message to console for debugging
      if (msg.serverContent) {
        console.log('serverContent:', JSON.stringify(msg.serverContent).slice(0, 300));
      }
    };

    ws.onerror = (e) => {
      console.error('WebSocket error:', e);
      if (!sessionEnded) {
        sessionEnded = true;
        onTranscript('<span style="color:#ef4444;">Connection error — check API key.</span>');
        cleanup();
        reject(new Error('WebSocket connection failed'));
      }
    };

    ws.onclose = (e) => {
      console.warn(`WebSocket closed — code: ${e.code}, reason: "${e.reason}"`);
      if (!sessionEnded) {
        sessionEnded = true;
        const detail = e.reason ? `: ${e.reason}` : ` (code ${e.code})`;
        onTranscript(`<span style="color:#f59e0b;">Session disconnected${detail}.</span>`);
        cleanup();
        reject(new Error(`WebSocket closed: ${e.reason || e.code}`));
      }
    };

    function startMicCapture() {
      micSource = captureCtx.createMediaStreamSource(micStream);
      processor = captureCtx.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        if (isMuted || sessionEnded || !ws || ws.readyState !== WebSocket.OPEN) return;
        const float32 = e.inputBuffer.getChannelData(0);
        const int16 = new Int16Array(float32.length);
        for (let i = 0; i < float32.length; i++) {
          int16[i] = Math.max(-32768, Math.min(32767, float32[i] * 32768));
        }
        const bytes = new Uint8Array(int16.buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        ws.send(JSON.stringify({
          realtimeInput: {
            mediaChunks: [{ mimeType: 'audio/pcm;rate=16000', data: btoa(binary) }]
          }
        }));
      };

      micSource.connect(processor);
      processor.connect(captureCtx.destination);
    }

    function enqueueAudio(base64) {
      playbackQueue = playbackQueue.then(() => new Promise((res) => {
        try {
          const binary = atob(base64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          const numSamples = Math.floor(bytes.length / 2);
          const float32 = new Float32Array(numSamples);
          const view = new DataView(bytes.buffer);
          for (let i = 0; i < numSamples; i++) {
            float32[i] = view.getInt16(i * 2, true) / 32768.0;
          }
          const audioBuffer = playbackCtx.createBuffer(1, numSamples, 24000);
          audioBuffer.copyToChannel(float32, 0);
          const source = playbackCtx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(playbackCtx.destination);
          source.onended = res;
          source.start();
        } catch (e) {
          console.error('Audio playback error:', e);
          res();
        }
      }));
    }

    function stopEverything() {
      sessionEnded = true;
      if (processor) { try { processor.disconnect(); } catch (_) {} }
      if (micSource) { try { micSource.disconnect(); } catch (_) {} }
      if (micStream) { micStream.getTracks().forEach(t => t.stop()); }
      if (ws && ws.readyState === WebSocket.OPEN) { ws.close(); }
    }

    function cleanup() {
      if (captureCtx && captureCtx.state !== 'closed') captureCtx.close();
      if (playbackCtx && playbackCtx.state !== 'closed') playbackCtx.close();
    }
  });
}

function buildSystemPrompt(state) {
  const a = state.analysis;
  const lang = state.detectedLanguage === 'Auto-detect'
    ? 'the local language'
    : state.detectedLanguage;

  return `You are BargainBuddy, a voice AI negotiating at a market in ${state.location.city}, ${state.location.country}.
Speak ONLY in ${lang}. Keep responses short — this is live spoken conversation.

Product: ${a.product_description}
Merchant asking: ${a.quoted_price} ${a.quoted_currency}
Your target: ${a.suggested_local} (fair local price)
Walk-away limit: $${state.maxPrice} USD
Negotiation style: ${state.tone}

Start by greeting the merchant and making an opening counter-offer about 20-30% below the asking price. Negotiate naturally, conceding slowly. If you reach a good price, confirm the deal enthusiastically. If no progress after several rounds, thank them and leave.`;
}
