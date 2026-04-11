// screens/negotiation.js
import { state, showScreen, renderLocationPill } from '../app.js';
import { startNegotiation } from '../api/gemini-live.js';

export async function initNegotiationScreen() {
  const container = document.getElementById('screen-negotiation');
  container.innerHTML = `
    <div id="pill-container-neg"></div>
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
       <span>Negotiating in ${state.detectedLanguage}...</span>
       <span><span class="live-dot"></span> LIVE</span>
    </div>

    <div id="transcript-box" class="transcript">
      <p id="initial-msg" style="color:#22c55e; font-style:italic;">AI is starting the negotiation...</p>
    </div>

    <div style="display:flex; gap:8px; margin-top:16px;">
      <button id="deal-btn" class="btn-primary" style="flex:1;">✅ Accept Deal</button>
      <button id="walkaway-btn" class="btn-secondary" style="flex:1;">👋 Walk Away</button>
    </div>
    <div style="display:flex; gap:8px; margin-top:8px;">
      <button id="mute-btn" class="btn-secondary" style="flex:1;">🔇 Mute</button>
      <button id="stop-neg-btn" class="btn-danger" style="flex:1;">✕ Stop</button>
    </div>

    <div style="margin-top:12px;">
      <label style="font-size:13px; color:#aaa;">Final price if accepting deal ($USD)</label>
      <input type="number" id="final-price-input" step="0.50"
        value="${state.maxPrice || state.analysis?.suggested_usd || ''}"
        style="margin-top:4px;">
    </div>
  `;

  renderLocationPill(document.getElementById('pill-container-neg'));

  const transcriptBox = document.getElementById('transcript-box');
  let isMuted = false;
  let firstMessage = true;
  let sessionDone = false;

  function appendTranscript(text) {
    if (firstMessage) {
      transcriptBox.innerHTML = '';
      firstMessage = false;
    }
    const p = document.createElement('p');
    p.style.marginBottom = '12px';
    p.innerHTML = `<b style="color:#22c55e;">BargainBuddy:</b> ${text}`;
    transcriptBox.appendChild(p);
    transcriptBox.scrollTop = transcriptBox.scrollHeight;
  }

  function finishSession(outcome, finalPrice) {
    if (sessionDone) return;
    sessionDone = true;
    state.outcome = outcome;
    state.finalPrice = finalPrice;
    showScreen('result');
  }

  const negotiation = await startNegotiation(state, appendTranscript, finishSession);

  document.getElementById('deal-btn').onclick = () => {
    const price = parseFloat(document.getElementById('final-price-input').value) || state.maxPrice;
    negotiation.stop();
    finishSession('deal', price);
  };

  document.getElementById('walkaway-btn').onclick = () => {
    negotiation.stop();
    finishSession('walkaway', null);
  };

  document.getElementById('mute-btn').onclick = (e) => {
    isMuted = !isMuted;
    negotiation.mute(isMuted);
    e.target.textContent = isMuted ? '🔊 Unmute' : '🔇 Mute';
  };

  document.getElementById('stop-neg-btn').onclick = () => {
    negotiation.stop();
    showScreen('location');
  };
}
