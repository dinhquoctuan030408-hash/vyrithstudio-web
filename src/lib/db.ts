import { Redis } from '@upstash/redis';

// Tự động nhận biến Vercel KV / Upstash Redis
export const redis = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL) ? new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '',
}) : null;