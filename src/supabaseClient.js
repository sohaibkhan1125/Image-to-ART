import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://deyzyxzqlsyszbmeqiqx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRleXp5eHpxbHN5c3pibWVxaXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMjM5MTMsImV4cCI6MjA4MDg5OTkxM30.d480g6oM_Apkcc1MT1PLSwyk668JLB3Bz4Lz7C6gYWA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
