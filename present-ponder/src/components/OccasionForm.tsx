import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sparkles, CalendarIcon, ChevronDown, ChevronUp } from "lucide-react";
import { Profile } from "./ProfileList";
import { cn } from "@/lib/utils";

interface OccasionFormProps {
  profile: Profile;
  onGenerate: (data: { date: Date; occasion: string; notes: string }) => void;
  isGenerating: boolean;
  accumulatedNotes: string;
}

export const OccasionForm = ({ profile, onGenerate, isGenerating, accumulatedNotes }: OccasionFormProps) => {
  const [date, setDate] = useState<Date>();
  const [occasion, setOccasion] = useState("");
  const [notes, setNotes] = useState("");
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date) {
      onGenerate({ date, occasion, notes });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Got a special date coming up?</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <span>{profile.name}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="occasion">What's happening?</Label>
          <Input
            id="occasion"
            placeholder="e.g. work anniversary, just because"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>When?</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Select date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            placeholder="Any special preferences or occasions?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-24 resize-none"
          />
          {accumulatedNotes && (
            <Collapsible open={isNotesOpen} onOpenChange={setIsNotesOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between mt-2 h-8"
                  type="button"
                >
                  <span className="text-xs font-medium">Notes</span>
                  {isNotesOpen ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">{accumulatedNotes}</p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isGenerating || !date}
      >
        {isGenerating ? (
          <>
            <Sparkles className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Get gifts
          </>
        )}
      </Button>
    </form>
  );
};
