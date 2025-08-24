// Keepa connector for Amazon price history
import axios from 'axios';
import config from '../config.js';


export async function keepaLookup(asin) {
if (!config.keepaKey) throw new Error('KEEPA_API_KEY not configured');
const url = 'https://api.keepa.com/product';
const r = await axios.get(url, { params: { key: config.keepaKey, domain: 'DE', asin } });
// Keepa returns encoded CSV arrays. Here we return current price if available.
if (!r.data || !r.data.products || !r.data.products.length) return null;
const p = r.data.products[0];
// Convert keepa price (in cents) latest new price
const lastNew = p.stats && p.stats.current ? p.stats.current : null;
// This is simplified — adapt to Keepa docs
return { vendor: 'Amazon.de', price: lastNew ? lastNew/100 : null, url: `https://www.amazon.de/dp/${asin}` };
}