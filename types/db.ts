import { Database } from '@/types_db';

export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Price = Database['public']['Tables']['prices']['Row'];
export type Job = Database['public']['Tables']['jobs']['Row'];
export type JobStatus = Database['public']['Enums']['job_status'];
export type BillingInterval = 'lifetime' | 'year' | 'month';

export type Transcript = {
  words: {
    word: string;
    time_begin: number;
    time_end: number;
    confidence: number;
  }[];
  language: string;
  transcription: string;
  confidence: number;
  time_begin: number;
  time_end: number;
  speaker: string;
  channel: string;
}[];

export type OnFailedJob = (jobId: string, message: string) => void;

export interface ProductWithPrices extends Product {
  prices: Price[];
}
export interface PriceWithProduct extends Price {
  products: Product | null;
}

export interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}
