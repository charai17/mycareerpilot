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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };
      billing_profiles: {
        Row: {
          id: string;
          user_id: string;
          plan: "trial" | "pro" | "premium";
          status: "trialing" | "active" | "past_due" | "cancelled";
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          tailored_cv_credits: number;
          job_scan_interval_days: number;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan?: "trial" | "pro" | "premium";
          status?: "trialing" | "active" | "past_due" | "cancelled";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          tailored_cv_credits?: number;
          job_scan_interval_days?: number;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          plan?: "trial" | "pro" | "premium";
          status?: "trialing" | "active" | "past_due" | "cancelled";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          tailored_cv_credits?: number;
          job_scan_interval_days?: number;
          current_period_end?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      credit_ledger: {
        Row: {
          id: string;
          user_id: string;
          credit_type: "tailored_cv";
          amount: number;
          reason: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          credit_type: "tailored_cv";
          amount: number;
          reason: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
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
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
