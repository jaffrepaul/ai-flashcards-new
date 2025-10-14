// Load environment variables FIRST before importing anything else
import { config } from 'dotenv'
config()

// Verify DATABASE_URL is set before importing db
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder')) {
  console.error('❌ DATABASE_URL is not set or is using placeholder value')
  console.error('Make sure you have a .env file with your NeonDB connection string')
  console.error('\nYour .env file should contain:')
  console.error('DATABASE_URL=postgresql://...')
  process.exit(1)
}

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../db/schema'
import { users, decks, flashcards } from '../db/schema'
import bcrypt from 'bcryptjs'

// Create a separate db connection for seeding
const sql = neon(process.env.DATABASE_URL)
const db = drizzle(sql, { schema })

async function seed() {
  console.log('🌱 Seeding database...')

  // Create test user
  const hashedPassword = await bcrypt.hash('password', 10)

  const [testUser] = await db.insert(users).values({
    email: 'test@test.com',
    password: hashedPassword,
    name: 'Test User',
  }).returning()

  console.log('✅ Created test user: test@test.com / password')

  // Create a sample deck
  const [sampleDeck] = await db.insert(decks).values({
    userId: testUser.id,
    title: 'JavaScript Basics',
    description: 'Essential JavaScript concepts for beginners',
    topic: 'JavaScript fundamentals including variables, functions, and control flow',
  }).returning()

  console.log('✅ Created sample deck: JavaScript Basics')

  // Create sample flashcards
  await db.insert(flashcards).values([
    {
      deckId: sampleDeck.id,
      question: 'What is a variable in JavaScript?',
      answer: 'A variable is a container for storing data values. You can declare variables using var, let, or const.',
    },
    {
      deckId: sampleDeck.id,
      question: 'What is the difference between let and const?',
      answer: 'let allows you to reassign values, while const creates a constant reference that cannot be reassigned.',
    },
    {
      deckId: sampleDeck.id,
      question: 'What is a function?',
      answer: 'A function is a reusable block of code designed to perform a specific task. Functions are declared using the function keyword or arrow syntax.',
    },
    {
      deckId: sampleDeck.id,
      question: 'What is the difference between == and ===?',
      answer: '== checks for value equality with type coercion, while === checks for both value and type equality (strict equality).',
    },
    {
      deckId: sampleDeck.id,
      question: 'What is an array?',
      answer: 'An array is a data structure that stores multiple values in a single variable. Arrays use square brackets [] and can hold values of any type.',
    },
  ])

  console.log('✅ Created 5 sample flashcards')
  console.log('\n🎉 Seeding complete!')
  console.log('\nTest account credentials:')
  console.log('Email: test@test.com')
  console.log('Password: password')

  process.exit(0)
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error)
  process.exit(1)
})
