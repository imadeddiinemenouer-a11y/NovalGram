/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
    VITE_BSCSCAN_API_KEY?: string;
    [key: string]: any;
  };
}