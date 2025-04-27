import { Metadata, ResolvingMetadata } from "next";

// Next.js 15 için tiplerle ilgili geçersiz kılmalar
declare module "next" {
  export interface PageProps {
    params?: Record<string, string>;
    searchParams?: Record<string, string | string[]>;
  }
} 