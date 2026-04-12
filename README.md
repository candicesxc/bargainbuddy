# BargainBuddy 🛍️

Your AI-powered market negotiation companion. Point it at a price tag, and it haggles for you — in the local language.

Built for the Google AI Hackathon by **Fair Slice**.

---

## What it does

Traveling abroad and not sure if you're getting ripped off at the market? BargainBuddy has you covered:

1. **Snap a photo** of the product and price tag
2. **Get an instant analysis** — fair market price, tourist markup rating, and suggested offer
3. **Go live** — the AI negotiates out loud with the merchant in their language while narrating prices back to you in English

No language skills required.

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

## Deploy to GitHub Pages

1. Fork this repo
2. Go to **Settings → Secrets and variables → Actions**
3. Add a secret named `GEMINI_API_KEY` with your Gemini API key
4. Go to **Settings → Pages** → set source to **Deploy from a branch** → branch: `gh-pages`
5. Push to `main` — the GitHub Action injects the key and deploys automatically

---

## Tech

Single-file vanilla JS — no build step, no framework, no dependencies. Just `index.html` and a Gemini API key.
