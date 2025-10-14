'use server'

import { db } from '@/db'
import { decks, flashcards } from '@/db/schema'
import { getSession } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const createDeckSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  topic: z.string().min(1, 'Topic is required'),
})

export async function createDeck(formData: FormData) {
  const session = await getSession()
  if (!session) {
    redirect('/signin')
  }

  const rawData = {
    title: formData.get('title'),
    description: formData.get('description'),
    topic: formData.get('topic'),
  }

  const result = createDeckSchema.safeParse(rawData)
  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  const { title, description, topic } = result.data

  const [newDeck] = await db.insert(decks).values({
    userId: session.userId,
    title,
    description: description || null,
    topic,
  }).returning()

  revalidatePath('/dashboard')
  return { success: true, deckId: newDeck.id }
}

export async function deleteDeck(deckId: number) {
  const session = await getSession()
  if (!session) {
    redirect('/signin')
  }

  await db.delete(decks).where(
    and(
      eq(decks.id, deckId),
      eq(decks.userId, session.userId)
    )
  )

  revalidatePath('/dashboard')
  return { success: true }
}

export async function getUserDecks() {
  const session = await getSession()
  if (!session) {
    redirect('/signin')
  }

  const userDecks = await db.query.decks.findMany({
    where: eq(decks.userId, session.userId),
    orderBy: (decks, { desc }) => [desc(decks.createdAt)],
    with: {
      flashcards: true,
    },
  })

  return userDecks
}

export async function getDeckWithCards(deckId: number) {
  const session = await getSession()
  if (!session) {
    redirect('/signin')
  }

  const deck = await db.query.decks.findFirst({
    where: and(
      eq(decks.id, deckId),
      eq(decks.userId, session.userId)
    ),
    with: {
      flashcards: true,
    },
  })

  if (!deck) {
    return null
  }

  return deck
}

export async function generateFlashcards(deckId: number, topic: string, count: number = 10) {
  const session = await getSession()
  if (!session) {
    redirect('/signin')
  }

  try {
    // Import AI service dynamically to handle potential env var issues gracefully
    const { generateFlashcardsWithAI } = await import('@/lib/ai/flashcard-generator')

    // Generate flashcards using AI
    const generatedCards = await generateFlashcardsWithAI({
      topic,
      count,
      difficulty: 'intermediate', // Default difficulty, can be made configurable later
    })

    // Format for database insertion
    const flashcardsToInsert = generatedCards.map((card) => ({
      deckId,
      question: card.question,
      answer: card.answer,
    }))

    // Insert into database
    await db.insert(flashcards).values(flashcardsToInsert)

    revalidatePath(`/dashboard/deck/${deckId}`)
    return { success: true, count: flashcardsToInsert.length }
  } catch (error) {
    console.error('Error generating flashcards:', error)

    // Return error to be handled by the client
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate flashcards. Please try again.',
      count: 0
    }
  }
}
