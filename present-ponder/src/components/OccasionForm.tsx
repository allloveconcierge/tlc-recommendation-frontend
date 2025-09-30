import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, CalendarIcon, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
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
  const [errors, setErrors] = useState({
    occasion: "",
    date: "",
  });

  const validateForm = () => {
    const newErrors = {
      occasion: !occasion.trim() ? "Please describe what's happening" : "",
      date: !date ? "Please select a date" : "",
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && date) {
      onGenerate({ date, occasion, notes });
    }
  };

  const handleOccasionChange = (value: string) => {
    setOccasion(value);
    if (errors.occasion) {
      setErrors(prev => ({ ...prev, occasion: "" }));
    }
  };

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (errors.date) {
      setErrors(prev => ({ ...prev, date: "" }));
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
        {/* Required fields notice */}
        <p className="text-xs text-muted-foreground">
          All fields marked with <span className="text-muted-foreground">*</span> are required
        </p>

        <div className="space-y-2">
          <Label htmlFor="occasion" className="flex items-center gap-1">
            What's happening? <span className="text-muted-foreground">*</span>
          </Label>
          <Input
            id="occasion"
            placeholder="e.g. work anniversary, just because"
            value={occasion}
            onChange={(e) => handleOccasionChange(e.target.value)}
            className={errors.occasion ? "border-red-500 focus-visible:ring-red-500" : ""}
            required
          />
          {errors.occasion && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{errors.occasion}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            When? <span className="text-muted-foreground">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                  errors.date && "border-red-500 focus-visible:ring-red-500"
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
                onSelect={handleDateChange}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          {errors.date && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{errors.date}</AlertDescription>
            </Alert>
          )}
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
        disabled={isGenerating}
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
