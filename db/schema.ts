import { pgTable, text, serial, timestamp, integer, boolean } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const decks = pgTable('decks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  topic: text('topic').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const flashcards = pgTable('flashcards', {
  id: serial('id').primaryKey(),
  deckId: integer('deck_id').notNull().references(() => decks.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const studySessions = pgTable('study_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  deckId: integer('deck_id').notNull().references(() => decks.id, { onDelete: 'cascade' }),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  totalCards: integer('total_cards').notNull(),
  correctAnswers: integer('correct_answers').notNull().default(0),
})

export const cardResponses = pgTable('card_responses', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').notNull().references(() => studySessions.id, { onDelete: 'cascade' }),
  flashcardId: integer('flashcard_id').notNull().references(() => flashcards.id, { onDelete: 'cascade' }),
  correct: boolean('correct').notNull(),
  answeredAt: timestamp('answered_at').defaultNow().notNull(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  decks: many(decks),
  studySessions: many(studySessions),
}))

export const decksRelations = relations(decks, ({ one, many }) => ({
  user: one(users, {
    fields: [decks.userId],
    references: [users.id],
  }),
  flashcards: many(flashcards),
  studySessions: many(studySessions),
}))

export const flashcardsRelations = relations(flashcards, ({ one, many }) => ({
  deck: one(decks, {
    fields: [flashcards.deckId],
    references: [decks.id],
  }),
  responses: many(cardResponses),
}))

export const studySessionsRelations = relations(studySessions, ({ one, many }) => ({
  user: one(users, {
    fields: [studySessions.userId],
    references: [users.id],
  }),
  deck: one(decks, {
    fields: [studySessions.deckId],
    references: [decks.id],
  }),
  cardResponses: many(cardResponses),
}))

export const cardResponsesRelations = relations(cardResponses, ({ one }) => ({
  session: one(studySessions, {
    fields: [cardResponses.sessionId],
    references: [studySessions.id],
  }),
  flashcard: one(flashcards, {
    fields: [cardResponses.flashcardId],
    references: [flashcards.id],
  }),
}))
