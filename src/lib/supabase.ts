/**
 * Supabase Client Configuration
 * 
 * Creates and exports the Supabase client for database operations.
 * Uses service role key for server-side scripts (full access).
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!supabaseServiceKey && !supabaseAnonKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variable');
}

// Use service role key for scripts (bypasses RLS)
// Use anon key for client-side (respects RLS)
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Type exports (will be generated with supabase gen types typescript --project-id <project-id>)
export type Database = {
  public: {
    Tables: {
      jobs: {
        Row: {
          id: string;
          company_id: string | null;
          category_id: string | null;
          job_title: string;
          description: string;
          short_description: string | null;
          apply_link: string;
          date_posted: string; // DATE
          location_scope: string;
          contract_type: string | null;
          status: string;
          source: string;
          company_logo_url: string | null;
          salary_min: number | null;
          salary_max: number | null;
          salary_currency: string | null;
          location_detail: string | null;
          location_country_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          company_id?: string | null;
          category_id?: string | null;
          job_title: string;
          description: string;
          short_description?: string | null;
          apply_link: string;
          date_posted: string; // DATE
          location_scope: string;
          contract_type?: string | null;
          status?: string;
          source: string;
          company_logo_url?: string | null;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: string | null;
          location_detail?: string | null;
          location_country_code?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          category_id?: string | null;
          job_title?: string;
          description?: string;
          short_description?: string | null;
          apply_link?: string;
          date_posted?: string;
          location_scope?: string;
          contract_type?: string | null;
          status?: string;
          source?: string;
          company_logo_url?: string | null;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: string | null;
          location_detail?: string | null;
          location_country_code?: string | null;
        };
      };
      companies: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          website: string | null;
          location: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          logo_url?: string | null;
          website?: string | null;
          location?: string | null;
          description?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          logo_url?: string | null;
          website?: string | null;
          location?: string | null;
          description?: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          icon_url?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          icon_url?: string | null;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          icon_url?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          icon_url?: string | null;
        };
      };
      job_tags: {
        Row: {
          job_id: string;
          tag_id: string;
        };
        Insert: {
          job_id: string;
          tag_id: string;
        };
        Update: {
          job_id?: string;
          tag_id?: string;
        };
      };
    };
  };
};

