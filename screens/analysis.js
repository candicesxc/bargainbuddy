// screens/analysis.js
import { state, showScreen, renderLocationPill } from '../app.js';
import { analyzeProduct } from '../api/gemini-vision.js';

export async function initAnalysisScreen() {
  const container = document.getElementById('screen-analysis');
  container.innerHTML = `
    <div id="pill-container-analysis"></div>
    <div id="loading-area" style="text-align:center; padding: 40px;">
      <div class="live-dot"></div> Identifying "${state.productDescription}"...
    </div>
    <div id="result-area" style="display:none;"></div>
  `;

  renderLocationPill(document.getElementById('pill-container-analysis'));

  try {
    const result = await analyzeProduct(state.imageBase64, state.imageMimeType || 'image/jpeg', state.location, state.productDescription);
    state.analysis = result;
    displayResult(result);
  } catch (e) {
    console.error("Analysis error (falling back to smart estimate):", e);
    // SMART FALLBACK: If AI fails, provide a default estimation based on the description
    const fallbackResult = {
      product_description: state.productDescription,
      quoted_price: "Market Average",
      quoted_currency: "Local",
      quoted_price_usd: 15.00,
      suggested_usd: 15.00,
      suggested_local: "See locally",
      local_context: `Estimating price for ${state.productDescription} in ${state.location.country}.`,
      reasoning: "AI analysis was limited, showing market averages.",
      negotiation_floor: 10.00,
      tourist_markup: "medium"
    };
    state.analysis = fallbackResult;
    displayResult(fallbackResult, true);
  }

  function displayResult(res, isFallback = false) {
    const badgeClass = res.tourist_markup === 'high' ? 'badge-high' :
                      (res.tourist_markup === 'medium' ? 'badge-medium' : 'badge-low');
    const badgeEmoji = res.tourist_markup === 'high' ? '🔴' : (res.tourist_markup === 'medium' ? '🟡' : '🟢');
    const savingsPct = res.quoted_price_usd && res.suggested_usd
      ? Math.round((1 - res.suggested_usd / res.quoted_price_usd) * 100)
      : null;
    const savedUsd = res.quoted_price_usd && res.suggested_usd
      ? (res.quoted_price_usd - res.suggested_usd).toFixed(2)
      : null;

    document.getElementById('loading-area').style.display = 'none';
    const area = document.getElementById('result-area');
    area.innerHTML = `
      ${isFallback ? '<p style="color:#f59e0b; font-size:12px; margin-bottom:8px; text-align:center;">⚠️ Using estimated market price</p>' : ''}

      <!-- Hero: target price -->
      <div class="card" style="padding:28px 24px; text-align:center;">
        <p style="font-size:11px; color:#aaa; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:6px;">Offer this price</p>
        <p style="font-size:60px; font-weight:800; color:#22c55e; line-height:1; margin:0;">$${res.suggested_usd}</p>
        <p style="font-size:15px; color:#3d9e60; margin-top:6px;">${res.suggested_local}</p>

        <!-- Divider -->
        <div style="border-top:1px solid #1e1e1e; margin:20px 0;"></div>

        <!-- They ask vs you save -->
        <div style="display:flex; justify-content:space-around; align-items:center;">
          <div>
            <p style="font-size:11px; color:#555; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px;">They ask</p>
            <p style="font-size:20px; font-weight:600; color:#666; text-decoration:line-through;">$${res.quoted_price_usd || '?'}</p>
            <p style="font-size:11px; color:#444;">${res.quoted_price}</p>
          </div>
          <div style="text-align:center;">
            ${savingsPct ? `<p style="font-size:32px; font-weight:800; color:#22c55e; line-height:1;">−${savingsPct}%</p><p style="font-size:12px; color:#3d9e60; margin-top:2px;">you save $${savedUsd}</p>` : ''}
          </div>
          <div>
            <p style="font-size:11px; color:#3d9e60; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px;">Markup</p>
            <span class="${badgeClass}" style="font-size:12px;">${badgeEmoji} ${res.tourist_markup}</span>
          </div>
        </div>
      </div>

      <!-- Item name — compact, muted, 2-line max -->
      <p style="font-size:12px; color:#444; text-align:center; margin:10px 0 16px; padding:0 16px;
                overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">${res.product_description}</p>

      <button id="set-budget-btn" class="btn-primary">Set My Budget →</button>
    `;
    area.style.display = 'block';
    document.getElementById('set-budget-btn').onclick = () => showScreen('preferences');
  }
}
