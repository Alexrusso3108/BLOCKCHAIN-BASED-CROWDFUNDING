import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bnxwqomkrimztfohnyrb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueHdxb21rcmltenRmb2hueXJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5OTY5ODQsImV4cCI6MjA3NjU3Mjk4NH0.7YtMJaV5mCCxGlOibrbt5w4N-Jl2bqWFE3ppF7BDrP0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
