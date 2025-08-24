#!/usr/bin/env node
// Orchestrator used by GitHub Actions. Loads items from SUPABASE `items` table (or WATCHER_ITEMS env) and checks prices.
import config from './config.js';
import { upsertItem, insertPrice, getLatestPrice, fetchItems, insertAlert } from './db.js';
import { priceapiSearch } from './scrapers/priceapi.js';
import { keepaLookup } from './scrapers/keepa.js';
import { serpSearch } from './scrapers/serpapi.js';
import { fetchHtmlPrice } from './scrapers/html.js';
import { sendEmail } from './email.js';


const WATCHER_ITEMS = process.env.WATCHER_ITEMS ? JSON.parse(process.env.WATCHER_ITEMS) : null;


function nowISO() { return new Date().toISOString(); }


async function resolvePriceForQuery(q) {
// q is an object { type: 'priceapi'|'keepa'|'serp'|'html', q: 'string' or asin or {url, selector} }
try {
if (q.type === 'priceapi') return await priceapiSearch(q.q);
if (q.type === 'keepa') return await keepaLookup(q.asin);
if (q.type === 'serp') return await serpSearch(q.q);
if (q.type === 'html') return await fetchHtmlPrice(q.url, q.selector);
} catch (e) {
console.log('resolver error', e.message);
}
return null;
}


async function inspectItem(item) {
console.log('Checking', item.id, item.label);
// ensure item exists in DB
await upsertItem({ id: item.id, label: item.label, meta: item.meta || {} });
// iterate queries
let best = null;
for (const q of (item.queries || [])) {
const got = await resolvePriceForQuery(q);
if (!got || !got.price) continue;
if (!best || got.price < best.price) best = got;
}
if (!best) {
console.log('No price found for', item.id); return null;
}
const row = { item_id: item.id, vendor: best.vendor || 'unknown', price: best.price, currency: 'EUR', url: best.url || null, fetched_at: nowISO() };
const saved = await insertPrice(row);
// compare with latest price before this check
const latestBefore = await getLatestPrice(item.id);
if (latestBefore && latestBefore.price) {
const oldPrice = Number(latestBefore.price);
const newPrice = Number(row.price);
const percent = oldPrice ? Math.round(((oldPrice - newPrice) / oldPrice) * 100) : 0;
const abs = oldPrice - newPrice;
if (percent >= config.alertPercentThreshold || abs >= config.alertAbsoluteThreshold) {
const subject = `Price alert: ${item.label} now €${newPrice} (${percent}% down)`;
const html = `<p><strong>${item.label}</strong> is now <b>€${newPrice}</b> at ${row.vendor} (<a href='${row.url}'>link</a>)</p><p>Prev: €${oldPrice} (-${percent}%)</p>`;
await sendEmail(config.alertTo, subject, html);
await insertAlert({ item_id: item.id, old_price: oldPrice, new_price: newPrice, rule: { percent, abs }, triggered_at: nowISO() });
console.log('Alert sent for', item.id);
}
}
return saved;
}


async function main() {
console.log('pc-price-watcher starting');
let items = [];
if (WATCHER_ITEMS) items = WATCHER_ITEMS;
else items = await fetchItems();
if (!items || !items.length) {
// Provide a default demo list (your parts)
items = [
{ id: 'ryzen-7-9800x3d', label: 'AMD Ryzen 7 9800X3D', queries: [ { type: 'priceapi', q: 'AMD Ryzen 7 9800X3D' }, { type: 'serp', q: 'AMD Ryzen 7 9800X3D price Austria' } ] },
{ id: 'rx-9070-hellhound', label: 'PowerColor Hellhound RX 9070 16GB', queries: [ { type: 'priceapi', q: 'PowerColor Hellhound RX 9070 16GB' }, { type: 'serp', q: 'PowerColor Hellhound RX 9070 price' } ] }
];
}


for (const item of items) {
try { await inspectItem(item); } catch (e) { console.error('inspect error', e.message); }
}
console.log('Done');
}


if (process.argv[1] && process.argv[1].endsWith('run-scrape.js')) {
main().catch(err => { console.error(err); process.exit(1); });
}


export default main;