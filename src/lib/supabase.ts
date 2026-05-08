import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

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
  status?: string;
  created_at: string;
};

export type GalleryImage = {
  id: string;
  title: string;
  category: string;
  url: string;
  alt: string;
  location?: string | null;
  caption?: string | null;
  before_url?: string | null;
  after_url?: string | null;
  video_url?: string | null;
  media_type?: 'image' | 'video';
  is_featured?: boolean;
  has_google_review_overlay?: boolean;
  display_order?: number;
  is_published?: boolean;
  created_at: string;
  updated_at?: string | null;
};

export type Review = {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  source: string;
  city: string | null;
  service_type: string | null;
  status: string;
  google_review_url: string | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

export type SocialPost = {
  id: string;
  platform: 'instagram' | 'facebook';
  url: string;
  caption: string;
  is_published: boolean;
  created_at: string;
};
