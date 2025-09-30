import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Loader2, Gift, Heart, Star, UserCircle, LogIn, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { RecommendationCard, Recommendation } from "./RecommendationCard";
import { useNavigate } from "react-router-dom";
import { GuestDataManager } from "@/lib/guestDataManager";

const POPULAR_INTERESTS = [
  "Reading", "Cooking", "Gaming", "Music", "Sports", "Art", "Technology", 
  "Travel", "Fitness", "Photography", "Movies", "Fashion", "Gardening", 
  "Writing", "Dancing", "Hiking", "Crafts", "Science", "History", "Animals"
];

const OCCASIONS = [
  "Birthday", "Anniversary", "Christmas", "Valentine's Day", "Mother's Day", 
  "Father's Day", "Graduation", "Wedding", "Baby Shower", "Housewarming", 
  "Just Because", "Thank You", "Congratulations", "Apology", "Get Well Soon"
];

const RELATIONSHIPS = [
  "Spouse/Partner", "Family Member", "Close Friend", "Colleague", 
  "Acquaintance", "Boss", "Teacher", "Neighbor", "Other"
];

interface GuestModeProps {
  onExitGuest?: () => void;
}

export default function GuestMode({ onExitGuest }: GuestModeProps) {
  const navigate = useNavigate();
  
  // Profile fields
  const [recipientName, setRecipientName] = useState("");
  const [age, setAge] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState("");
  const [relationship, setRelationship] = useState("");
  
  // Occasion fields
  const [occasion, setOccasion] = useState("");
  const [customOccasion, setCustomOccasion] = useState("");
  const [budget, setBudget] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState("");

  const addInterest = (interest: string) => {
    if (interest && !selectedInterests.includes(interest)) {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const removeInterest = (interest: string) => {
    setSelectedInterests(selectedInterests.filter(i => i !== interest));
  };

  const addCustomInterest = () => {
    if (customInterest.trim()) {
      addInterest(customInterest.trim());
      setCustomInterest("");
    }
  };

  const handleSubmit = async () => {
    if (!recipientName || !age || selectedInterests.length === 0 || !relationship || !occasion) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const occasionValue = occasion === "Other" ? customOccasion : occasion;
      
      const requestBody = {
        profile: {
          profile_id: `guest-${Date.now()}`,
          age: parseInt(age),
          relationship: relationship,
          gender: "prefer_not_to_say"
        },
        location: "United Kingdom",
        upcoming_event: occasionValue,
        upcoming_event_date: new Date().toISOString(),
        profile_interests: selectedInterests,
        count: 4,
        notes: additionalNotes || undefined,
        web_search_enabled: true
      };

      const API_BASE_URL = "http://localhost:8000";
      
      console.log('API Request:', {
        url: `${API_BASE_URL}/recommend`,
        body: requestBody
      });
      
      const response = await fetch(`${API_BASE_URL}/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('API Response status:', response.status);
      console.log('API Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);
      const formattedRecommendations: Recommendation[] = (data.recommendations || []).map((r: any, idx: number) => ({
        id: `guest-${Date.now()}-${idx}`,
        name: r.product,
        description: r.explanation,
        price: r.product_cost || "Price varies",
        category: r.category || r.type || "Gift",
        link: r.product_url || (typeof r.store === "string" && r.store?.startsWith("http") ? r.store : undefined)
      }));
      setRecommendations(formattedRecommendations);

      // Save guest data to localStorage for potential future use
      GuestDataManager.saveGuestData({
        recipientName,
        age,
        selectedInterests,
        relationship,
        occasion,
        customOccasion,
        budget,
        additionalNotes,
        recommendations: formattedRecommendations
      });
    } catch (err) {
      console.error('Error getting recommendations:', err);
      setError('Failed to get recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setRecipientName("");
    setAge("");
    setSelectedInterests([]);
    setCustomInterest("");
    setRelationship("");
    setOccasion("");
    setCustomOccasion("");
    setBudget("");
    setAdditionalNotes("");
    setRecommendations([]);
    setError("");
  };

  if (recommendations.length > 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Gift Recommendations
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground px-2 sm:px-0">
            Perfect gifts for {recipientName} • {occasion}{budget ? ` • ${budget}` : ''}
          </p>
          <Button variant="outline" onClick={resetForm} className="mt-4" size="sm">
            <Gift className="w-4 h-4 mr-2" />
            Get New Recommendations
          </Button>
        </div>

        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
            />
          ))}
        </div>

        {/* Sign up call-to-action */}
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-4 sm:p-6 text-center space-y-4 sm:space-y-6">
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground leading-tight">
                Love these recommendations?
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed px-2 sm:px-0">
                Sign up to save these recommendations, create profiles for friends and family, and get personalized suggestions anytime!
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:gap-4 max-w-md mx-auto">
              <Button 
                size="lg"
                onClick={() => {
                  if (onExitGuest) {
                    onExitGuest();
                  }
                  navigate("/");
                }}
                className="w-full h-12 text-sm sm:text-base"
              >
                <UserCircle className="w-4 h-4 mr-2" />
                Sign Up & Save These
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => {
                  if (onExitGuest) {
                    onExitGuest();
                  }
                  navigate("/");
                }}
                className="w-full h-12 text-sm sm:text-base"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Already have an account?
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            if (onExitGuest) {
              onExitGuest();
            }
            navigate("/");
          }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sign In
        </Button>
      </div>

      <div className="text-center space-y-2 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Guest Mode
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground px-2 sm:px-0">
          Get personalized gift recommendations instantly - no account required!
        </p>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Find the Perfect Gift</span>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Tell us about the recipient and occasion to get personalized recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Recipient Information */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>About the Recipient</span>
            </h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="recipient-name">Recipient Name *</Label>
                <Input
                  id="recipient-name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Enter recipient's name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g., 25"
                  min="1"
                  max="120"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">Your Relationship *</Label>
              <Select value={relationship} onValueChange={setRelationship}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your relationship" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIPS.map((rel) => (
                    <SelectItem key={rel} value={rel}>
                      {rel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Interests & Hobbies *</Label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
                {selectedInterests.map((interest) => (
                  <Badge
                    key={interest}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground text-xs sm:text-sm px-2 py-1"
                    onClick={() => removeInterest(interest)}
                  >
                    {interest} ×
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
                {POPULAR_INTERESTS.filter(interest => !selectedInterests.includes(interest))
                  .slice(0, 15).map((interest) => (
                  <Badge
                    key={interest}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs sm:text-sm px-2 py-1"
                    onClick={() => addInterest(interest)}
                  >
                    {interest} +
                  </Badge>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  placeholder="Add custom interest..."
                  onKeyPress={(e) => e.key === 'Enter' && addCustomInterest()}
                  className="flex-1"
                />
                <Button type="button" onClick={addCustomInterest} variant="outline" className="sm:flex-shrink-0">
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Occasion Information */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span>Occasion Details</span>
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="occasion">Occasion *</Label>
              <Select value={occasion} onValueChange={setOccasion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select occasion" />
                </SelectTrigger>
                <SelectContent>
                  {OCCASIONS.map((occ) => (
                    <SelectItem key={occ} value={occ}>
                      {occ}
                    </SelectItem>
                  ))}
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {occasion === "Other" && (
              <div className="space-y-2">
                <Label htmlFor="custom-occasion">Custom Occasion</Label>
                <Input
                  id="custom-occasion"
                  value={customOccasion}
                  onChange={(e) => setCustomOccasion(e.target.value)}
                  placeholder="Describe the occasion"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="budget">Budget (Optional)</Label>
              <Select value={budget} onValueChange={setBudget}>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Under $25">Under $25</SelectItem>
                  <SelectItem value="$25-$50">$25-$50</SelectItem>
                  <SelectItem value="$50-$100">$50-$100</SelectItem>
                  <SelectItem value="$100-$250">$100-$250</SelectItem>
                  <SelectItem value="$250-$500">$250-$500</SelectItem>
                  <SelectItem value="$500+">$500+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Any special preferences, allergies, or additional context..."
                rows={3}
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full"
            size="lg"
            variant="default"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Getting Recommendations...
              </>
            ) : (
              <>
                <Gift className="w-4 h-4 mr-2" />
                Get Gift Recommendations
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
