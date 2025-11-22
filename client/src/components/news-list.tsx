import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import type { NewsItem } from "@shared/schema";

interface NewsListProps {
  news: NewsItem[];
}

export function NewsList({ news }: NewsListProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    
    // Format as "22 November 2025 • 14:30"
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day} ${month} ${year} • ${hours}:${minutes}`;
  };

  if (!news || news.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No recent news available
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {news.map((item, index) => (
        <Card key={index} className="hover-elevate">
          <CardContent className="p-6">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
              data-testid={`link-news-${index}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors" data-testid={`text-news-title-${index}`}>
                    {item.title}
                  </h3>
                  {item.summary && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {item.summary}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span data-testid={`text-news-publisher-${index}`}>{item.publisher}</span>
                    <span>•</span>
                    <span data-testid={`text-news-date-${index}`}>{formatDate(item.publishedAt)}</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </div>
            </a>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
