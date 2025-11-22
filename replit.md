# StockSense - AI Stock Analysis Platform

## Overview

StockSense is an AI-powered stock analysis platform designed to make financial data accessible to retail investors of all levels. Unlike traditional platforms that overwhelm users with technical charts and jargon, StockSense provides plain-English explanations of stock movements, financial metrics, risks, and opportunities. The platform integrates official financial data with AI-powered analysis to deliver comprehensive "stock stories" for any ticker symbol.

The application serves as an AI interpreter rather than just another dashboard, focusing on clarity and human-readable insights over technical complexity. Users can search for any stock ticker and receive a detailed analysis that includes financial metrics, AI-generated insights, price trends, recent news, and risk/opportunity assessments.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Component System**: shadcn/ui components built on Radix UI primitives
- Provides accessible, customizable components following the "New York" style variant
- Uses Tailwind CSS for styling with a custom design system
- Component library includes cards, buttons, badges, forms, dialogs, and data visualization elements

**Design Philosophy**: Hybrid approach combining Linear's clean data presentation, ChatGPT's conversational clarity, and Stripe's minimalist precision
- Single-column narrative flow instead of traditional dashboard grids
- Typography system using Inter for UI/data and Space Mono for tickers/numbers
- Generous whitespace and clear visual hierarchy
- Focus on making complexity approachable through conversational design

**Routing**: wouter (lightweight client-side routing)
- Home page with search functionality
- Stock analysis page with dynamic ticker parameter
- 404 fallback page

**State Management**: TanStack Query (React Query) for server state management
- Handles data fetching, caching, and synchronization
- 5-minute stale time for stock analysis data
- Custom query client with fetch-based data fetching

**Data Visualization**: Recharts library for stock price charts
- 30-day historical price movement visualization
- Minimal, clean chart design aligned with overall aesthetic

### Backend Architecture

**Runtime**: Node.js with Express.js framework

**Development/Production Split**:
- Development mode uses Vite middleware for hot module replacement
- Production mode serves pre-built static assets
- Separate entry points (index-dev.ts and index-prod.ts) for different environments

**API Design**: RESTful endpoints
- `/api/stock/:ticker/analysis` - Primary endpoint for comprehensive stock analysis
- Returns aggregated data from multiple sources with AI-generated insights

**Database Integration**: Optional PostgreSQL database using Drizzle ORM
- Gracefully degrades to in-memory storage when database is unavailable
- Storage abstraction layer (IStorage interface) allows swapping between DB and memory implementations
- Schema includes users and watchlist tables (future feature support)

**Database Connection**: Neon serverless PostgreSQL with WebSocket support
- Connection pooling for efficient resource usage
- Configuration via DATABASE_URL environment variable

### External Dependencies

**Financial Data APIs**:
- **Yahoo Finance (yahoo-finance2)**: Primary data source for stock quotes, financial metrics, historical prices, news, and company information
  - Real-time and historical stock quotes
  - Financial metrics (P/E ratio, EPS, beta, dividend yield, profit margins, etc.)
  - Company news and search results with specific article links
  - Business summaries and company profiles
  - 30-day historical price data

- **Finnhub API**: Real-time analyst ratings, sentiment data, and price targets
  - Analyst consensus ratings and recommendation counts
  - Price targets and upside/downside potential
  - Company news with specific article URLs
  - Historical analyst rating changes
  - Configurable via FINNHUB_API_KEY environment variable

- **NewsAPI.org**: Financial news with specific article links and sentiment analysis
  - Fresh financial news from multiple publishers
  - Direct links to full articles (not just homepages)
  - Searchable by ticker and company name
  - Configurable via NEWS_API_KEY environment variable

**AI/LLM Integration**:
- **OpenAI API**: Powers the AI analysis engine
  - Model: GPT-5 (configured as the newest model)
  - Generates plain-English summaries of stock analysis
  - Provides buy/hold/sell recommendations with confidence scores
  - Identifies risks and opportunities
  - Creates financial health assessments
  - Fallback mechanism when API key is not configured

**UI Component Libraries**:
- **Radix UI**: Headless accessible component primitives
- **shadcn/ui**: Pre-styled component collection
- **Recharts**: Charting library for data visualization
- **Lucide React**: Icon library

**Styling & Utilities**:
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **class-variance-authority**: Component variant management
- **clsx & tailwind-merge**: Conditional className utilities

**Form Management**:
- **React Hook Form**: Form state and validation
- **Zod**: Schema validation
- **@hookform/resolvers**: Integration between React Hook Form and Zod

**Development Tools**:
- **TypeScript**: Type safety across the entire application
- **Drizzle Kit**: Database migrations and schema management
- **tsx**: TypeScript execution for development server
- **esbuild**: Fast bundling for production builds
- **Replit plugins**: Development banner, error overlay, and cartographer for Replit environment

