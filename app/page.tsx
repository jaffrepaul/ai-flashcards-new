import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl font-bold mb-6">AI Flashcards</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Create and study flashcards powered by AI. Master any topic with intelligent learning.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/signin">
            <Button size="lg" variant="outline">Sign In</Button>
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">AI-Generated Content</h3>
            <p className="text-sm text-muted-foreground">
              Create flashcards from any topic using advanced AI
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">Progress Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Detailed analytics on your study patterns
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">Interactive Study</h3>
            <p className="text-sm text-muted-foreground">
              Engaging quiz mode with performance feedback
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">Responsive Design</h3>
            <p className="text-sm text-muted-foreground">
              Works on desktop, tablet, and mobile
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
