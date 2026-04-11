// screens/preferences.js
import { state, showScreen, renderLocationPill } from '../app.js';

export function initPreferencesScreen() {
  const container = document.getElementById('screen-preferences');
  container.innerHTML = `
    <div id="pill-container-prefs"></div>
    <h1>Negotiation Rules</h1>
    
    <div class="card">
      <label>Walk away if price stays above</label>
      <div style="display:flex; align-items:center; gap:8px;">
        <span>$</span>
        <input type="number" id="max-price" step="0.50" value="${state.analysis?.suggested_usd || ''}">
      </div>
    </div>

    <div class="card">
      <label>Negotiation Tone</label>
      <div class="tone-group">
        <button class="tone-btn ${state.tone === 'aggressive' ? 'active' : ''}" data-tone="aggressive">Aggressive</button>
        <button class="tone-btn ${state.tone === 'friendly' ? 'active' : ''}" data-tone="friendly">Friendly</button>
        <button class="tone-btn ${state.tone === 'neutral' ? 'active' : ''}" data-tone="neutral">Neutral</button>
      </div>
    </div>

    <div class="card">
      <label>AI Voice</label>
      <select id="voice-select">
        <option value="Puck">Puck (Default)</option>
        <option value="Charon">Charon</option>
        <option value="Kore">Kore</option>
        <option value="Fenrir">Fenrir</option>
        <option value="Aoede">Aoede</option>
      </select>
    </div>

    <p style="font-size: 13px; color: #aaa; text-align: center;">🗣️ AI will negotiate in: <b>${state.detectedLanguage}</b></p>

    <button id="start-neg-btn" class="btn-primary">Start Negotiating →</button>
  `;

  renderLocationPill(document.getElementById('pill-container-prefs'));

  const voiceSelect = document.getElementById('voice-select');
  voiceSelect.value = state.voice;

  document.querySelectorAll('.tone-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.tone-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.tone = btn.dataset.tone;
    };
  });

  document.getElementById('start-neg-btn').onclick = () => {
    state.maxPrice = parseFloat(document.getElementById('max-price').value);
    state.voice = voiceSelect.value;
    showScreen('negotiation');
  };
}
