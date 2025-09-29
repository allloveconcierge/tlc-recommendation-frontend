import { User, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface Profile {
  id: string;
  name: string;
  relationship: string;
  gender: string;
  age: string;
  interest: string;
  notes: Array<{ id: string; text: string; date: Date }>;
}

interface ProfileListProps {
  profiles: Profile[];
  selectedProfileId: string | null;
  onSelectProfile: (id: string) => void;
  onNewProfile: () => void;
  onEditProfile: (id: string) => void;
}

export const ProfileList = ({ profiles, selectedProfileId, onSelectProfile, onNewProfile, onEditProfile }: ProfileListProps) => {
  const getAvatarColor = (id: string) => {
    const colors = [
      "bg-red-100 text-red-600",
      "bg-blue-100 text-blue-600",
      "bg-green-100 text-green-600",
      "bg-yellow-100 text-yellow-600",
      "bg-purple-100 text-purple-600",
      "bg-pink-100 text-pink-600",
    ];
    const index = parseInt(id.slice(0, 8), 16) % colors.length;
    return colors[index];
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold mb-4">Profiles</h2>
        <Button onClick={onNewProfile} className="w-full" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          New Profile
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {profiles.length === 0 ? (
            <div className="text-center py-8 px-4">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No profiles yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create your first profile to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className={`w-full flex items-center gap-2 p-3 rounded-lg transition-colors ${
                    selectedProfileId === profile.id ? "bg-muted" : ""
                  }`}
                >
                  <button
                    onClick={() => onSelectProfile(profile.id)}
                    className="flex-1 flex items-center gap-3 text-left hover:opacity-80 transition-opacity min-w-0"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAvatarColor(profile.id)}`}>
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{profile.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{profile.relationship}</div>
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditProfile(profile.id);
                    }}
                    className="h-8 w-8 p-0 shrink-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
