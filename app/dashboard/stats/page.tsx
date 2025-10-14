import { getUserStats } from '@/app/actions/study'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function StatsPage() {
  const session = await getSession()
  if (!session) {
    redirect('/signin')
  }

  const stats = await getUserStats()

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl py-8">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost">← Back to Dashboard</Button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Your Study Statistics</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalSessions}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completed</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.completedSessions}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Cards Studied</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalCards}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Overall Accuracy</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{stats.accuracy}%</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Study Sessions</CardTitle>
            <CardDescription>Your last 5 study sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentSessions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No study sessions yet. Start studying to see your progress here!
              </p>
            ) : (
              <div className="space-y-4">
                {stats.recentSessions.map((session: any) => {
                  const accuracy = Math.round((session.correctAnswers / session.totalCards) * 100)
                  return (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{session.deck.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.startedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{accuracy}%</p>
                        <p className="text-sm text-muted-foreground">
                          {session.correctAnswers}/{session.totalCards} correct
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
