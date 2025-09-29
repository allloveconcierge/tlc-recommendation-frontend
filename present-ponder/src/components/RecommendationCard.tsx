import { Gift, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

export const RecommendationCard = ({ recommendation }: RecommendationCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg leading-tight">{recommendation.name}</CardTitle>
            <CardDescription className="text-xs font-medium text-primary">
              {recommendation.category}
            </CardDescription>
          </div>
          <div className="flex-shrink-0 p-2 rounded-full bg-primary/10 text-primary">
            <Gift className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {recommendation.description}
        </p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-foreground">
            {recommendation.price}
          </span>
          {recommendation.link && (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary hover:bg-primary/10"
              onClick={() => window.open(recommendation.link, "_blank")}
            >
              View
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
