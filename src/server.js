// Optional minimal Express server (useful for local testing and exposing a manual trigger endpoint if you deploy a serverless function)
import express from 'express';
import main from './run-scrape.js';
const app = express();
app.use(express.json());
app.get('/', (req, res) => res.send('<h1>PC Price Watcher</h1><p>Use POST /trigger to run a check.</p>'));
app.post('/trigger', async (req, res) => {
try {
await main();
res.json({ ok: true });
} catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('listening on', PORT));