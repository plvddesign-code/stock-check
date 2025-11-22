# Design Guidelines: AI Stock Analysis Platform

## Design Approach

**Selected Framework**: Hybrid approach combining Linear's clean data presentation + ChatGPT's conversational clarity + Stripe's minimalist precision

**Core Principle**: Make complexity approachable through clear hierarchy, generous whitespace, and conversational flow. This is NOT a traditional dashboard - it's an AI companion that tells stories through data.

## Typography System

**Font Stack**: 
- Primary: Inter (Google Fonts) for UI and data
- Accent: Space Mono (Google Fonts) for stock tickers and numerical highlights

**Hierarchy**:
- Hero/Page titles: text-4xl to text-5xl, font-semibold
- Section headers: text-2xl to text-3xl, font-semibold
- Stock ticker: text-6xl to text-7xl, font-bold, Space Mono
- Body text: text-base, font-normal, leading-relaxed
- Data labels: text-sm, font-medium, uppercase tracking-wide
- Metrics/numbers: text-xl to text-2xl, font-semibold, Space Mono
- AI explanations: text-lg, leading-loose for readability

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-6 to p-8
- Section spacing: gap-8 to gap-12
- Page margins: px-6 md:px-12 lg:px-16
- Card padding: p-6 to p-8
- Vertical rhythm: space-y-6 to space-y-8

**Container Strategy**:
- Max width: max-w-7xl for main content
- Analysis cards: max-w-4xl centered for focus
- Chat-style AI responses: max-w-3xl for optimal reading
- Full-width sections for comparative data/charts

## Component Architecture

### Primary Navigation
- Top bar with search-first design
- Centered stock ticker search (prominent, always accessible)
- Minimal menu: Home, Watchlist (future), About
- Search bar spans 60% width on desktop, full width mobile

### Stock Analysis Layout
**Single-column narrative flow** (not dashboard grid):

1. **Hero Section**: 
   - Stock ticker + company name + current price (large, bold)
   - Real-time price change indicator
   - Quick sentiment badge (AI-generated)
   - Subtle gradient background treatment
   - Height: min-h-[40vh]

2. **AI Summary Card** (first priority):
   - Chat bubble aesthetic with rounded-2xl
   - Icon: Sparkle/AI indicator
   - Plain-language summary in conversational tone
   - Recommendation badge: Buy/Hold/Sell with reasoning
   - Bordered card with shadow-lg

3. **Key Metrics Grid**:
   - 2-column on mobile, 4-column on desktop
   - Each metric: label + value + AI tooltip explanation
   - Hover state reveals plain-English meaning
   - Clean card design with border

4. **Narrative Sections** (stacked vertically):
   - "What This Company Does" - Business explanation
   - "Financial Health Check" - Metrics with context
   - "Recent Events & News" - Timeline layout
   - "Risk Assessment" - Clear warning/opportunity flags
   - Each section: heading + AI explanation + supporting data/chart

5. **Simple Visualizations**:
   - Price trend: Line chart (minimal, no clutter)
   - Valuation comparison: Simple bar chart
   - Risk meter: Visual gauge/progress bar
   - Charts embedded within narrative flow, not separate

### Chat-Style AI Explanations
- Left-aligned with avatar/icon
- Rounded message bubbles (rounded-2xl)
- Max-width for readability
- Generous line-height (leading-loose)
- Clear visual separation from data

### Data Cards
- Consistent rounded-xl borders
- Subtle shadow (shadow-md to shadow-lg)
- Internal padding: p-6 to p-8
- Clear labels above values
- Hover states for interactive elements

## Interaction Patterns

### Search Experience
- Autocomplete dropdown with company names + tickers
- Recent searches persistent
- Loading state: Skeleton screens for analysis sections
- Smooth transitions between ticker changes

### Progressive Disclosure
- Expandable sections for deep dives ("Show more analysis")
- Tooltips on financial terms (hover/click)
- Collapsible charts/advanced metrics
- "Explain this" micro-interactions

### Loading & Empty States
- Skeleton screens maintain layout during AI processing
- "AI is analyzing..." with progress indication
- Empty state: Friendly prompt to search a ticker
- Error states: Plain-English explanations of issues

## Visual Rhythm

**Vertical Flow**:
- Section spacing: mb-16 to mb-20 between major sections
- Card spacing: gap-6 to gap-8 within sections
- Consistent top padding: pt-8 for sections

**Horizontal Layouts**:
- Metrics: grid-cols-2 md:grid-cols-4
- News items: Single column, timeline style
- Comparison data: 2-column split when needed

## Icons

**Library**: Heroicons (CDN)
- Sparkles: AI-generated content
- TrendingUp/Down: Price movements
- ExclamationTriangle: Risk warnings
- InformationCircle: Tooltips/explanations
- ChartBar: Metrics sections
- Newspaper: News items

## Accessibility

- High contrast for all text over backgrounds
- Clear focus states on interactive elements (ring-2)
- Proper heading hierarchy (h1 → h2 → h3)
- ARIA labels for icon-only buttons
- Keyboard navigation for search and expandable sections
- Screen reader announcements for AI-generated content updates

## Images

**No hero image** - This is a data tool, not marketing site. Focus on clarity.

**Supporting Graphics**:
- Company logos (fetched via API) - 48x48px in header
- AI avatar/icon for chat-style explanations - 32x32px
- Placeholder charts (will be replaced by actual data viz)

## Animation Guidelines

**Minimal, purposeful motion**:
- Fade-in for AI-generated content (duration-300)
- Smooth transitions on hover states (transition-all)
- Skeleton pulse during loading
- NO scroll-triggered animations
- NO complex chart animations (simple reveal only)

## Responsive Strategy

**Mobile-first breakpoints**:
- Base: Single column, full-width search
- md (768px): 2-column metrics, wider containers
- lg (1024px): 4-column metrics, max-w constraints
- Collapsible navigation on mobile
- Stack all sections vertically on mobile
- Charts resize fluidly with container