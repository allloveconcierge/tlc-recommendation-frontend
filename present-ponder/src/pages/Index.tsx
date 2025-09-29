import { useState, useEffect } from "react";
import { ProfileList, Profile } from "@/components/ProfileList";
import { ProfileForm } from "@/components/ProfileForm";
import { ProfileNotes } from "@/components/ProfileNotes";
import { OccasionForm } from "@/components/OccasionForm";
import { RecommendationsList, RecommendationSet } from "@/components/RecommendationsList";
import { Recommendation } from "@/components/RecommendationCard";
import { Button } from "@/components/ui/button";
import { Gift, UserCircle, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DatabaseService, GiftProfile, RecommendationSet as DBRecommendationSet } from "@/lib/database";

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8000";

const Index = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [profileView, setProfileView] = useState<"get-gift" | "enrich-profile">("get-gift");
  const [accumulatedNotes, setAccumulatedNotes] = useState<string>("");
  const [currentRecommendations, setCurrentRecommendations] = useState<Recommendation[]>([]);
  const [history, setHistory] = useState<RecommendationSet[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load profiles from database
      const dbProfiles = await DatabaseService.getGiftProfiles();
      const convertedProfiles: Profile[] = dbProfiles.map(p => ({
        id: p.id,
        name: p.name,
        relationship: p.relationship,
        gender: p.gender,
        age: p.age.toString(),
        interest: p.interest,
        notes: p.notes.map(n => ({
          id: n.id,
          text: n.text,
          date: new Date(n.date)
        }))
      }));
      setProfiles(convertedProfiles);

      // Load accumulated notes from database
      const notes = await DatabaseService.getAccumulatedNotes();
      setAccumulatedNotes(notes);

      // Load recommendations from database
      const dbRecommendations = await DatabaseService.getRecommendations();
      const convertedRecommendations: RecommendationSet[] = dbRecommendations.map(r => ({
        id: r.id,
        timestamp: new Date(r.generated_at),
        recommendations: r.recommendations,
        formData: {
          relationship: "", // We'll need to get this from the profile
          name: "", // We'll need to get this from the profile
          age: "", // We'll need to get this from the profile
          interest: "" // We'll need to get this from the profile
        }
      }));
      setHistory(convertedRecommendations);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load profiles and recommendations",
        variant: "destructive",
      });
    }
  };

  const handleSaveProfile = async (profileData: Omit<Profile, "id">) => {
    try {
      if (editingProfileId) {
        // Update existing profile
        const profileToUpdate = profiles.find(p => p.id === editingProfileId);
        if (!profileToUpdate) return;

        await DatabaseService.updateGiftProfile(editingProfileId, {
          name: profileData.name,
          relationship: profileData.relationship,
          gender: profileData.gender,
          age: parseInt(profileData.age, 10),
          interest: profileData.interest,
          notes: profileData.notes.map(n => ({
            id: n.id,
            text: n.text,
            date: n.date.toISOString()
          }))
        });

        setEditingProfileId(null);
        setSelectedProfileId(editingProfileId);
        
        toast({
          title: "Profile updated!",
          description: `${profileData.name}'s profile has been updated.`,
        });
      } else {
        // Create new profile
        const newProfile = await DatabaseService.createGiftProfile({
          name: profileData.name,
          relationship: profileData.relationship,
          gender: profileData.gender,
          age: parseInt(profileData.age, 10),
          interest: profileData.interest,
          notes: profileData.notes.map(n => ({
            id: n.id,
            text: n.text,
            date: n.date.toISOString()
          }))
        });

        setIsCreatingProfile(false);
        setSelectedProfileId(newProfile.id);
        
        toast({
          title: "Profile saved!",
          description: `${newProfile.name}'s profile has been created.`,
        });
      }

      // Reload data to get the latest from database
      await loadData();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error saving profile",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateNotes = async (notes: Profile['notes']) => {
    if (!selectedProfileId) return;
    
    try {
      await DatabaseService.updateGiftProfile(selectedProfileId, {
        notes: notes.map(n => ({
          id: n.id,
          text: n.text,
          date: n.date.toISOString()
        }))
      });
      
      toast({
        title: "Note saved!",
        description: "Profile notes have been updated.",
      });

      // Reload data to get the latest from database
      await loadData();
    } catch (error) {
      console.error('Error updating notes:', error);
      toast({
        title: "Error saving notes",
        description: "Failed to save notes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerate = async (occasionData: { date: Date; occasion: string; notes: string }) => {
    const selectedProfile = profiles.find(p => p.id === selectedProfileId);
    if (!selectedProfile) return;

    setIsGenerating(true);
    try {
      const parsedAge = parseInt(selectedProfile.age, 10);
      if (Number.isNaN(parsedAge) || parsedAge < 16) {
        throw new Error("Please provide a valid age (16+)");
      }

      const interests = (selectedProfile.interest || "")
        .split(",")
        .map(i => i.trim())
        .filter(Boolean);

      const body = {
        profile: {
          profile_id: selectedProfile.id,
          age: parsedAge,
          relationship: selectedProfile.relationship,
          gender: selectedProfile.gender,
        },
        location: "United Kingdom",
        upcoming_event: occasionData.occasion || "General",
        upcoming_event_date: occasionData.date?.toISOString(),
        profile_interests: interests,
        count: 4,
        notes: occasionData.notes || undefined,
        web_search_enabled: true,
      };

      const resp = await fetch(`${API_BASE_URL}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        let detail = "";
        try {
          const errJson = await resp.json();
          detail = errJson?.detail ? `: ${JSON.stringify(errJson.detail)}` : "";
        } catch {}
        throw new Error(`Request failed: ${resp.status}${detail}`);
      }

      const data = await resp.json();
      const newRecommendations: Recommendation[] = (data.recommendations || []).map((r: any, idx: number) => ({
        id: `${data.profile_id || selectedProfile.id}-${idx}`,
        name: r.product,
        description: r.explanation,
        price: r.product_cost || "",
        category: r.category || r.type || "",
        link: r.product_url 
          || (typeof r.store === "string" && r.store
                ? (r.store.startsWith("http") ? r.store : `https://${r.store}`)
                : undefined),
      }));

      // Save current recommendations to history if they exist
      if (currentRecommendations.length > 0) {
        setHistory(prev => [{
          id: `set-${Date.now()}`,
          timestamp: new Date(),
          recommendations: currentRecommendations,
          formData: {
            ...selectedProfile,
            ...occasionData,
          }
        }, ...prev]);
      }

      setCurrentRecommendations(newRecommendations);

      // Save recommendations to database
      await DatabaseService.saveRecommendations(
        selectedProfile.id,
        occasionData.occasion,
        occasionData.date,
        occasionData.notes,
        newRecommendations
      );

      // Update accumulated notes
      if (occasionData.notes) {
        const newAccumulatedNotes = accumulatedNotes 
          ? `${accumulatedNotes}\n\n${occasionData.notes}` 
          : occasionData.notes;
        setAccumulatedNotes(newAccumulatedNotes);
        await DatabaseService.updateAccumulatedNotes(newAccumulatedNotes);
      }

      toast({
        title: "Recommendations generated!",
        description: `Found ${newRecommendations.length} perfect gifts`,
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Failed to generate recommendations",
        description: err?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedProfile = profiles.find(p => p.id === selectedProfileId);
  const editingProfile = profiles.find(p => p.id === editingProfileId);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-foreground">
            TLC
          </h1>
          <p className="text-muted-foreground">Find the perfect gift for anyone, powered by smart recommendations</p>
        </header>

        <div className="grid lg:grid-cols-[320px_1fr] gap-6 max-w-7xl mx-auto">
          {/* Left Panel - Profile List */}
          <div className="lg:sticky lg:top-6 h-fit">
            <div className="bg-card rounded-2xl shadow-lg border h-[calc(100vh-180px)] lg:h-[calc(100vh-120px)]">
              <ProfileList
                profiles={profiles}
                selectedProfileId={selectedProfileId}
                onSelectProfile={(id) => {
                  setSelectedProfileId(id);
                  setProfileView("get-gift");
                }}
                onEditProfile={(id) => {
                  setEditingProfileId(id);
                  setIsCreatingProfile(false);
                  setSelectedProfileId(null);
                }}
                onNewProfile={() => {
                  setIsCreatingProfile(true);
                  setEditingProfileId(null);
                  setSelectedProfileId(null);
                }}
              />
            </div>
          </div>

          {/* Right Panel - Form or Recommendations */}
          <div className="bg-card rounded-2xl p-6 shadow-lg border min-h-[600px]">
            {isCreatingProfile || editingProfileId ? (
              <ProfileForm
                profile={editingProfile}
                onSave={handleSaveProfile}
                onCancel={() => {
                  setIsCreatingProfile(false);
                  setEditingProfileId(null);
                }}
              />
            ) : selectedProfile ? (
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedProfile.name}</h2>
                    <p className="text-sm text-muted-foreground capitalize">{selectedProfile.relationship}</p>
                  </div>
                </div>

                {/* View Toggle */}
                <div className="flex gap-2 border-b">
                  <Button
                    variant={profileView === "get-gift" ? "default" : "ghost"}
                    onClick={() => setProfileView("get-gift")}
                    className="rounded-b-none"
                  >
                    <Gift className="h-4 w-4 mr-2" />
                    Get Gift
                  </Button>
                  <Button
                    variant={profileView === "enrich-profile" ? "default" : "ghost"}
                    onClick={() => setProfileView("enrich-profile")}
                    className="rounded-b-none"
                  >
                    <UserCircle className="h-4 w-4 mr-2" />
                    Enrich Profile
                  </Button>
                </div>

                {/* Content based on selected view */}
                {profileView === "get-gift" ? (
                  <div className="space-y-6">
                    <OccasionForm
                      profile={selectedProfile}
                      onGenerate={handleGenerate}
                      isGenerating={isGenerating}
                      accumulatedNotes={accumulatedNotes}
                    />
                    {(currentRecommendations.length > 0 || history.length > 0) && (
                      <div className="border-t pt-6">
                        <RecommendationsList
                          currentRecommendations={currentRecommendations}
                          history={history}
                          isLoading={isGenerating}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Edit Profile Button */}
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingProfileId(selectedProfile.id);
                          setSelectedProfileId(null);
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Profile Details
                      </Button>
                    </div>

                    {/* Profile Info Card */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Gender:</span>
                          <p className="font-medium capitalize">{selectedProfile.gender}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Age:</span>
                          <p className="font-medium">{selectedProfile.age}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Interests:</span>
                          <p className="font-medium">{selectedProfile.interest}</p>
                        </div>
                      </div>
                    </div>

                    {/* Notes Section */}
                    <ProfileNotes 
                      profile={selectedProfile}
                      onUpdateNotes={handleUpdateNotes}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4 max-w-md">
                  <h3 className="text-xl font-semibold">Select or Create a Profile</h3>
                  <p className="text-muted-foreground">
                    Choose a profile from the list or create a new one to get personalized gift recommendations
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
