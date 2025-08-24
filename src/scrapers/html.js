import axios from 'axios';
import cheerio from 'cheerio';


export async function fetchHtmlPrice(url, selector) {
const r = await axios.get(url, { headers: { 'User-Agent': 'pc-price-watcher/1.0' }, timeout: 15000 });
const $ = cheerio.load(r.data);
const raw = $(selector).first().text().trim();
const p = raw.replace(/[^0-9,\.]/g, '').replace(',', '.');
const price = parseFloat(p);
if (Number.isNaN(price)) return null;
return { vendor: new URL(url).hostname, price, url };
}