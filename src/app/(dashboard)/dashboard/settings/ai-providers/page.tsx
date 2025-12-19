'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  CheckCircle, 
  XCircle, 
  Zap, 
  Globe, 
  Brain,
  DollarSign,
  ExternalLink,
  AlertCircle
} from 'lucide-react'

interface ProviderStatus {
  name: string
  configured: boolean
  model: string
  icon: any
  color: string
  features: string[]
  setupUrl: string
  cost: string
}

export default function AIProvidersPage() {
  const [providers, setProviders] = useState<ProviderStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkProviders()
  }, [])

  async function checkProviders() {
    // In a real implementation, this would check the server
    // For now, we'll simulate based on environment
    const providerList: ProviderStatus[] = [
      {
        name: 'Groq',
        configured: false,
        model: 'Llama 3.1 70B',
        icon: Zap,
        color: 'text-orange-600',
        features: ['⚡ Ultra Fast', '💰 Free Forever', '🎯 Best Performance'],
        setupUrl: 'https://console.groq.com',
        cost: 'FREE'
      },
      {
        name: 'OpenRouter',
        configured: false,
        model: 'Llama 3.1 405B',
        icon: Globe,
        color: 'text-blue-600',
        features: ['🔀 Multi-Model', '💰 Free Tier', '🔄 Auto Fallback'],
        setupUrl: 'https://openrouter.ai/keys',
        cost: 'FREE'
      },
      {
        name: 'Hugging Face',
        configured: false,
        model: 'Llama 3.1 70B',
        icon: Brain,
        color: 'text-yellow-600',
        features: ['🌐 Open Source', '💰 Free', '📚 Thousands of Models'],
        setupUrl: 'https://huggingface.co/settings/tokens',
        cost: 'FREE'
      },
      {
        name: 'OpenAI',
        configured: false,
        model: 'GPT-4 Turbo',
        icon: DollarSign,
        color: 'text-green-600',
        features: ['⭐ Premium Quality', '💰 Paid', '🔧 Industry Standard'],
        setupUrl: 'https://platform.openai.com/api-keys',
        cost: '$20-100/mo'
      }
    ]

    setProviders(providerList)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading AI providers...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Provider Configuration</h1>
        <p className="text-gray-600">
          Configure free and paid AI providers for your marketing suite
        </p>
      </div>

      {/* Status Alert */}
      <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Getting Started</h3>
            <p className="text-sm text-gray-700 mb-3">
              Configure at least one AI provider to use all features. We recommend starting with <strong>Groq</strong> (free and fastest) 
              or <strong>OpenRouter</strong> (free with more model options).
            </p>
            <div className="bg-white/50 p-3 rounded text-sm font-mono">
              Add your API keys to <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> file
            </div>
          </div>
        </div>
      </Card>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providers.map((provider) => {
          const Icon = provider.icon
          const isFree = provider.cost === 'FREE'
          
          return (
            <Card key={provider.name} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg bg-gray-100 ${provider.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{provider.name}</h3>
                    <p className="text-sm text-gray-600">{provider.model}</p>
                  </div>
                </div>
                {provider.configured ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-gray-400" />
                )}
              </div>

              {/* Cost Badge */}
              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isFree ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {provider.cost}
                </span>
              </div>

              {/* Features */}
              <div className="mb-4 space-y-2">
                {provider.features.map((feature, idx) => (
                  <div key={idx} className="text-sm text-gray-700">
                    {feature}
                  </div>
                ))}
              </div>

              {/* Status */}
              <div className="mb-4">
                <Label className="text-sm font-medium">Status</Label>
                <div className={`mt-1 flex items-center gap-2 ${
                  provider.configured ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {provider.configured ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Configured and ready</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm">Not configured</span>
                    </>
                  )}
                </div>
              </div>

              {/* Setup Instructions */}
              <div className="border-t pt-4">
                <p className="text-sm text-gray-700 mb-3">
                  <strong>Setup Instructions:</strong>
                </p>
                <ol className="text-sm text-gray-600 space-y-2 mb-4 list-decimal list-inside">
                  <li>Visit the provider's website and sign up</li>
                  <li>Generate an API key</li>
                  <li>Add to your <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">.env.local</code> file</li>
                  <li>Restart your development server</li>
                </ol>

                <div className="flex gap-2">
                  <a 
                    href={provider.setupUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center h-9 rounded-md px-3 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Get API Key
                  </a>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Setup Guide */}
      <Card className="p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Environment Configuration</h3>
        <p className="text-sm text-gray-600 mb-4">
          Add your API keys to <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> file in your project root:
        </p>
        
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
          <pre className="text-sm">
{`# Choose at least one (Free options recommended!)

# Groq (FREE, FASTEST)
GROQ_API_KEY=gsk_your_key_here

# OpenRouter (FREE TIER)
OPENROUTER_API_KEY=sk-or-v1-your_key_here

# Hugging Face (FREE)
HUGGINGFACE_API_KEY=hf_your_token_here

# OpenAI (PAID, OPTIONAL)
OPENAI_API_KEY=sk-your_key_here`}
          </pre>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <strong className="text-yellow-900">Important:</strong>
              <p className="text-yellow-800 mt-1">
                After adding API keys, restart your development server with <code className="bg-yellow-100 px-2 py-0.5 rounded">npm run dev</code>
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Recommended Setup */}
      <Card className="p-6 mt-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <h3 className="text-lg font-semibold mb-4">🎯 Recommended Setup</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">For Beginners (Simple & Fast)</h4>
            <p className="text-sm text-gray-700 mb-2">
              Use <strong>Groq only</strong> - Lightning fast, completely free, excellent quality
            </p>
            <code className="text-xs bg-white p-2 rounded block">GROQ_API_KEY=gsk_your_key_here</code>
          </div>

          <div>
            <h4 className="font-medium mb-2">For Power Users (Redundancy)</h4>
            <p className="text-sm text-gray-700 mb-2">
              Use <strong>Groq + OpenRouter</strong> - Automatic fallback, still 100% free
            </p>
            <code className="text-xs bg-white p-2 rounded block">
              GROQ_API_KEY=gsk_your_key_here<br />
              OPENROUTER_API_KEY=sk-or-v1-your_key_here
            </code>
          </div>

          <div>
            <h4 className="font-medium mb-2">For Enterprises (Maximum Reliability)</h4>
            <p className="text-sm text-gray-700 mb-2">
              Use <strong>All providers</strong> - Triple redundancy with premium fallback
            </p>
            <code className="text-xs bg-white p-2 rounded block">
              GROQ_API_KEY=gsk_your_key_here<br />
              OPENROUTER_API_KEY=sk-or-v1-your_key_here<br />
              OPENAI_API_KEY=sk-your_key_here
            </code>
          </div>
        </div>
      </Card>
    </div>
  )
}
