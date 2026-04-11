// screens/result.js
import { state, showScreen } from '../app.js';

export function initResultScreen() {
  const container = document.getElementById('screen-result');
  const isDeal = state.outcome === 'deal';

  if (isDeal) {
    const saved = calculateSavings();
    container.innerHTML = `
      <div style="text-align:center; padding: 40px 0;">
        <div style="font-size: 80px;">✅</div>
        <h1 style="color:#22c55e;">Deal closed!</h1>
      </div>

      <div class="card">
        <p>You paid: <b>$${state.finalPrice} USD</b></p>
        <p style="color:#22c55e; margin-top:8px;">You saved: <b>$${saved} USD</b></p>
        <hr style="margin:16px 0; border:0; border-top:1px solid #333;">
        <p style="color:#aaa; font-size:14px;">${state.analysis.product_description} in ${state.location.city}</p>
      </div>

      <button id="shop-another-btn" class="btn-primary">🛍️ Shop another item</button>
      <button id="new-loc-btn" class="btn-secondary">📍 Change location</button>
    `;
  } else {
    container.innerHTML = `
      <div style="text-align:center; padding: 40px 0;">
        <div style="font-size: 80px;">👋</div>
        <h1>You kept your budget!</h1>
        <p style="color:#aaa; margin-top:10px;">Their best offer didn't meet your limit. Smart move.</p>
      </div>

      <button id="try-again-btn" class="btn-primary">🔄 Try again</button>
      <button id="new-item-btn" class="btn-secondary">🛍️ New item</button>
      <button id="new-loc-result-btn" class="btn-secondary">📍 New location</button>
    `;
  }

  function calculateSavings() {
    const quotedUsd = parseFloat(state.analysis.quoted_price_usd) || 0;
    const saved = Math.max(0, quotedUsd - (state.finalPrice || 0));
    return saved.toFixed(2);
  }

  if (isDeal) {
    document.getElementById('shop-another-btn').onclick = () => showScreen('capture');
    document.getElementById('new-loc-btn').onclick = () => showScreen('location');
  } else {
    document.getElementById('try-again-btn').onclick = () => showScreen('preferences');
    document.getElementById('new-item-btn').onclick = () => showScreen('capture');
    document.getElementById('new-loc-result-btn').onclick = () => showScreen('location');
  }
}
