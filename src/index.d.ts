export type Category = "icebreaker" | "conversation" | "deep-question" | "debate" | "speech" | "writing-prompt" | "journal";
export type Audience = "general" | "students" | "kids" | "esl" | "workplace";
export type Depth = "light" | "medium" | "deep";

export interface Topic {
  id: string;
  text: string;
  categories: Category[];
  audiences: Audience[];
  depth: Depth;
  tags: string[];
  /** angles to cover (debate, speech and conversation topics) */
  talkingPoints?: string[];
  /** follow-up questions (ESL speaking prompts) */
  followUps?: string[];
}

type OneOrMany<T> = T | T[];

export interface Filters {
  category?: OneOrMany<Category>;
  audience?: OneOrMany<Audience>;
  depth?: OneOrMany<Depth>;
  tag?: OneOrMany<string>;
  search?: string;
}

export const topics: readonly Topic[];
export const CATEGORIES: readonly Category[];
export const AUDIENCES: readonly Audience[];
export const DEPTHS: readonly Depth[];

export function rng(seed: string | number): () => number;
export function filter(opts?: Filters, list?: readonly Topic[]): Topic[];
export function random(opts?: Filters & { seed?: string | number }): Topic | null;

export interface Session {
  random(filters?: Filters): Topic | null;
  take(n: number, filters?: Filters): Topic[];
  remaining(filters?: Filters): number;
  reset(): void;
  readonly used: number;
}
export function createSession(opts?: { seed?: string | number; recycle?: boolean }): Session;
