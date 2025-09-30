import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface Recommendation {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  link?: string;
}

interface RecommendationCardProps {
  recommendation: Recommendation;
}

// Extract domain from URL for display
const extractDomain = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return 'Website';
  }
};

export const RecommendationCard = ({ recommendation }: RecommendationCardProps) => {
  return (
    <Card className="border border-gray-200 bg-white hover:shadow-sm transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded text-center">
              1/20
            </span>
          </div>
          <CardTitle className="text-xl font-bold text-black leading-tight">
            {recommendation.name}
          </CardTitle>
          <p className="text-sm text-gray-600 leading-relaxed">
            {recommendation.description}
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {recommendation.link && (
          <div className="space-y-2">
            <p className="text-sm text-gray-700 font-medium">
              Suggested site to search
            </p>
            <button
              onClick={() => window.open(recommendation.link, "_blank")}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-full border border-gray-200"
            >
              <div className="w-4 h-4 rounded-full bg-gray-400"></div>
              {extractDomain(recommendation.link)}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
