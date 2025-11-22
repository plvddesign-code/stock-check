# StockSense - Vercel Deployment Guide

## Overview

StockSense is production-ready and fully configured for deployment on Vercel. The project includes serverless function configuration and all necessary environment setup.

## Pre-Deployment Checklist

✓ Build: Production build generated and tested (828KB total)
✓ Configuration: vercel.json configured for Node.js runtime
✓ Environment: All secrets protected in .gitignore
✓ Code: TypeScript compiled, dependencies bundled

## Step 1: Push to GitHub

First, push your project to GitHub from the Replit Shell:

```bash
# Configure git (if not already done)
git config user.email "your-email@example.com"
git config user.name "Your Name"

# Stage and commit changes
git add .
git commit -m "Prepare project for Vercel deployment"

# Push to GitHub
git push -u origin main
```

## Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "Add New" → "Project"
4. Select your `stock-check` repository
5. Click "Import"

## Step 3: Configure Environment Variables

In the Vercel project settings, add these environment variables:

### Required
- `OPENAI_API_KEY` - Your OpenAI API key for AI analysis
  - Get from: https://platform.openai.com/api-keys

### Optional (for enhanced features)
- `FINNHUB_API_KEY` - For real-time analyst ratings
  - Get from: https://finnhub.io (free tier available)
- `DATABASE_URL` - PostgreSQL connection string (optional)
  - Uses in-memory storage if not provided
- `SESSION_SECRET` - Session encryption key (auto-generated if not provided)

### Example Environment Setup

```
OPENAI_API_KEY=sk-xxx...
FINNHUB_API_KEY=your_finnhub_key
DATABASE_URL=postgresql://...
SESSION_SECRET=your_secret_key
```

## Step 4: Deploy

1. After adding environment variables, click "Deploy"
2. Vercel will automatically:
   - Build your project (`npm run build`)
   - Bundle the server (`dist/index.js`)
   - Deploy to global CDN
3. Monitor deployment in the "Deployments" tab

Your site will be live at: `https://your-project.vercel.app`

## Features Included

✓ **Smart Stock Search** - Autocomplete for tickers and company names
✓ **AI Analysis** - Buy/Hold/Sell recommendations with reasoning
✓ **Price Charts** - Interactive 30-day historical data
✓ **Key Metrics** - Color-coded financial indicators with tooltips
✓ **News Section** - Formatted publication dates (e.g., "22 November 2025 • 14:30")
✓ **Risk Assessment** - Data-backed risk and opportunity analysis
✓ **Dark Mode** - Full theme support

## Build Configuration

The project uses:
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Build Tool**: Vite (frontend) + esbuild (backend)
- **Database**: Optional PostgreSQL with Drizzle ORM

Build output: `dist/` folder
- `dist/index.js` - Bundled Node.js server (57KB)
- `dist/public/` - Static frontend assets

## Production Notes

### Performance
- React Query caching (5-minute stale time)
- Optimized static asset serving
- Parallel API calls to data sources
- Gzip compression enabled

### Fallback Behavior
When API keys are unavailable, the app gracefully falls back to:
- Demo analyst consensus data
- Cached news articles
- Template-based recommendations

### Error Handling
- Specific error messages for invalid tickers (404)
- Graceful degradation when APIs are unavailable
- User-friendly error pages

## Vercel-Specific Configuration

The `vercel.json` file configures:
- Node.js runtime for server execution
- Build command: `npm run build`
- Dev command: `npm run dev`
- Routes: `/api/*` and `/*` all directed to the Express server
- Environment: `NODE_ENV=production`

## Custom Domain

To use a custom domain:
1. In Vercel project settings, click "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions
4. SSL certificate auto-provisioned

## Monitoring & Logs

Monitor your deployment:
- **Vercel Dashboard** - Real-time deployment status
- **Logs** - View build and runtime logs
- **Analytics** - Monitor usage and performance
- **Functions** - Track serverless function metrics

## Troubleshooting

### Build Fails
Check that all environment variables are set in Vercel settings, not just locally.

### API Calls Return Errors
Verify API keys are correctly set in environment variables:
- OPENAI_API_KEY must be valid
- FINNHUB_API_KEY (optional) for analyst ratings

### Blank Page on Load
Check browser console and Vercel function logs for errors.

## Support

For Vercel-specific issues: https://vercel.com/docs
For StockSense issues: Check GitHub issues or contact support

---

**Deployment Status**: ✓ Ready for Production
**Last Updated**: November 22, 2025
**Node.js Version**: 18+ (Vercel standard)
**Build Time**: ~25 seconds
