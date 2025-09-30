import { useState, useEffect } from "react";
import { ProfileList, Profile } from "@/components/ProfileList";
import { ProfileForm } from "@/components/ProfileForm";
import { ProfileNotes } from "@/components/ProfileNotes";
import { OccasionForm } from "@/components/OccasionForm";
import { RecommendationsList, RecommendationSet } from "@/components/RecommendationsList";
import { Recommendation } from "@/components/RecommendationCard";
import QuickRecommendation from "@/components/QuickRecommendation";
import { Button } from "@/components/ui/button";
import { Gift, UserCircle, Pencil, Menu, X, LogOut, Plus, Zap, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { DatabaseService, GiftProfile, RecommendationSet as DBRecommendationSet } from "@/lib/database";

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8000";

const Index = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [profileView, setProfileView] = useState<"get-gift" | "enrich-profile">("get-gift");
  const [mainView, setMainView] = useState<"welcome" | "quick-recommendation" | "manage-profiles">("welcome");
  const [accumulatedNotes, setAccumulatedNotes] = useState<string>("");
  const [currentRecommendations, setCurrentRecommendations] = useState<Recommendation[]>([]);
  const [history, setHistory] = useState<RecommendationSet[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      // Clear all data when user signs out
      setProfiles([]);
      setSelectedProfileId(null);
      setEditingProfileId(null);
      setIsCreatingProfile(false);
      setMainView("welcome");
      setCurrentRecommendations([]);
      setHistory([]);
      setAccumulatedNotes("");
    }
  }, [user]);

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
        setMainView("manage-profiles");
        
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
        setMainView("manage-profiles");
        
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
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              className="p-2 h-8 w-8"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">TLC</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user.email}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={signOut}
                  className="p-2 h-8 w-8"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">Guest Mode</span>
            )}
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-65px)]">
        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed left-0 top-0 h-full w-80 bg-background border-r z-50 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-semibold">Profiles</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="p-2 h-8 w-8"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <ProfileList
                  profiles={profiles}
                  selectedProfileId={selectedProfileId}
                  onSelectProfile={(id) => {
                    setSelectedProfileId(id);
                    setProfileView("get-gift");
                    setMainView("manage-profiles");
                    setSidebarOpen(false);
                  }}
                  onEditProfile={(id) => {
                    setEditingProfileId(id);
                    setIsCreatingProfile(false);
                    setSelectedProfileId(null);
                    setMainView("manage-profiles");
                    setSidebarOpen(false);
                  }}
                  onNewProfile={() => {
                    setIsCreatingProfile(true);
                    setEditingProfileId(null);
                    setSelectedProfileId(null);
                    setMainView("manage-profiles");
                    setSidebarOpen(false);
                  }}
                />
              </div>
            </div>
          </>
        )}

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {mainView === "quick-recommendation" ? (
              <QuickRecommendation 
                onBack={() => setMainView("welcome")} 
                onProfileSaved={loadData}
              />
            ) : mainView === "manage-profiles" || isCreatingProfile || editingProfileId || selectedProfile ? (
              <>
                {isCreatingProfile || editingProfileId ? (
              <div className="bg-card rounded-lg border p-6">
                <ProfileForm
                  profile={editingProfile}
                  onSave={handleSaveProfile}
                  onCancel={() => {
                    setIsCreatingProfile(false);
                    setEditingProfileId(null);
                    setMainView("welcome");
                  }}
                />
              </div>
            ) : selectedProfile ? (
              <div className="space-y-6">
                {/* Back Button and Profile Header */}
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setSelectedProfileId(null);
                      setMainView("welcome");
                    }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </div>
                
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
                    <div className="bg-card rounded-lg border p-6">
                      <OccasionForm
                        profile={selectedProfile}
                        onGenerate={handleGenerate}
                        isGenerating={isGenerating}
                        accumulatedNotes={accumulatedNotes}
                      />
                    </div>
                    {(currentRecommendations.length > 0 || history.length > 0) && (
                      <div className="bg-card rounded-lg border p-6">
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
                    <div className="bg-card rounded-lg border p-6">
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
                    <div className="bg-card rounded-lg border p-6">
                      <ProfileNotes 
                        profile={selectedProfile}
                        onUpdateNotes={handleUpdateNotes}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : null}
              </>
            ) : (
              <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="text-center space-y-6 max-w-md">
                  <p className="text-muted-foreground">
                    Choose how you'd like to get started
                  </p>
                  
                  <div className="space-y-3">
                    <Button 
                      size="lg" 
                      className="w-full" 
                      variant="default"
                      onClick={() => setMainView("quick-recommendation")}
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Quick Gift Recommendation
                    </Button>
                    
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setIsCreatingProfile(true);
                        setMainView("manage-profiles");
                      }}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create Profile
                    </Button>
                    
                    <Button 
                      size="lg" 
                      variant="outline" 
                      onClick={() => {
                        setMainView("manage-profiles");
                        setSidebarOpen(true);
                      }} 
                      className="w-full"
                    >
                      <UserCircle className="w-5 h-5 mr-2" />
                      Manage Profiles
                    </Button>
                  </div>
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
