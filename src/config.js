import dotenv from 'dotenv';
dotenv.config();


export default {
supabaseUrl: process.env.SUPABASE_URL,
supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
mailerApiKey: process.env.MAILERSEND_API_KEY,
mailFrom: process.env.MAIL_FROM,
alertTo: process.env.ALERT_TO,
alertPercentThreshold: parseFloat(process.env.ALERT_PERCENT_THRESHOLD || '8'),
alertAbsoluteThreshold: parseFloat(process.env.ALERT_ABSOLUTE_THRESHOLD || '20'),
priceApiKey: process.env.PRICEAPI_KEY || null,
keepaKey: process.env.KEEPA_API_KEY || null,
serpKey: process.env.SERPAPI_KEY || null,
};