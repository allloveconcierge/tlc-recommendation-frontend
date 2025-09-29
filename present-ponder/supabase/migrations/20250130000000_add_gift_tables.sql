-- Create gift_profiles table to store gift recipient profiles
CREATE TABLE public.gift_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  age INTEGER NOT NULL CHECK (age >= 16),
  interest TEXT NOT NULL,
  notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recommendations table to store generated gift recommendations
CREATE TABLE public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.gift_profiles(id) ON DELETE CASCADE,
  occasion TEXT NOT NULL,
  occasion_date TIMESTAMP WITH TIME ZONE,
  occasion_notes TEXT,
  recommendations JSONB NOT NULL, -- Store the full recommendation objects
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.gift_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies for gift_profiles
CREATE POLICY "Users can view their own gift profiles"
  ON public.gift_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gift profiles"
  ON public.gift_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gift profiles"
  ON public.gift_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gift profiles"
  ON public.gift_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for recommendations
CREATE POLICY "Users can view their own recommendations"
  ON public.recommendations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recommendations"
  ON public.recommendations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations"
  ON public.recommendations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recommendations"
  ON public.recommendations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update timestamps for gift_profiles
CREATE OR REPLACE FUNCTION public.handle_gift_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates on gift_profiles
CREATE TRIGGER update_gift_profiles_updated_at
  BEFORE UPDATE ON public.gift_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_gift_profiles_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_gift_profiles_user_id ON public.gift_profiles(user_id);
CREATE INDEX idx_recommendations_user_id ON public.recommendations(user_id);
CREATE INDEX idx_recommendations_profile_id ON public.recommendations(profile_id);
CREATE INDEX idx_recommendations_generated_at ON public.recommendations(generated_at DESC);
