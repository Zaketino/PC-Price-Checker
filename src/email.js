import fetch from 'node-fetch';
import config from './config.js';


export async function sendEmail(to, subject, html) {
if (!config.mailerApiKey) {
console.log('[email] simulated:', to, subject); return { simulated: true };
}
const res = await fetch('https://api.mailersend.com/v1/email', {
method: 'POST',
headers: {
Authorization: `Bearer ${config.mailerApiKey}`,
'Content-Type': 'application/json'
},
body: JSON.stringify({
from: { email: config.mailFrom },
to: [{ email: to }],
subject,
html
})
});
const data = await res.json();
if (!res.ok) throw new Error(JSON.stringify(data));
return data;
}