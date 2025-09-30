import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, X, AlertCircle } from "lucide-react";
import { Profile } from "./ProfileList";

const POPULAR_INTERESTS = [
  "Reading", "Cooking", "Gaming", "Music", "Sports", "Art", "Technology", 
  "Travel", "Fitness", "Photography", "Movies", "Fashion", "Gardening", 
  "Writing", "Dancing", "Hiking", "Crafts", "Science", "History", "Animals"
];

const RELATIONSHIPS = [
  "Spouse/Partner", "Family Member", "Close Friend", "Colleague", 
  "Acquaintance", "Boss", "Teacher", "Neighbor", "Other"
];

interface ProfileFormProps {
  profile?: Profile;
  onSave: (profile: Omit<Profile, "id">) => void;
  onCancel: () => void;
}

export const ProfileForm = ({ profile, onSave, onCancel }: ProfileFormProps) => {
  // Convert existing interests string to array for editing
  const existingInterests = profile?.interest ? profile.interest.split(",").map(i => i.trim()).filter(Boolean) : [];
  
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    relationship: profile?.relationship || "",
    gender: profile?.gender || "",
    age: profile?.age || "",
    notes: profile?.notes || [],
  });
  
  const [selectedInterests, setSelectedInterests] = useState<string[]>(existingInterests);
  const [customInterest, setCustomInterest] = useState("");
  
  const [errors, setErrors] = useState({
    name: "",
    relationship: "",
    gender: "",
    age: "",
    interest: "",
  });

  const addInterest = (interest: string) => {
    if (interest && !selectedInterests.includes(interest)) {
      setSelectedInterests([...selectedInterests, interest]);
      if (errors.interest) {
        setErrors(prev => ({ ...prev, interest: "" }));
      }
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

  const validateForm = () => {
    const newErrors = {
      name: !formData.name.trim() ? "Name is required" : "",
      relationship: !formData.relationship ? "Please select a relationship" : "",
      gender: !formData.gender ? "Please select a gender" : "",
      age: !formData.age.trim() ? "Age is required" : isNaN(Number(formData.age)) || Number(formData.age) < 1 ? "Please enter a valid age" : "",
      interest: selectedInterests.length === 0 ? "At least one interest is required" : "",
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        ...formData,
        interest: selectedInterests.join(", ")
      });
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {profile ? "Edit Profile" : "New Profile"}
        </h2>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Required fields notice */}
        <p className="text-xs text-muted-foreground">
          All fields marked with <span className="text-muted-foreground">*</span> are required
        </p>

        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-1">
            Name <span className="text-muted-foreground">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Their name"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
            required
          />
          {errors.name && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{errors.name}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="relationship" className="flex items-center gap-1">
            Relationship <span className="text-muted-foreground">*</span>
          </Label>
          <Select value={formData.relationship} onValueChange={(value) => updateField("relationship", value)} required>
            <SelectTrigger id="relationship" className={errors.relationship ? "border-red-500 focus-visible:ring-red-500" : ""}>
              <SelectValue placeholder="Select relationship" />
            </SelectTrigger>
            <SelectContent>
              {RELATIONSHIPS.map((rel) => (
                <SelectItem key={rel} value={rel}>
                  {rel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.relationship && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{errors.relationship}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender" className="flex items-center gap-1">
            Gender <span className="text-muted-foreground">*</span>
          </Label>
          <Select value={formData.gender} onValueChange={(value) => updateField("gender", value)} required>
            <SelectTrigger id="gender" className={errors.gender ? "border-red-500 focus-visible:ring-red-500" : ""}>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="non-binary">Non-binary</SelectItem>
              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{errors.gender}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="age" className="flex items-center gap-1">
            Age <span className="text-muted-foreground">*</span>
          </Label>
          <Input
            id="age"
            type="number"
            placeholder="Enter age"
            value={formData.age}
            onChange={(e) => updateField("age", e.target.value)}
            className={errors.age ? "border-red-500 focus-visible:ring-red-500" : ""}
            required
          />
          {errors.age && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{errors.age}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            Interests & Hobbies <span className="text-muted-foreground">*</span>
          </Label>
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
          {errors.interest && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{errors.interest}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          Save Profile
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
