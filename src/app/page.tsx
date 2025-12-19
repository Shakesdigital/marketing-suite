import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, TrendingUp, Calendar, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold">Shakes Digital Marketing Suite</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-6 text-5xl font-bold leading-tight">
            AI-Powered Social Media Marketing
            <br />
            <span className="text-blue-600">On Complete Autopilot</span>
          </h2>
          <p className="mb-8 text-xl text-gray-600">
            Let AI handle your entire social media strategy—from market research to content creation and scheduling.
            Perfect for businesses, agencies, and organizations of any size.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start Free <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="mb-12 text-center text-3xl font-bold">Everything You Need for Social Media Success</h3>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<Sparkles className="h-8 w-8 text-blue-600" />}
            title="AI Onboarding"
            description="Conversational AI guides you through business profiling in minutes"
          />
          <FeatureCard
            icon={<TrendingUp className="h-8 w-8 text-blue-600" />}
            title="Market Research"
            description="Automated competitor analysis and trend discovery for your niche"
          />
          <FeatureCard
            icon={<Calendar className="h-8 w-8 text-blue-600" />}
            title="Smart Planning"
            description="Custom marketing strategies with daily, weekly, and monthly plans"
          />
          <FeatureCard
            icon={<Zap className="h-8 w-8 text-blue-600" />}
            title="Auto Content"
            description="AI generates and schedules platform-optimized posts automatically"
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h3 className="mb-12 text-center text-3xl font-bold">How It Works</h3>
          <div className="mx-auto max-w-4xl space-y-8">
            <Step
              number={1}
              title="Tell Us About Your Business"
              description="Chat with our AI to share your business details, target audience, and goals"
            />
            <Step
              number={2}
              title="Get Your Custom Strategy"
              description="AI analyzes your market and creates a comprehensive marketing plan"
            />
            <Step
              number={3}
              title="Review & Approve Content"
              description="Preview AI-generated content calendar and make any adjustments"
            />
            <Step
              number={4}
              title="Sit Back & Grow"
              description="Content is automatically created and scheduled while you focus on your business"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl rounded-2xl bg-blue-600 p-12 text-white">
          <h3 className="mb-4 text-4xl font-bold">Ready to Transform Your Social Media?</h3>
          <p className="mb-8 text-xl">
            Join businesses using AI to automate their social media marketing
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="gap-2">
              Get Started Free <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 Shakes Digital Marketing Suite. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4">{icon}</div>
      <h4 className="mb-2 text-xl font-semibold">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex gap-6">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
        {number}
      </div>
      <div>
        <h4 className="mb-2 text-xl font-semibold">{title}</h4>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  )
}
