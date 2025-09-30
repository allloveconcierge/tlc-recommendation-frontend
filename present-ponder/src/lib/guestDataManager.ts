// Utility functions to manage guest mode data persistence

export interface GuestProfileData {
  recipientName: string;
  age: string;
  selectedInterests: string[];
  relationship: string;
  occasion: string;
  customOccasion?: string;
  budget?: string;
  additionalNotes?: string;
  recommendations?: Array<{
    id: string;
    name: string;
    description: string;
    price: string;
    category: string;
    link?: string;
  }>;
  timestamp: number;
}

const GUEST_DATA_KEY = 'tlc-guest-profile-data';

export class GuestDataManager {
  /**
   * Save guest profile data to localStorage
   */
  static saveGuestData(data: Omit<GuestProfileData, 'timestamp'>): void {
    try {
      const guestData: GuestProfileData = {
        ...data,
        timestamp: Date.now()
      };
      
      localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(guestData));
      console.log('Guest data saved to localStorage:', guestData);
    } catch (error) {
      console.error('Failed to save guest data:', error);
    }
  }

  /**
   * Retrieve guest profile data from localStorage
   */
  static getGuestData(): GuestProfileData | null {
    try {
      const data = localStorage.getItem(GUEST_DATA_KEY);
      if (!data) return null;

      const guestData: GuestProfileData = JSON.parse(data);
      
      // Check if data is older than 24 hours (optional expiration)
      const dayInMs = 24 * 60 * 60 * 1000;
      if (Date.now() - guestData.timestamp > dayInMs) {
        this.clearGuestData();
        return null;
      }

      return guestData;
    } catch (error) {
      console.error('Failed to retrieve guest data:', error);
      return null;
    }
  }

  /**
   * Clear guest profile data from localStorage
   */
  static clearGuestData(): void {
    try {
      localStorage.removeItem(GUEST_DATA_KEY);
      console.log('Guest data cleared from localStorage');
    } catch (error) {
      console.error('Failed to clear guest data:', error);
    }
  }

  /**
   * Check if guest data exists
   */
  static hasGuestData(): boolean {
    return this.getGuestData() !== null;
  }

  /**
   * Convert guest data to profile format for database
   */
  static convertToProfileFormat(guestData: GuestProfileData) {
    return {
      name: guestData.recipientName,
      relationship: guestData.relationship,
      gender: "prefer_not_to_say" as const,
      age: parseInt(guestData.age, 10),
      interest: guestData.selectedInterests.join(", "),
      notes: []
    };
  }

  /**
   * Get occasion value (handles custom occasions)
   */
  static getOccasionValue(guestData: GuestProfileData): string {
    return guestData.occasion === "Other" && guestData.customOccasion 
      ? guestData.customOccasion 
      : guestData.occasion;
  }

  /**
   * Automatically save guest data to authenticated user's account
   */
  static async saveGuestDataToAccount(): Promise<boolean> {
    try {
      const guestData = this.getGuestData();
      if (!guestData) {
        console.log('No guest data found to save');
        return false;
      }

      // Import DatabaseService dynamically to avoid circular dependencies
      const { DatabaseService } = await import('./database');

      // Create the profile
      const profileData = this.convertToProfileFormat(guestData);
      const newProfile = await DatabaseService.createGiftProfile(profileData);

      // Save recommendations if they exist
      if (guestData.recommendations && guestData.recommendations.length > 0) {
        const occasionValue = this.getOccasionValue(guestData);
        const occasionDate = new Date(guestData.timestamp);
        
        await DatabaseService.saveRecommendations(
          newProfile.id,
          occasionValue,
          occasionDate,
          guestData.additionalNotes || '',
          guestData.recommendations
        );
      }

      // Clear guest data after successful save
      this.clearGuestData();
      
      console.log('Successfully saved guest data to user account:', {
        profileId: newProfile.id,
        recipientName: guestData.recipientName,
        recommendationsCount: guestData.recommendations?.length || 0
      });

      return true;
    } catch (error) {
      console.error('Failed to save guest data to account:', error);
      return false;
    }
  }
}
