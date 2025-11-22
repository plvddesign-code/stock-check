# StockSense - AI-Powered Stock Analysis Platform

## Overview

StockSense makes stock analysis accessible to everyone. Search any stock ticker and get plain-English explanations of price movements, financial metrics, risks, and opportunities—powered by AI and real-time financial data.

Unlike traditional dashboards that overwhelm with technical jargon, StockSense focuses on clarity: what a stock does, why it matters, and whether it's worth buying.

## Features

- **Smart Stock Search** - Search by ticker symbol or company name with autocomplete
- **AI Analysis** - Get Buy/Hold/Sell recommendations with detailed reasoning
- **Price Charts** - Interactive 30-day historical price data with time period filters (1D, 5D, 1M, 6M, 1Y)
- **Key Metrics** - Color-coded financial indicators (P/E ratio, EPS, dividend yield, etc.) with beginner-friendly tooltips
- **News Section** - Recent company news with formatted publication dates
- **Risk Assessment** - Data-backed risk and opportunity analysis
- **Dark Mode** - Full theme support for comfortable viewing

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5000
```

### Production Build

```bash
# Build the project
npm run build

# Start production server
npm start
```

## Deployment

### Deploy to Vercel (Recommended)

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for step-by-step instructions.

**Quick summary:**
1. Push to GitHub
2. Connect GitHub repo to Vercel
3. Add environment variables
4. Deploy with one click

### Deploy to Replit

Click the **Publish** button in Replit to deploy directly.

### Deploy Anywhere

The project builds to a standard Node.js server. Deploy with:
- Heroku
- Railway
- Fly.io
- Docker
- Any Node.js hosting

## Environment Variables

### Required
- `OPENAI_API_KEY` - OpenAI API key for AI analysis

### Optional
- `FINNHUB_API_KEY` - Analyst ratings and price targets
- `DATABASE_URL` - PostgreSQL connection (uses in-memory storage if not set)
- `SESSION_SECRET` - Session encryption key

## Technology Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- shadcn/ui (components)
- Recharts (charting)
- TanStack Query (data fetching)

### Backend
- Express.js
- Node.js
- Drizzle ORM (database)
- PostgreSQL (optional)

### APIs
- Yahoo Finance - Stock data, quotes, metrics, news
- OpenAI - AI analysis generation
- Finnhub - Analyst ratings (optional)

## Project Structure

```
├── client/                 # Frontend React app
│   └── src/
│       ├── pages/         # Page components
│       ├── components/    # Reusable UI components
│       └── App.tsx        # Main app
├── server/                # Backend Express server
│   ├── routes.ts          # API routes
│   ├── services/          # External API integrations
│   ├── app.ts             # Express app setup
│   └── index-prod.ts      # Production entry point
├── shared/                # Shared types and schemas
├── dist/                  # Production build output
└── vercel.json           # Vercel deployment config
```

## API Endpoints

### Stock Analysis
- `GET /api/stock/:ticker/analysis` - Get complete stock analysis
- `GET /api/search?q=:query` - Search for stocks by ticker or company name

## Configuration Files

- **vercel.json** - Vercel deployment configuration
- **.vercelignore** - Files to exclude from Vercel builds
- **.gitignore** - Git ignore rules (excludes .env, sensitive files)
- **vite.config.ts** - Frontend build configuration
- **tailwind.config.ts** - Tailwind CSS configuration

## Build Information

- **Build Date**: November 22, 2025
- **Build Status**: ✓ Production Ready
- **Frontend**: Vite compiled (689KB JS, 82KB CSS)
- **Backend**: esbuild bundled (57KB)
- **Total Size**: 828KB

## Error Handling

The app gracefully handles errors:
- Invalid stock tickers show a helpful 404 error
- Missing API keys fallback to demo analysis
- Network failures display user-friendly messages

## Performance

- **React Query Caching** - 5-minute cache for stock data
- **Static Asset Serving** - Vite optimized CSS and JS
- **Parallel API Calls** - Concurrent data fetching
- **Code Splitting** - Only load needed code per route

## Development Guidelines

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed development setup.

## Contributing

This is a personal project. Feel free to fork and customize!

## License

MIT

## Support

- **Issues**: Check GitHub issues
- **Documentation**: See VERCEL_DEPLOYMENT.md for deployment help
- **Questions**: Review the code or contact the developer

---

**Status**: ✓ Production Ready | **Last Updated**: November 22, 2025
