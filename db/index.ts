import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

// Use a dummy URL for build time if DATABASE_URL is not set
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder'

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL environment variable is not set. Using placeholder for build.')
}

const sql = neon(DATABASE_URL)
export const db = drizzle(sql, { schema })
