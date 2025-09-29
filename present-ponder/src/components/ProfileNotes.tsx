import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { Profile } from "./ProfileList";

interface ProfileNotesProps {
  profile: Profile;
  onUpdateNotes: (notes: Profile['notes']) => void;
}

export const ProfileNotes = ({ profile, onUpdateNotes }: ProfileNotesProps) => {
  const [newNote, setNewNote] = useState("");
  
  // Ensure notes is always an array
  const notes = profile.notes || [];

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const updatedNotes = [
      ...notes,
      {
        id: `note-${Date.now()}`,
        text: newNote,
        date: new Date(),
      }
    ];
    
    onUpdateNotes(updatedNotes);
    setNewNote("");
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    onUpdateNotes(updatedNotes);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="new-note">Add a note about {profile.name}</Label>
        <div className="flex gap-2">
          <Textarea
            id="new-note"
            placeholder="e.g., Loved the book I gave last time, interested in photography..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleAddNote}
            size="icon"
            className="h-10 w-10"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {notes.length > 0 && (
        <div className="space-y-2">
          <Label>Notes history</Label>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {notes.map((note) => (
              <Card key={note.id} className="p-3">
                <div className="flex gap-2 justify-between">
                  <div className="flex-1">
                    <p className="text-sm">{note.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(note.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteNote(note.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
