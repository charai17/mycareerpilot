export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          headline: string | null;
          target_roles: string[];
          regions: string[];
          salary_expectation: string | null;
          seniority: string | null;
          career_summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string | null;
          headline?: string | null;
          target_roles?: string[];
          regions?: string[];
          salary_expectation?: string | null;
          seniority?: string | null;
          career_summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          headline?: string | null;
          target_roles?: string[];
          regions?: string[];
          salary_expectation?: string | null;
          seniority?: string | null;
          career_summary?: string | null;
          updated_at?: string;
        };
      };
      cvs: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          source_type: "built" | "uploaded" | "tailored";
          content: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          source_type?: "built" | "uploaded" | "tailored";
          content?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          source_type?: "built" | "uploaded" | "tailored";
          content?: Json;
          updated_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          company: string | null;
          location: string | null;
          salary: string | null;
          source: string | null;
          url: string | null;
          description: string | null;
          match_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          company?: string | null;
          location?: string | null;
          salary?: string | null;
          source?: string | null;
          url?: string | null;
          description?: string | null;
          match_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          company?: string | null;
          location?: string | null;
          salary?: string | null;
          source?: string | null;
          url?: string | null;
          description?: string | null;
          match_score?: number | null;
          updated_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          user_id: string;
          job_id: string;
          cv_id: string | null;
          status: "discovered" | "saved" | "drafted" | "ready" | "applied" | "interview" | "rejected" | "offer";
          submitted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_id: string;
          cv_id?: string | null;
          status?: "discovered" | "saved" | "drafted" | "ready" | "applied" | "interview" | "rejected" | "offer";
          submitted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          cv_id?: string | null;
          status?: "discovered" | "saved" | "drafted" | "ready" | "applied" | "interview" | "rejected" | "offer";
          submitted_at?: string | null;
          updated_at?: string;
        };
      };
      application_drafts: {
        Row: {
          id: string;
          user_id: string;
          application_id: string;
          draft_type: "cv" | "cover_letter" | "answer";
          content: Json;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id: string;
          draft_type: "cv" | "cover_letter" | "answer";
          content?: Json;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          content?: Json;
          approved_at?: string | null;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string;
          application_id: string | null;
          action: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id?: string | null;
          action: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: never;
      };
    };
  };
};
