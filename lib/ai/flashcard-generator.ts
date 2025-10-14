import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

// Schema for validating AI-generated flashcards
const flashcardSchema = z.object({
  flashcards: z.array(
    z.object({
      question: z.string().min(5, 'Question must be at least 5 characters'),
      answer: z.string().min(3, 'Answer must be at least 3 characters'),
    })
  ),
})

export type GeneratedFlashcards = z.infer<typeof flashcardSchema>

interface GenerateFlashcardsOptions {
  topic: string
  count: number
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  enableFallback?: boolean
}

// Custom error types for better error handling
export class FlashcardGenerationError extends Error {
  constructor(
    message: string,
    public readonly code: 'AUTH_ERROR' | 'RATE_LIMIT' | 'NETWORK_ERROR' | 'TIMEOUT' | 'VALIDATION_ERROR' | 'UNKNOWN',
    public readonly retryable: boolean = false
  ) {
    super(message)
    this.name = 'FlashcardGenerationError'
  }
}

/**
 * Generates flashcards using Claude AI with comprehensive error handling and fallbacks
 * @param options - Configuration for flashcard generation
 * @returns Array of generated flashcards with questions and answers
 */
export async function generateFlashcardsWithAI(
  options: GenerateFlashcardsOptions
): Promise<{ question: string; answer: string }[]> {
  const { topic, count, difficulty = 'intermediate', enableFallback = true } = options

  try {
    // Attempt to generate with retry logic
    const flashcards = await generateWithRetry(topic, count, difficulty)

    // Handle partial success - accept if we got at least 50% of requested cards
    const minAcceptable = Math.ceil(count * 0.5)
    if (flashcards.length < minAcceptable) {
      throw new FlashcardGenerationError(
        `Only generated ${flashcards.length} of ${count} requested flashcards`,
        'VALIDATION_ERROR',
        true
      )
    }

    // Warn if we didn't get all requested cards but accept partial success
    if (flashcards.length < count) {
      console.warn(
        `Partial success: Expected ${count} flashcards, got ${flashcards.length}`
      )
    }

    return flashcards
  } catch (error) {
    console.error('Error generating flashcards with AI:', error)

    // If fallback is enabled and error is not auth-related, use fallback
    if (enableFallback && error instanceof FlashcardGenerationError && error.code !== 'AUTH_ERROR') {
      console.log('Using fallback flashcard generation')
      return generateFallbackFlashcards(topic, count, difficulty)
    }

    // Re-throw with user-friendly message
    if (error instanceof FlashcardGenerationError) {
      throw error
    }

    throw new FlashcardGenerationError(
      'Failed to generate flashcards. Please try again.',
      'UNKNOWN',
      true
    )
  }
}

/**
 * Generates flashcards with retry logic and exponential backoff
 */
async function generateWithRetry(
  topic: string,
  count: number,
  difficulty: string,
  maxRetries: number = 3
): Promise<{ question: string; answer: string }[]> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Add timeout protection (30 seconds)
      const result = await Promise.race([
        generateFlashcardsInternal(topic, count, difficulty),
        createTimeout(30000)
      ])

      return result
    } catch (error) {
      lastError = error as Error
      const flashcardError = classifyError(error)

      // Don't retry if it's an auth error or non-retryable error
      if (!flashcardError.retryable) {
        throw flashcardError
      }

      // Don't retry on the last attempt
      if (attempt < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000
        console.log(`Retry attempt ${attempt + 1} after ${delay}ms`)
        await sleep(delay)
      }
    }
  }

  // All retries exhausted
  throw new FlashcardGenerationError(
    `Failed after ${maxRetries} attempts: ${lastError?.message}`,
    'UNKNOWN',
    false
  )
}

/**
 * Internal function that performs the actual AI generation
 */
async function generateFlashcardsInternal(
  topic: string,
  count: number,
  difficulty: string
): Promise<{ question: string; answer: string }[]> {
  const prompt = buildPrompt(topic, count, difficulty)

  const result = await generateObject({
    model: anthropic('claude-sonnet-4-latest'),
    schema: flashcardSchema,
    prompt,
    temperature: 0.7,
    maxRetries: 0, // We handle retries ourselves
  })

  return result.object.flashcards
}

/**
 * Classifies errors into specific types for better handling
 */
function classifyError(error: unknown): FlashcardGenerationError {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorString = errorMessage.toLowerCase()

  // Check for authentication errors
  if (errorString.includes('authentication') || errorString.includes('api key') || errorString.includes('unauthorized')) {
    return new FlashcardGenerationError(
      'Authentication failed. Please check your API key.',
      'AUTH_ERROR',
      false
    )
  }

  // Check for rate limiting
  if (errorString.includes('rate limit') || errorString.includes('429') || errorString.includes('too many requests')) {
    return new FlashcardGenerationError(
      'Rate limit exceeded. Please try again in a moment.',
      'RATE_LIMIT',
      true
    )
  }

  // Check for network errors
  if (errorString.includes('network') || errorString.includes('fetch') || errorString.includes('econnrefused')) {
    return new FlashcardGenerationError(
      'Network error. Please check your connection.',
      'NETWORK_ERROR',
      true
    )
  }

  // Check for timeout
  if (errorString.includes('timeout') || errorString.includes('timed out')) {
    return new FlashcardGenerationError(
      'Request timed out. Please try again.',
      'TIMEOUT',
      true
    )
  }

  // Generic error
  return new FlashcardGenerationError(
    errorMessage || 'An unknown error occurred',
    'UNKNOWN',
    true
  )
}

/**
 * Generates fallback flashcards when AI generation fails
 * These are basic but valid flashcards to ensure users can still use the app
 */
function generateFallbackFlashcards(
  topic: string,
  count: number,
  difficulty: string
): { question: string; answer: string }[] {
  console.warn('Generating fallback flashcards - AI generation failed')

  return Array.from({ length: count }, (_, i) => ({
    question: `Question ${i + 1}: What is an important concept related to ${topic}?`,
    answer: `This is a placeholder answer for question ${i + 1} about ${topic}. The AI service was temporarily unavailable. Please edit this card or regenerate the deck.`,
  }))
}

/**
 * Creates a timeout promise
 */
function createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new FlashcardGenerationError(
        `Request timed out after ${ms}ms`,
        'TIMEOUT',
        true
      ))
    }, ms)
  })
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Builds the prompt for flashcard generation
 */
function buildPrompt(
  topic: string,
  count: number,
  difficulty: string
): string {
  return `You are an expert educator creating high-quality flashcards for students.

Generate exactly ${count} flashcards about: "${topic}"

Requirements:
- Difficulty level: ${difficulty}
- Each flashcard must have a clear, specific question
- Answers should be concise but complete
- Questions should test understanding, not just memorization
- Avoid ambiguous or trick questions
- Use proper grammar and spelling
- For ${difficulty} level:
  ${getDifficultyGuidelines(difficulty)}

Focus on creating educational value and clear learning objectives.`
}

/**
 * Returns difficulty-specific guidelines
 */
function getDifficultyGuidelines(difficulty: string): string {
  switch (difficulty) {
    case 'beginner':
      return '- Use simple, straightforward questions\n  - Focus on basic concepts and definitions\n  - Keep answers brief and clear'
    case 'intermediate':
      return '- Include some application and analysis questions\n  - Mix definitions with conceptual understanding\n  - Answers can be more detailed'
    case 'advanced':
      return '- Include complex, multi-step questions\n  - Focus on synthesis and evaluation\n  - Encourage critical thinking and deeper analysis'
    default:
      return '- Balance between recall and understanding'
  }
}