### Data Flow Architecture

1. **User searches for ticker** → Frontend search component
2. **Navigation to stock analysis page** → wouter handles routing
3. **React Query fetches data** → API request to `/api/stock/:ticker/analysis`
4. **Backend orchestrates data gathering and synthesis**:
   - Parallel requests to multiple APIs for quote, metrics, news, and analyst data
   - News sentiment analysis with positive/negative keyword detection
   - Analyst rating synthesis with price target calculations
   - Risk factor identification from latest news headlines
   - Catalyst detection from company news
   - Graceful fallback when real API keys aren't configured
   - Error handling for invalid tickers or API failures
5. **Enhanced AI analysis generation**:
   - Aggregated data with real-time analyst ratings and sentiment scores sent to OpenAI API
   - Synthesized risk data from news sentiment analysis included in prompt
   - Structured prompt requesting JSON response with specific analysis fields
   - Price signals and upside/downside potential calculations
   - News catalyst identification for forward-looking analysis
   - Fallback analysis if OpenAI is unavailable
6. **Response assembly** → Backend returns comprehensive StockAnalysisResponse
7. **Frontend rendering**:
   - Stock header with current price and change
   - AI summary card with recommendation badge
   - Metrics grid with tooltips
   - Price chart visualization
   - News list with external links
   - Risk/opportunity assessment cards

### Authentication & Session Management (Prepared but Not Active)

- Session storage configured with connect-pg-simple
- User schema defined in database
- Storage interfaces support user CRUD operations
- Currently not enforced on routes (future feature)

### Error Handling Strategy

- Graceful degradation when database is unavailable
- Specific error messages for common scenarios (404 for invalid tickers, 502 for API failures)
- User-friendly error pages with actionable messages
- Development vs production error handling differentiation

### Performance Optimizations

- React Query caching reduces redundant API calls
- Vite's fast HMR in development
- Static asset serving in production
- Parallel API calls to external services
- Stale-while-revalidate pattern for data freshness

## Recent Enhancements

### Key Metrics Section (Enhanced Nov 22, 2025)
- **Color-Coded Health Status**: Each metric now displays with visual indicators:
  - Green: Excellent/Healthy metrics (positive condition)
  - Blue: Good/Fair metrics (neutral or mixed condition)
  - Yellow: Fair/Concerning metrics (at-risk zone)
  - Red: Poor/Concerning metrics (high-risk condition)
  - Gray: Data unavailable
- **Metric Health Tooltips**: Each metric includes detailed tooltips explaining:
  - What the metric means in simple language
  - Good vs. concerning condition thresholds
  - Current value and data freshness (Q3 2025 for quarterly data)
- **Latest Quarterly Data**: All metrics display the most recent quarterly information from the current year
- **Beginner-Friendly Explanations**: Each metric tooltip includes clear guidance on interpreting good vs. bad conditions with specific threshold examples

### Risk Assessment Section (Enhanced Nov 22, 2025)
- **Enhanced Sentiment Analysis**: Uses 20+ financial keywords for more accurate market sentiment detection
- **Real-Time Analyst Integration**: Pulls live analyst ratings, price targets, and consensus from Finnhub API
- **Comprehensive Risk Factors**: Identifies risks from:
  - Recent news sentiment (positive vs. negative headlines)
  - Analyst ratings (strong sell to strong buy consensus)
  - Price targets with specific upside/downside calculations
  - Market catalysts (earnings, product launches, acquisitions, etc.)
- **Price Signal Detection**: Calculates analyst upside potential and momentum indicators
- **Improved Confidence Scoring**: Confidence metric reflects data availability and source alignment
- **Data-Backed Recommendations**: All risk/opportunity assessments include specific metrics, sources, and data references

## API Integration & Setup

### For Optimal Real-Time Performance

To access full real-time analyst ratings and enhanced news sentiment analysis, configure the following environment variables:

- **FINNHUB_API_KEY**: Enables real-time analyst ratings, price targets, and consensus data
  - Free tier available at https://finnhub.io
  - Essential for risk assessment accuracy
  
- **OPENAI_API_KEY**: Enables AI-powered analysis generation
  - Required for detailed risk/opportunity reasoning and recommendations
  - Falls back to demo analysis if not configured

- **NEWS_API_KEY** (Optional): Enables broader financial news coverage
  - Free tier at https://newsapi.org
  - Complements Finnhub news with additional sources

### Fallback Behavior

When API keys are not configured, the system gracefully falls back to:
- Demo analyst consensus data
- Pre-cached news articles with sentiment analysis
- Template-based AI recommendations

This ensures the platform remains functional for educational/demo purposes while encouraging users to configure API keys for production use.