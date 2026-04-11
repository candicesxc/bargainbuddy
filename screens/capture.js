// screens/capture.js
import { state, showScreen, renderLocationPill } from '../app.js';

export function initCaptureScreen() {
  const container = document.getElementById('screen-capture');
  container.innerHTML = `
    <div id="pill-container"></div>
    <h1>Upload Product Photo</h1>
    <p style="color: #aaa; font-size: 14px; margin-bottom: 20px;">
      Please upload a photo of the item you're looking at.
    </p>

    <div class="card">
      <label>Describe the product briefly</label>
      <input type="text" id="product-desc-input" placeholder="e.g. Blue silk scarf, wooden elephant statue">
    </div>
    
    <button id="upload-btn" class="btn-primary">📁 Choose Photo</button>
    <input type="file" id="upload-input" accept="image/*" style="display:none;">

    <div id="preview-area" style="display:none; margin-top: 20px;">
      <img id="capture-preview" class="preview-img">
      <button id="looks-good-btn" class="btn-primary">Analyze This →</button>
      <button id="retake-btn" class="btn-secondary">Remove Photo</button>
    </div>
  `;

  renderLocationPill(document.getElementById('pill-container'));

  const uploadBtn = document.getElementById('upload-btn');
  const uploadInput = document.getElementById('upload-input');
  const descInput = document.getElementById('product-desc-input');
  const previewArea = document.getElementById('preview-area');
  const previewImg = document.getElementById('capture-preview');

  uploadBtn.onclick = () => uploadInput.click();
  uploadInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    state.imageMimeType = file.type || 'image/jpeg';
    reader.onload = (event) => showPreview(event.target.result);
    reader.readAsDataURL(file);
  };

  function showPreview(base64) {
    state.imageBase64 = base64.split(',')[1];
    previewImg.src = base64;
    previewArea.style.display = 'block';
    uploadBtn.style.display = 'none';
  }

  document.getElementById('retake-btn').onclick = () => {
    state.imageBase64 = null;
    previewArea.style.display = 'none';
    uploadBtn.style.display = 'block';
    uploadInput.value = '';
  };

  document.getElementById('looks-good-btn').onclick = () => {
    const desc = descInput.value.trim();
    if (!desc) {
      alert("Please provide a brief description of the product.");
      return;
    }
    if (!state.imageBase64) {
      alert("Please upload a photo first.");
      return;
    }
    state.productDescription = desc;
    showScreen('analysis');
  };
}
