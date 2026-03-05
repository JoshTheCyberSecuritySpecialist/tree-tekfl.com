import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export type ServiceRequest = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  service_type: string;
  urgency: string;
  preferred_date: string | null;
  description: string;
  photos: string[];
  created_at: string;
};

export type GalleryImage = {
  id: string;
  title: string;
  category: string;
  url: string;
  alt: string;
  created_at: string;
};

export type SocialPost = {
  id: string;
  platform: 'instagram' | 'facebook';
  url: string;
  caption: string;
  is_published: boolean;
  created_at: string;
};
