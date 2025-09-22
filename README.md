# 🚀 Xact - Twitter Trend Analyzer

A Next.js app that analyzes Twitter trends using Sentient AI to provide actionable insights and tweet suggestions.

## Features

- **Trend Analysis**: Analyze Twitter trends for any keyword
- **AI-Powered Insights**: Uses Sentient AI for intelligent analysis
- **Tweet Suggestions**: Get ready-to-use tweet drafts
- **Keyword Recommendations**: Top hashtags and keywords to use now

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Copy `env.example` to `.env.local` and fill in your API keys:
   ```bash
   cp env.example .env.local
   ```

   Required:
   - `TWITTER_BEARER_TOKEN`: Your Twitter API Bearer Token
   - `SENTIENT_API_KEY`: Your Sentient AI API key

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open** [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

- `POST /api/analyze` - Analyze Twitter trends for a keyword
- `GET /api/auth` - Twitter OAuth (TODO)

## Next Steps

- [ ] Implement Twitter OAuth2 authentication
- [ ] Add real-time streaming with WebSockets
- [ ] Enhanced analytics (velocity, sentiment, token co-occurrence)
- [ ] User dashboard with saved analyses
- [ ] Export functionality for insights

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **APIs**: Twitter API v2, Sentient AI
- **Deployment**: Vercel (recommended)
