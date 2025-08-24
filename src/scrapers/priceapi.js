// PriceAPI connector (schematic) — use your PriceAPI token
import axios from 'axios';
import config from '../config.js';


export async function priceapiSearch(query) {
if (!config.priceApiKey) throw new Error('PRICEAPI_KEY not configured');
// Example endpoint (PriceAPI docs: adapt to actual path)
const url = `https://api.priceapi.com/products?token=${config.priceApiKey}&country=at&source=geizhals&key=${encodeURIComponent(query)}`;
const r = await axios.get(url);
// Normalise response: return vendor, price, url
// NOTE: You must adapt property names to PriceAPI response
const hits = r.data.products || r.data.results || [];
if (!hits.length) return null;
const first = hits[0];
return { vendor: first.vendor || first.source || 'geizhals', price: Number(first.price || first.offers?.[0]?.price || null), url: first.url || first.link };
}