import { getDeckWithCards, deleteDeck } from '@/app/actions/decks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DeckDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const deckId = parseInt(id)
  const deck = await getDeckWithCards(deckId)

  if (!deck) {
    redirect('/dashboard')
  }

  async function handleDelete() {
    'use server'
    await deleteDeck(deckId)
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost">← Back to Dashboard</Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl">{deck.title}</CardTitle>
                <CardDescription className="mt-2">Topic: {deck.topic}</CardDescription>
                {deck.description && (
                  <p className="text-sm text-muted-foreground mt-2">{deck.description}</p>
                )}
              </div>
              <form action={handleDelete}>
                <Button variant="destructive" size="sm">Delete Deck</Button>
              </form>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Link href={`/dashboard/study/${deck.id}`} className="flex-1">
                <Button className="w-full">Start Studying</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <h3 className="text-xl font-semibold mb-4">Flashcards ({deck.flashcards.length})</h3>
        <div className="space-y-4">
          {deck.flashcards.map((card, index) => (
            <Card key={card.id}>
              <CardHeader>
                <CardTitle className="text-lg">Card {index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Question:</p>
                  <p className="mt-1">{card.question}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Answer:</p>
                  <p className="mt-1">{card.answer}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
