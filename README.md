# BargainBuddy 🛍️

Your AI-powered market negotiation companion. Point it at a price tag, and it haggles for you — in the local language.

🔗 **[Try it live → candiceshen.com/bargainbuddy](https://candiceshen.com/bargainbuddy/)**

Built for the **Google x Yale Hackathon 2026**.

---

## How it works

Traveling abroad and not sure if you're getting ripped off at the market? BargainBuddy has you covered:

1. **Snap a photo** of the product and price tag
2. **Get an instant analysis** — fair market price, tourist markup rating, and suggested offer in both local currency and USD
3. **Go live** — the AI negotiates out loud with the merchant in their language, narrating every merchant response back to you in English in real time

No language skills required. Point, analyze, negotiate.

---

## Powered by Google AI

| Feature | Google Product |
|---|---|
| Price tag reading & market analysis | **Gemini 2.5 Flash** (vision + structured JSON output) |
| Live voice negotiation | **Gemini 2.5 Flash Native Audio** via Multimodal Live API (WebSocket) |
| Demo video & presentation | **NotebookLM** |

---

## Run locally

Serve `index.html` with any static server:

```bash
python3 -m http.server 3001
```

Open `http://localhost:3001`, then create a `config.js` next to `index.html`:

```js
var CONFIG = {
  GEMINI_API_KEY: 'your-key-here'
};
```

`config.js` is gitignored — your key stays local.

---

## Team

| Name | GitHub |
|---|---|
| Candice Shen | [@candicesxc](https://github.com/candicesxc) |
| Nina Chung | [@ninaychung](https://github.com/ninaychung) |
| Yuan Lee | |
| Rajat Garg | |

---

## Tech

Single-file vanilla JS — no build step, no framework, no dependencies. Just `index.html` and a Gemini API key.
