// screens/location.js
import { state, showScreen, LANGUAGES } from '../app.js';

const COUNTRY_LANGUAGE_MAP = {
  'Thailand': 'Thai', 'Japan': 'Japanese', 'China': 'Mandarin Chinese',
  'Taiwan': 'Mandarin Chinese', 'South Korea': 'Korean',
  'Morocco': 'Moroccan Arabic (Darija)', 'Egypt': 'Arabic',
  'Turkey': 'Turkish', 'India': 'Hindi', 'Vietnam': 'Vietnamese',
  'Indonesia': 'Indonesian (Bahasa)', 'Cambodia': 'Khmer',
  'Nepal': 'Nepali', 'Mexico': 'Spanish', 'Peru': 'Spanish',
  'Colombia': 'Spanish', 'Brazil': 'Portuguese', 'Portugal': 'Portuguese',
  'France': 'French', 'Italy': 'Italian', 'Germany': 'German',
  'Russia': 'Russian', 'Kenya': 'Swahili', 'Tanzania': 'Swahili',
};

export function initLocationScreen() {
  const container = document.getElementById('screen-location');
  container.innerHTML = `
    <h1>📍 Where are you shopping?</h1>
    <input type="text" id="location-input" placeholder="Bangkok, Thailand">
    
    <h1 style="margin-top:20px;">🗣️ Merchant language:</h1>
    <select id="language-select"></select>

    <button id="start-btn" class="btn-primary">Let's Shop! →</button>
  `;

  const input = document.getElementById('location-input');
  const select = document.getElementById('language-select');

  LANGUAGES.forEach(lang => {
    const opt = document.createElement('option');
    opt.value = lang;
    opt.textContent = lang;
    select.appendChild(opt);
  });

  // Set default before GPS attempt
  input.value = 'Mumbai, India';
  select.value = 'Hindi';

  input.oninput = () => {
    const val = input.value;
    for (const [country, lang] of Object.entries(COUNTRY_LANGUAGE_MAP)) {
      if (val.toLowerCase().includes(country.toLowerCase())) {
        select.value = lang;
        break;
      }
    }
  };

  document.getElementById('start-btn').onclick = () => {
    const locStr = input.value;
    const parts = locStr.split(',').map(s => s.trim());
    state.location = { city: parts[0] || '', country: parts[1] || '' };
    state.detectedLanguage = select.value;
    showScreen('capture');
  };

  tryGPS().then(loc => {
    if (loc) {
      input.value = `${loc.city}, ${loc.country}`;
      input.dispatchEvent(new Event('input'));
    }
  });
}

async function tryGPS() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          resolve({
            city: data.address.city || data.address.town || data.address.village || '',
            country: data.address.country || ''
          });
        } catch (e) { resolve(null); }
      },
      () => resolve(null),
      { timeout: 5000 }
    );
  });
}
