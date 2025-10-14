'use server'

import { db } from '@/db'
import { studySessions, cardResponses } from '@/db/schema'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'

export async function createStudySession(deckId: number, totalCards: number) {
  const session = await getSession()
  if (!session) {
    redirect('/signin')
  }

  const [newSession] = await db.insert(studySessions).values({
    userId: session.userId,
    deckId,
    totalCards,
    correctAnswers: 0,
  }).returning()

  return newSession.id
}

export async function recordCardResponse(sessionId: number, flashcardId: number, correct: boolean) {
  const session = await getSession()
  if (!session) {
    redirect('/signin')
  }

  await db.insert(cardResponses).values({
    sessionId,
    flashcardId,
    correct,
  })

  // Update correct answers count
  if (correct) {
    const studySession = await db.query.studySessions.findFirst({
      where: eq(studySessions.id, sessionId),
    })

    if (studySession) {
      await db.update(studySessions)
        .set({ correctAnswers: studySession.correctAnswers + 1 })
        .where(eq(studySessions.id, sessionId))
    }
  }

  return { success: true }
}

export async function completeStudySession(sessionId: number) {
  const session = await getSession()
  if (!session) {
    redirect('/signin')
  }

  await db.update(studySessions)
    .set({ completedAt: new Date() })
    .where(eq(studySessions.id, sessionId))

  return { success: true }
}

export async function getUserStats() {
  const session = await getSession()
  if (!session) {
    redirect('/signin')
  }

  const sessions = await db.query.studySessions.findMany({
    where: eq(studySessions.userId, session.userId),
    with: {
      deck: true,
    },
  })

  const totalSessions = sessions.length
  const completedSessions = sessions.filter(s => s.completedAt).length
  const totalCards = sessions.reduce((sum, s) => sum + s.totalCards, 0)
  const correctAnswers = sessions.reduce((sum, s) => sum + s.correctAnswers, 0)
  const accuracy = totalCards > 0 ? Math.round((correctAnswers / totalCards) * 100) : 0

  return {
    totalSessions,
    completedSessions,
    totalCards,
    correctAnswers,
    accuracy,
    recentSessions: sessions.slice(-5).reverse(),
  }
}
