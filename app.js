// app.js
import { initLocationScreen } from './screens/location.js';
import { initCaptureScreen } from './screens/capture.js';
import { initAnalysisScreen } from './screens/analysis.js';
import { initPreferencesScreen } from './screens/preferences.js';
import { initNegotiationScreen } from './screens/negotiation.js';
import { initResultScreen } from './screens/result.js';

export const state = {
  location: null,
  detectedLanguage: null,
  analysis: null,
  imageBase64: null,
  imageMimeType: null,
  productDescription: '',
  maxPrice: null,
  tone: 'friendly',
  voice: 'Puck',
  outcome: null,
  finalPrice: null,
};

export const LANGUAGES = [
  'Auto-detect',
  'Thai', 'Japanese', 'Mandarin Chinese', 'Korean',
  'Arabic', 'Moroccan Arabic (Darija)', 'Turkish', 'Hindi',
  'Vietnamese', 'Indonesian (Bahasa)', 'Khmer', 'Nepali',
  'Spanish', 'Portuguese', 'French', 'Italian',
  'German', 'Russian', 'Swahili', 'English'
];

export function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
  const activeScreen = document.getElementById(`screen-${name}`);
  activeScreen.style.display = 'block';

  // Initialize screen specific logic
  switch(name) {
    case 'location': initLocationScreen(); break;
    case 'capture': initCaptureScreen(); break;
    case 'analysis': initAnalysisScreen(); break;
    case 'preferences': initPreferencesScreen(); break;
    case 'negotiation': initNegotiationScreen(); break;
    case 'result': initResultScreen(); break;
  }
}

// Global Location Pill logic
export function renderLocationPill(container) {
  if (!state.location) return;
  const pill = document.createElement('div');
  pill.className = 'location-pill';
  pill.innerHTML = `📍 ${state.location.city || state.location.country} · ${state.detectedLanguage} ✏️`;
  pill.onclick = openLocationModal;
  container.prepend(pill);
}

function openLocationModal() {
  const modal = document.getElementById('location-modal');
  const input = document.getElementById('modal-location-input');
  const select = document.getElementById('modal-language-select');

  input.value = `${state.location.city}, ${state.location.country}`;

  select.innerHTML = '';
  LANGUAGES.forEach(lang => {
    const opt = document.createElement('option');
    opt.value = lang;
    opt.textContent = lang;
    if (lang === state.detectedLanguage) opt.selected = true;
    select.appendChild(opt);
  });

  modal.style.display = 'flex';
}

document.getElementById('modal-close-btn').onclick = () => {
  document.getElementById('location-modal').style.display = 'none';
};

document.getElementById('modal-update-btn').onclick = () => {
  const locStr = document.getElementById('modal-location-input').value;
  const lang = document.getElementById('modal-language-select').value;
  const parts = locStr.split(',').map(s => s.trim());
  state.location = { city: parts[0] || '', country: parts[1] || '' };
  state.detectedLanguage = lang;
  document.getElementById('location-modal').style.display = 'none';

  // If on analysis screen, re-run analysis
  if (document.getElementById('screen-analysis').style.display === 'block') {
    initAnalysisScreen();
  } else {
    // Just re-render current screen to update pill
    const currentScreenId = document.querySelector('.screen[style*="display: block"]').id;
    const screenName = currentScreenId.replace('screen-', '');
    showScreen(screenName);
  }
};

// Start the app
showScreen('location');
