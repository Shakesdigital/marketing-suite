import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime'
import OpenAI from 'openai'
import { NextRequest } from 'next/server'
import { getPrimaryProvider, hasAnyProvider, getProviderSetupMessage } from '@/lib/ai/providers'

// Get the primary AI provider (with fallback)
function getServiceAdapter() {
  const provider = getPrimaryProvider()

  if (!provider) {
    console.error('[CopilotKit] No AI provider configured!')
    console.error(getProviderSetupMessage())
    throw new Error('No AI provider configured. Please set up at least one API key.')
  }

  console.log(`[CopilotKit] Using ${provider.name} as primary provider`)

  // Create OpenAI-compatible client for Groq, OpenRouter, or OpenAI
  const client = new OpenAI({
    apiKey: provider.apiKey,
    baseURL: provider.baseURL,
    defaultHeaders: provider.name === 'openrouter' ? {
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'Shakes Digital Marketing Suite',
    } : undefined,
  })

  return new OpenAIAdapter({ 
    openai: client,
    model: provider.models.standard, // Use standard model for CopilotKit actions
  })
}

const runtime = new CopilotRuntime()

export const POST = async (req: NextRequest) => {
  try {
    // Check if providers are configured
    if (!hasAnyProvider()) {
      return new Response(
        JSON.stringify({
          error: 'No AI provider configured',
          message: getProviderSetupMessage(),
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const serviceAdapter = getServiceAdapter()

    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter,
      endpoint: '/api/copilotkit',
    })

    return handleRequest(req)
  } catch (error: any) {
    console.error('[CopilotKit] Error:', error)
    return new Response(
      JSON.stringify({
        error: 'AI service error',
        message: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
