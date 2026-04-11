// api/gemini-vision.js
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function analyzeProduct(base64Image, mimeType, location, productDescription) {
  const apiKey = window.CONFIG?.GEMINI_API_KEY || (typeof CONFIG !== 'undefined' ? CONFIG.GEMINI_API_KEY : null);
  if (!apiKey || apiKey.includes('PASTE')) {
    throw new Error("Invalid API Key. Please update config.js with your actual key from aistudio.google.com");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel(
    { model: 'gemini-2.5-flash' },
    { apiVersion: 'v1beta' }
  );

  const prompt = `You are an expert local street-market appraiser in ${location.city}, ${location.country}.
The user describes this item as: "${productDescription}"

STEP 1 — Read the price tag: Look carefully at the image for any visible price tag, price sticker, handwritten price, or label showing a price. If you can see a price in the image, extract it exactly as written and use it as "quoted_price".

STEP 2 — If no price is visible: Estimate the price a merchant in ${location.city} would first quote to a foreign tourist for this specific type of item.

STEP 3 — Determine the fair price: Based on what locals actually pay (not the tourist ask), provide "suggested_usd" as the fair market value in USD using current realistic exchange rates for ${location.country}.

Return ONLY valid JSON with no markdown or backticks:
{
  "product_description": "Detailed description of the product",
  "quoted_price": "The price shown in the image (e.g. '500 INR') or estimated tourist ask if not visible",
  "quoted_currency": "Local currency code (e.g. INR, THB, JPY)",
  "quoted_price_usd": <USD equivalent of quoted_price as a realistic number>,
  "suggested_usd": <fair local market price in USD as a realistic number>,
  "suggested_local": "Fair price in local currency (e.g. '350 INR')",
  "local_context": "One sentence about typical pricing for this item in ${location.city}.",
  "reasoning": "One sentence explaining the price difference.",
  "negotiation_floor": <absolute lowest a local vendor would accept in USD>,
  "tourist_markup": "low | medium | high"
}

IMPORTANT: All USD values must reflect real-world prices. Use current exchange rates. Do not use placeholder or example values.`;

  const result = await model.generateContent([
    { inlineData: { mimeType: mimeType || 'image/jpeg', data: base64Image } },
    { text: prompt }
  ]);

  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI returned an unreadable format. Please try again.");

  return JSON.parse(jsonMatch[0]);
}
