'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { getDeckWithCards } from '@/app/actions/decks'
import { createStudySession, recordCardResponse, completeStudySession } from '@/app/actions/study'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

export default function StudyPage() {
  const router = useRouter()
  const params = useParams()
  const [deck, setDeck] = useState<any>(null)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    async function loadDeck() {
      const deckId = parseInt(params.id as string)
      const deckData = await getDeckWithCards(deckId)
      if (deckData) {
        setDeck(deckData)
        const newSessionId = await createStudySession(deckData.id, deckData.flashcards.length)
        setSessionId(newSessionId)
      }
    }
    loadDeck()
  }, [params.id])

  if (!deck || !sessionId) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const currentCard = deck.flashcards[currentCardIndex]
  const progress = ((currentCardIndex) / deck.flashcards.length) * 100

  async function handleAnswer(correct: boolean) {
    await recordCardResponse(sessionId!, currentCard.id, correct)

    if (correct) {
      setCorrectCount(correctCount + 1)
    }

    if (currentCardIndex + 1 >= deck.flashcards.length) {
      await completeStudySession(sessionId!)
      setIsComplete(true)
    } else {
      setCurrentCardIndex(currentCardIndex + 1)
      setShowAnswer(false)
    }
  }

  if (isComplete) {
    const accuracy = Math.round((correctCount / deck.flashcards.length) * 100)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-3xl">Session Complete!</CardTitle>
            <CardDescription>Great work studying {deck.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-primary">{deck.flashcards.length}</p>
                <p className="text-sm text-muted-foreground">Cards Studied</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">{correctCount}</p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-600">{accuracy}%</p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">Back to Dashboard</Button>
              </Link>
              <Button onClick={() => router.refresh()} className="flex-1">
                Study Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-3xl py-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Card {currentCardIndex + 1} of {deck.flashcards.length}
            </span>
            <span className="text-sm font-medium">
              Score: {correctCount}/{currentCardIndex}
            </span>
          </div>
          <Progress value={progress} />
        </div>

        <Card className="min-h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle>{deck.title}</CardTitle>
            <CardDescription>{showAnswer ? 'Answer' : 'Question'}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-center flex-1 text-center p-8">
              <p className="text-2xl">
                {showAnswer ? currentCard.answer : currentCard.question}
              </p>
            </div>

            <div className="space-y-2">
              {!showAnswer ? (
                <Button
                  onClick={() => setShowAnswer(true)}
                  className="w-full"
                  size="lg"
                >
                  Show Answer
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleAnswer(false)}
                    variant="destructive"
                    size="lg"
                  >
                    Incorrect
                  </Button>
                  <Button
                    onClick={() => handleAnswer(true)}
                    className="bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    Correct
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
