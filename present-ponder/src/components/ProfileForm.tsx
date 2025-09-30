import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, X, AlertCircle } from "lucide-react";
import { Profile } from "./ProfileList";

interface ProfileFormProps {
  profile?: Profile;
  onSave: (profile: Omit<Profile, "id">) => void;
  onCancel: () => void;
}

export const ProfileForm = ({ profile, onSave, onCancel }: ProfileFormProps) => {
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    relationship: profile?.relationship || "",
    gender: profile?.gender || "",
    age: profile?.age || "",
    interest: profile?.interest || "",
    notes: profile?.notes || [],
  });
  
  const [errors, setErrors] = useState({
    name: "",
    relationship: "",
    gender: "",
    age: "",
    interest: "",
  });

  const validateForm = () => {
    const newErrors = {
      name: !formData.name.trim() ? "Name is required" : "",
      relationship: !formData.relationship ? "Please select a relationship" : "",
      gender: !formData.gender ? "Please select a gender" : "",
      age: !formData.age.trim() ? "Age is required" : isNaN(Number(formData.age)) || Number(formData.age) < 1 ? "Please enter a valid age" : "",
      interest: !formData.interest.trim() ? "Interests are required" : "",
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
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
              <SelectItem value="friend">Friend</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="partner">Partner</SelectItem>
              <SelectItem value="colleague">Colleague</SelectItem>
              <SelectItem value="other">Other</SelectItem>
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
          <Label htmlFor="interest" className="flex items-center gap-1">
            Interests <span className="text-muted-foreground">*</span>
          </Label>
          <Input
            id="interest"
            placeholder="e.g., Reading, Gaming, Cooking"
            value={formData.interest}
            onChange={(e) => updateField("interest", e.target.value)}
            className={errors.interest ? "border-red-500 focus-visible:ring-red-500" : ""}
            required
          />
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
