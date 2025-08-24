// SerpApi Google Shopping connector (requires serpApi key)
import axios from 'axios';
import config from '../config.js';


export async function serpSearch(query) {
if (!config.serpKey) throw new Error('SERPAPI_KEY not configured');
const url = 'https://serpapi.com/search.json';
const r = await axios.get(url, { params: { q: query, engine: 'google_shopping', api_key: config.serpKey, location: 'Austria' } });
const shopping = r.data.shopping_results || [];
if (!shopping.length) return null;
const first = shopping[0];
return { vendor: first.merchant_name || first.source, price: Number(first.price?.replace(/[^0-9.]/g, '')) || null, url: first.link };
}