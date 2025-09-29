import { RecommendationCard, Recommendation } from "./RecommendationCard";
import { Button } from "@/components/ui/button";
import { History, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface RecommendationSet {
  id: string;
  timestamp: Date;
  recommendations: Recommendation[];
  formData: {
    relationship: string;
    name: string;
    age: string;
    interest: string;
  };
}

interface RecommendationsListProps {
  currentRecommendations: Recommendation[];
  history: RecommendationSet[];
  isLoading: boolean;
}

export const RecommendationsList = ({
  currentRecommendations,
  history,
  isLoading
}: RecommendationsListProps) => {
  const [openHistory, setOpenHistory] = useState<string[]>([]);

  const toggleHistory = (id: string) => {
    setOpenHistory(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Finding perfect gifts...</p>
        </div>
      </div>
    );
  }

  if (currentRecommendations.length === 0 && history.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
            <History className="h-10 w-10 text-foreground" />
          </div>
          <h3 className="text-xl font-semibold">No Recommendations Yet</h3>
          <p className="text-muted-foreground">
            Fill out the form and click generate to see personalized gift recommendations
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full overflow-auto p-1">
      {currentRecommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
            <h3 className="text-lg font-semibold">Current Recommendations</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentRecommendations.map(rec => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pt-4 border-t">
            <History className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Previous Recommendations</h3>
          </div>
          <div className="space-y-3">
            {history.map(set => (
              <Collapsible
                key={set.id}
                open={openHistory.includes(set.id)}
                onOpenChange={() => toggleHistory(set.id)}
              >
                <div className="border rounded-lg bg-card/50 backdrop-blur-sm">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-4 hover:bg-muted/50"
                    >
                      <div className="text-left">
                        <div className="font-medium">
                          {set.formData.name || "Gift Search"}
                          {set.formData.relationship && ` • ${set.formData.relationship}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {set.timestamp.toLocaleString()}
                        </div>
                      </div>
                      {openHistory.includes(set.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {set.recommendations.map(rec => (
                        <RecommendationCard key={rec.id} recommendation={rec} />
                      ))}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
