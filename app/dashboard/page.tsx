import { getUserDecks } from '@/app/actions/decks'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { signOut } from '@/app/actions/auth'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) {
    redirect('/signin')
  }

  const userDecks = await getUserDecks()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">AI Flashcards</h1>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/stats">
              <Button variant="ghost" size="sm">View Stats</Button>
            </Link>
            <span className="text-sm text-muted-foreground">Welcome, {session.name}</span>
            <form action={signOut}>
              <Button variant="outline" size="sm">Sign Out</Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Your Decks</h2>
          <Link href="/dashboard/create-deck">
            <Button>Create New Deck</Button>
          </Link>
        </div>

        {userDecks.length === 0 ? (
          <Card className="p-12 text-center">
            <CardContent>
              <p className="text-muted-foreground mb-4">You haven&apos;t created any decks yet.</p>
              <Link href="/dashboard/create-deck">
                <Button>Create Your First Deck</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userDecks.map((deck) => (
              <Card key={deck.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{deck.title}</CardTitle>
                  <CardDescription>{deck.topic}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {deck.flashcards.length} cards
                  </p>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/deck/${deck.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">View</Button>
                    </Link>
                    <Link href={`/dashboard/study/${deck.id}`} className="flex-1">
                      <Button className="w-full">Study</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
