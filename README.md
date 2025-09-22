# 🚀 Xact - Twitter Trend Analyzer

A Next.js app that analyzes Twitter trends using Fireworks AI (Kimi K2 Instruct) to provide actionable insights and tweet suggestions. Users connect their own Twitter API keys while benefiting from AI-powered analysis.

## Features

- **User-Controlled Twitter Access**: Users provide their own Twitter API keys
- **AI-Powered Insights**: Uses Fireworks AI (Kimi K2 Instruct) for intelligent trend analysis
- **Tweet Suggestions**: Get ready-to-use tweet drafts
- **Keyword Recommendations**: Top hashtags and keywords to use now
- **Secure**: User API keys stored locally in browser
- **No Data Storage**: Your Twitter data stays private

## How It Works

1. **User connects their Twitter API**: Users input their own Twitter Bearer Token
2. **AI Analysis**: Fireworks AI (Kimi K2 Instruct) analyzes the Twitter data and provides insights
3. **Actionable Results**: Get keywords, tweet drafts, and explanations

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Copy `env.example` to `.env.local` and add your Fireworks API key:
   ```bash
   cp env.example .env.local
   ```

   Required:
   - `FIREWORKS_API_KEY`: Your Fireworks AI API key (for the AI analysis service)

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open** [http://localhost:3000](http://localhost:3000) in your browser.

## For Users

To use Xact, you'll need:
1. A Twitter Developer Account
2. A Twitter Bearer Token from the [Twitter Developer Portal](https://developer.twitter.com)
3. Enter your token in the app to start analyzing trends

## API Endpoints

- `POST /api/analyze` - Analyze Twitter trends (requires user's Twitter token)
- `GET /api/auth` - Twitter OAuth (TODO)

## Privacy & Security

- ✅ User Twitter API keys are stored locally in browser
- ✅ No server-side storage of user credentials
- ✅ Users control their own Twitter data access
- ✅ Only analysis results are processed by Fireworks AI

## Next Steps

- [ ] Implement Twitter OAuth2 authentication
- [ ] Add real-time streaming with WebSockets
- [ ] Enhanced analytics (velocity, sentiment, token co-occurrence)
- [ ] User dashboard with saved analyses
- [ ] Export functionality for insights

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **APIs**: Twitter API v2 (user-provided), Fireworks AI (service-provided)
- **Deployment**: Vercel (recommended)
