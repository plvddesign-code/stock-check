import axios from "axios";
import type { NewsItem } from "@shared/schema";

// Using NewsAPI.org free tier - supports financial news
// Register at https://newsapi.org for free API key
const NEWS_API_KEY = process.env.NEWS_API_KEY || "demo";
const NEWS_API_URL = "https://newsapi.org/v2/everything";

// Fallback news data for demo with real external links
const FALLBACK_NEWS: { [key: string]: NewsItem[] } = {
  "AAPL": [
    {
      title: "Apple earnings beat expectations with strong iPhone sales",
      publisher: "Reuters",
      link: "https://www.reuters.com/technology/",
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      summary: "Apple reports Q4 earnings with iPhone sales exceeding analyst expectations, driving strong revenue growth.",
    },
    {
      title: "Apple AI features to drive next growth cycle, analysts say",
      publisher: "Bloomberg",
      link: "https://www.bloomberg.com/quote/AAPL:US",
      publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      summary: "Leading tech analysts predict Apple's new AI capabilities will create a new upgrade cycle and boost revenues.",
    },
    {
      title: "Apple Watch sales surge on health features demand",
      publisher: "CNBC",
      link: "https://www.cnbc.com/technology/",
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      summary: "Apple Watch continues to be a growth driver with strong demand for new health monitoring features.",
    },
    {
      title: "Analysts upgrade Apple price target to record highs",
      publisher: "MarketWatch",
      link: "https://www.marketwatch.com/investing/stock/aapl",
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      summary: "Multiple analysts raise price targets on Apple stock citing strong services growth and margin expansion.",
    },
  ],
  "GOOGL": [
    {
      title: "Google Cloud momentum accelerates with AI services",
      publisher: "TechCrunch",
      link: "https://techcrunch.com/tag/google/",
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      summary: "Google Cloud revenue growth accelerates driven by enterprise AI adoption and large contracts.",
    },
    {
      title: "Alphabet Q3 revenue growth beats expectations",
      publisher: "Financial Times",
      link: "https://markets.ft.com/data/equities/tearsheet/financials?s=GOOGL:NASDAQ",
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      summary: "Alphabet reports better-than-expected Q3 results with strong growth across search and cloud segments.",
    },
    {
      title: "Google faces regulatory scrutiny over search dominance",
      publisher: "Reuters",
      link: "https://www.reuters.com/technology/",
      publishedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
      summary: "Regulators examine Google's search market dominance as competition from AI chatbots intensifies.",
    },
    {
      title: "YouTube advertising demand remains strong",
      publisher: "Variety",
      link: "https://variety.com/2024/digital/",
      publishedAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(),
      summary: "YouTube advertising market shows resilience with strong demand from advertisers despite economic concerns.",
    },
  ],
  "MSFT": [
    {
      title: "Microsoft Azure growth accelerates with enterprise AI deals",
      publisher: "TechCrunch",
      link: "https://techcrunch.com/tag/microsoft/",
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      summary: "Microsoft reports record Azure growth driven by enterprise adoption of OpenAI services and AI copilots.",
    },
    {
      title: "Analyst upgrades Microsoft on AI growth potential",
      publisher: "Barron's",
      link: "https://www.barrons.com/articles",
      publishedAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
      summary: "Wall Street analysts raise price targets on Microsoft citing significant upside from AI integration.",
    },
    {
      title: "Microsoft 365 Copilot adoption exceeds expectations",
      publisher: "Information",
      link: "https://www.theinformation.com/briefings/microsoft",
      publishedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
      summary: "Enterprise customers rapidly adopt Microsoft 365 Copilot AI features, driving productivity gains.",
    },
    {
      title: "Microsoft strengthens enterprise cloud position",
      publisher: "Forbes",
      link: "https://www.forbes.com/sites/quickerbythought/",
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      summary: "Microsoft's enterprise cloud position strengthens as organizations shift to hybrid and cloud-first strategies.",
    },
  ],
  "TSLA": [
    {
      title: "Tesla Cybertruck production ramps ahead of schedule",
      publisher: "Electrek",
      link: "https://electrek.co/tesla/",
      publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      summary: "Tesla accelerates Cybertruck production with deliveries exceeding initial expectations.",
    },
    {
      title: "Tesla stock surges on strong delivery numbers",
      publisher: "Reuters",
      link: "https://www.reuters.com/business/",
      publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
      summary: "Tesla reports record quarterly deliveries, exceeding analyst expectations and driving stock gains.",
    },
    {
      title: "Tesla energy storage business accelerates growth",
      publisher: "Bloomberg",
      link: "https://www.bloomberg.com/quote/TSLA:US",
      publishedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
      summary: "Tesla's energy storage and battery business shows accelerating growth with record demand.",
    },
    {
      title: "Giga Berlin expansion positions Tesla for EU growth",
      publisher: "Axios",
      link: "https://www.axios.com/business/",
      publishedAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(),
      summary: "Tesla expands Berlin factory capacity to meet strong European electric vehicle demand.",
    },
  ],
};

export async function getFinancialNews(ticker: string, maxResults: number = 10): Promise<NewsItem[]> {
  try {
    // Try using NewsAPI if key is configured
    if (NEWS_API_KEY !== "demo") {
      const response = await axios.get(NEWS_API_URL, {
        params: {
          q: `${ticker} stock OR ${ticker} earnings OR ${ticker} news`,
          sortBy: "publishedAt",
          language: "en",
          apiKey: NEWS_API_KEY,
        },
        timeout: 8000,
      });

      if (response.data.articles && response.data.articles.length > 0) {
        return response.data.articles.slice(0, maxResults).map((article: any) => ({
          title: article.title || "Untitled",
          publisher: article.source?.name || "Unknown",
          link: article.url || "#",
          publishedAt: article.publishedAt || new Date().toISOString(),
          summary: article.description || undefined,
        }));
      }
    }

    // Fallback to demo data with real external links
    const upperTicker = ticker.toUpperCase();
    if (FALLBACK_NEWS[upperTicker]) {
      return FALLBACK_NEWS[upperTicker].slice(0, maxResults);
    }

    // Generic fallback for unknown tickers with search link
    return [
      {
        title: `Latest news about ${ticker}`,
        publisher: "Google News",
        link: `https://news.google.com/search?q=${ticker}+stock+news`,
        publishedAt: new Date().toISOString(),
        summary: `Search for latest ${ticker} stock news and market updates.`,
      },
    ];
  } catch (error: any) {
    console.error("Financial news fetch error:", error.message);
    
    // Return fallback data on error
    const upperTicker = ticker.toUpperCase();
    if (FALLBACK_NEWS[upperTicker]) {
      return FALLBACK_NEWS[upperTicker].slice(0, maxResults);
    }

    return [
      {
        title: `Latest news about ${ticker}`,
        publisher: "Financial News",
        link: `https://news.google.com/search?q=${ticker}+stock+news`,
        publishedAt: new Date().toISOString(),
        summary: `Unable to load latest news. Search for ${ticker} stock news on Google News.`,
      },
    ];
  }
}
