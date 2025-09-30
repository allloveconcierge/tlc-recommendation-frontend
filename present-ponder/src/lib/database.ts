import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

// Types for our gift profiles and recommendations
export interface GiftProfile {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  gender: string;
  age: number;
  interest: string;
  notes: Array<{ id: string; text: string; date: string }>;
  created_at: string;
  updated_at: string;
}

export interface Recommendation {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  link?: string;
}

export interface RecommendationSet {
  id: string;
  user_id: string;
  profile_id: string;
  occasion: string;
  occasion_date: string | null;
  occasion_notes: string | null;
  recommendations: Recommendation[];
  generated_at: string;
  created_at: string;
}

// Database service functions
export class DatabaseService {
  // Gift Profiles
  static async getGiftProfiles(): Promise<GiftProfile[]> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, returning empty profiles');
      return [];
    }

    const { data, error } = await supabase
      .from('gift_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching gift profiles:', error);
      throw error;
    }

    return data || [];
  }

  static async createGiftProfile(profile: Omit<GiftProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<GiftProfile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('gift_profiles')
      .insert({
        user_id: user.id,
        ...profile,
        notes: profile.notes || []
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating gift profile:', error);
      throw error;
    }

    return data;
  }

  static async updateGiftProfile(id: string, updates: Partial<Omit<GiftProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<GiftProfile> {
    const { data, error } = await supabase
      .from('gift_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating gift profile:', error);
      throw error;
    }

    return data;
  }

  static async deleteGiftProfile(id: string): Promise<void> {
    const { error } = await supabase
      .from('gift_profiles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting gift profile:', error);
      throw error;
    }
  }

  // Recommendations
  static async getRecommendations(profileId?: string): Promise<RecommendationSet[]> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, returning empty recommendations');
      return [];
    }

    let query = supabase
      .from('recommendations')
      .select('*')
      .order('generated_at', { ascending: false });

    if (profileId) {
      query = query.eq('profile_id', profileId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }

    return data || [];
  }

  static async saveRecommendations(
    profileId: string,
    occasion: string,
    occasionDate: Date | null,
    occasionNotes: string | null,
    recommendations: Recommendation[]
  ): Promise<RecommendationSet> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('recommendations')
      .insert({
        user_id: user.id,
        profile_id: profileId,
        occasion,
        occasion_date: occasionDate?.toISOString() || null,
        occasion_notes: occasionNotes,
        recommendations
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving recommendations:', error);
      throw error;
    }

    return data;
  }

  static async deleteRecommendations(id: string): Promise<void> {
    const { error } = await supabase
      .from('recommendations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting recommendations:', error);
      throw error;
    }
  }

  // User accumulated notes
  static async getAccumulatedNotes(): Promise<string> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, returning empty accumulated notes');
      return '';
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return '';

    const { data, error } = await supabase
      .from('profiles')
      .select('accumulated_notes')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching accumulated notes:', error);
      return '';
    }

    return data?.accumulated_notes || '';
  }

  static async updateAccumulatedNotes(notes: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update({ accumulated_notes: notes })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating accumulated notes:', error);
      throw error;
    }
  }
}
