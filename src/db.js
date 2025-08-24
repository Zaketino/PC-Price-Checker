import { createClient } from '@supabase/supabase-js';
import config from './config.js';


let supabase = null;
if (config.supabaseUrl && config.supabaseServiceKey) {
supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, { auth: { persistSession: false } });
} else {
console.warn('Supabase not configured, falling back to in-memory store (non-persistent)');
}


const memory = { items: {}, prices: [] };


export async function upsertItem(item) {
if (!supabase) {
memory.items[item.id] = item; return item;
}
const { data, error } = await supabase.from('items').upsert(item).select();
if (error) throw error;
return data[0];
}


export async function insertPrice(row) {
if (!supabase) {
memory.prices.push(row); return row;
}
const { data, error } = await supabase.from('prices').insert(row).select();
if (error) throw error;
return data[0];
}


export async function getLatestPrice(itemId) {
if (!supabase) {
const ps = memory.prices.filter(p => p.item_id === itemId);
if (!ps.length) return null;
return ps.reduce((a,b) => new Date(a.fetched_at) > new Date(b.fetched_at) ? a : b);
}
const { data, error } = await supabase.from('latest_prices').select('*').eq('item_id', itemId).limit(1);
if (error) throw error;
return data && data[0] ? data[0] : null;
}


export async function fetchItems() {
if (!supabase) return Object.values(memory.items);
const { data, error } = await supabase.from('items').select('*');
if (error) throw error;
return data;
}


export async function insertAlert(row) {
if (!supabase) { console.log('alert:', row); return row; }
const { data, error } = await supabase.from('alerts').insert(row).select();
if (error) throw error;
return data[0];
}


export { supabase };