// Self-Hosted Local AI Models Support
// For unlimited runs without API limits

export type LocalModelProvider = 'ollama' | 'llamacpp' | 'transformers' | 'vllm' | 'textgen-webui'

export interface LocalModelConfig {
  provider: LocalModelProvider
  baseURL: string
  model: string
  enabled: boolean
  priority: number
  maxTokens?: number
  contextWindow?: number
}

// Local model configurations
export const LOCAL_MODELS: Record<LocalModelProvider, Omit<LocalModelConfig, 'baseURL' | 'enabled'>> = {
  ollama: {
    provider: 'ollama',
    model: 'llama3.1:8b', // or llama3.1:70b for better quality
    priority: 10, // Lower priority than cloud (fallback)
    maxTokens: 2000,
    contextWindow: 8192,
  },
  llamacpp: {
    provider: 'llamacpp',
    model: 'llama-3.1-8b-instruct',
    priority: 11,
    maxTokens: 2000,
    contextWindow: 8192,
  },
  transformers: {
    provider: 'transformers',
    model: 'meta-llama/Llama-3.1-8B-Instruct',
    priority: 12,
    maxTokens: 2000,
    contextWindow: 8192,
  },
  vllm: {
    provider: 'vllm',
    model: 'meta-llama/Llama-3.1-8B-Instruct',
    priority: 13,
    maxTokens: 2000,
    contextWindow: 8192,
  },
  'textgen-webui': {
    provider: 'textgen-webui',
    model: 'llama-3.1-8b-instruct',
    priority: 14,
    maxTokens: 2000,
    contextWindow: 8192,
  },
}

/**
 * Get enabled local models from environment
 */
export function getEnabledLocalModels(): LocalModelConfig[] {
  const models: LocalModelConfig[] = []

  // Ollama (most popular, easiest to setup)
  if (process.env.OLLAMA_BASE_URL) {
    models.push({
      ...LOCAL_MODELS.ollama,
      baseURL: process.env.OLLAMA_BASE_URL,
      model: process.env.OLLAMA_MODEL || LOCAL_MODELS.ollama.model,
      enabled: true,
    })
  }

  // llama.cpp server
  if (process.env.LLAMACPP_BASE_URL) {
    models.push({
      ...LOCAL_MODELS.llamacpp,
      baseURL: process.env.LLAMACPP_BASE_URL,
      model: process.env.LLAMACPP_MODEL || LOCAL_MODELS.llamacpp.model,
      enabled: true,
    })
  }

  // Hugging Face Transformers (local inference)
  if (process.env.TRANSFORMERS_BASE_URL) {
    models.push({
      ...LOCAL_MODELS.transformers,
      baseURL: process.env.TRANSFORMERS_BASE_URL,
      model: process.env.TRANSFORMERS_MODEL || LOCAL_MODELS.transformers.model,
      enabled: true,
    })
  }

  // vLLM (high-performance inference)
  if (process.env.VLLM_BASE_URL) {
    models.push({
      ...LOCAL_MODELS.vllm,
      baseURL: process.env.VLLM_BASE_URL,
      model: process.env.VLLM_MODEL || LOCAL_MODELS.vllm.model,
      enabled: true,
    })
  }

  // Text Generation WebUI
  if (process.env.TEXTGEN_BASE_URL) {
    models.push({
      ...LOCAL_MODELS['textgen-webui'],
      baseURL: process.env.TEXTGEN_BASE_URL,
      model: process.env.TEXTGEN_MODEL || LOCAL_MODELS['textgen-webui'].model,
      enabled: true,
    })
  }

  // Sort by priority
  return models.sort((a, b) => a.priority - b.priority)
}

/**
 * Check if any local model is configured
 */
export function hasLocalModels(): boolean {
  return getEnabledLocalModels().length > 0
}

/**
 * Call Ollama API
 */
export async function callOllama(
  baseURL: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  options?: { temperature?: number; maxTokens?: number }
): Promise<{ content: string }> {
  const response = await fetch(`${baseURL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: {
        temperature: options?.temperature || 0.7,
        num_predict: options?.maxTokens || 2000,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}`)
  }

  const data = await response.json()
  return { content: data.message?.content || '' }
}

/**
 * Call llama.cpp server
 */
export async function callLlamaCpp(
  baseURL: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  options?: { temperature?: number; maxTokens?: number }
): Promise<{ content: string }> {
  // Convert messages to prompt
  const prompt = messages
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n')

  const response = await fetch(`${baseURL}/completion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: prompt + '\n\nAssistant:',
      temperature: options?.temperature || 0.7,
      n_predict: options?.maxTokens || 2000,
      stop: ['User:', '\n\nUser:'],
    }),
  })

  if (!response.ok) {
    throw new Error(`llama.cpp API error: ${response.statusText}`)
  }

  const data = await response.json()
  return { content: data.content || '' }
}

/**
 * Call vLLM server (OpenAI-compatible)
 */
export async function callVLLM(
  baseURL: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  options?: { temperature?: number; maxTokens?: number }
): Promise<{ content: string }> {
  const response = await fetch(`${baseURL}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 2000,
    }),
  })

  if (!response.ok) {
    throw new Error(`vLLM API error: ${response.statusText}`)
  }

  const data = await response.json()
  return { content: data.choices?.[0]?.message?.content || '' }
}

/**
 * Call Text Generation WebUI
 */
export async function callTextGenWebUI(
  baseURL: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  options?: { temperature?: number; maxTokens?: number }
): Promise<{ content: string }> {
  const response = await fetch(`${baseURL}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      mode: 'chat',
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 2000,
    }),
  })

  if (!response.ok) {
    throw new Error(`Text Generation WebUI API error: ${response.statusText}`)
  }

  const data = await response.json()
  return { content: data.choices?.[0]?.message?.content || '' }
}

/**
 * Universal call to local model
 */
export async function callLocalModel(
  config: LocalModelConfig,
  messages: Array<{ role: string; content: string }>,
  options?: { temperature?: number; maxTokens?: number }
): Promise<{ content: string; provider: string; model: string }> {
  let result: { content: string }

  switch (config.provider) {
    case 'ollama':
      result = await callOllama(config.baseURL, config.model, messages, options)
      break
    case 'llamacpp':
      result = await callLlamaCpp(config.baseURL, config.model, messages, options)
      break
    case 'vllm':
      result = await callVLLM(config.baseURL, config.model, messages, options)
      break
    case 'textgen-webui':
      result = await callTextGenWebUI(config.baseURL, config.model, messages, options)
      break
    case 'transformers':
      // Transformers would need a custom server implementation
      throw new Error('Transformers provider not yet implemented')
    default:
      throw new Error(`Unknown local provider: ${config.provider}`)
  }

  return {
    content: result.content,
    provider: config.provider,
    model: config.model,
  }
}

/**
 * Get setup instructions for local models
 */
export function getLocalModelSetupInstructions(provider: LocalModelProvider): string {
  const instructions = {
    ollama: `
# Ollama Setup (Recommended - Easiest!)

1. Install Ollama:
   - macOS/Linux: curl -fsSL https://ollama.com/install.sh | sh
   - Windows: Download from https://ollama.com/download

2. Pull a model:
   ollama pull llama3.1:8b    # Fast, 4.7GB
   ollama pull llama3.1:70b   # Best quality, 40GB

3. Start server (runs on http://localhost:11434):
   ollama serve

4. Add to .env.local:
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama3.1:8b

5. Restart app - Unlimited local requests!

Benefits:
✅ Zero API costs forever
✅ No rate limits
✅ Complete privacy (offline capable)
✅ Fast inference on good hardware
`,
    llamacpp: `
# llama.cpp Server Setup

1. Clone repo:
   git clone https://github.com/ggerganov/llama.cpp
   cd llama.cpp

2. Build with GPU support:
   make LLAMA_CUDA=1  # NVIDIA
   make LLAMA_METAL=1 # Mac Metal

3. Download model:
   wget https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat.Q4_K_M.gguf

4. Start server:
   ./server -m llama-2-7b-chat.Q4_K_M.gguf -c 4096 --port 8080

5. Add to .env.local:
   LLAMACPP_BASE_URL=http://localhost:8080
   LLAMACPP_MODEL=llama-2-7b-chat

Benefits:
✅ Runs on CPU or GPU
✅ Very fast with quantization
✅ Low memory usage
`,
    vllm: `
# vLLM Setup (High Performance)

1. Install vLLM:
   pip install vllm

2. Start server:
   python -m vllm.entrypoints.openai.api_server \\
     --model meta-llama/Llama-3.1-8B-Instruct \\
     --port 8000

3. Add to .env.local:
   VLLM_BASE_URL=http://localhost:8000
   VLLM_MODEL=meta-llama/Llama-3.1-8B-Instruct

Benefits:
✅ Highest throughput
✅ GPU optimized
✅ Production ready
`,
    'textgen-webui': `
# Text Generation WebUI Setup

1. Clone repo:
   git clone https://github.com/oobabooga/text-generation-webui
   cd text-generation-webui

2. Install:
   ./start_linux.sh   # Linux
   ./start_macos.sh   # macOS  
   ./start_windows.bat # Windows

3. Download model via web UI (http://localhost:7860)

4. Enable API mode in settings

5. Add to .env.local:
   TEXTGEN_BASE_URL=http://localhost:5000
   TEXTGEN_MODEL=your-model-name

Benefits:
✅ User-friendly web interface
✅ Model management UI
✅ Many customization options
`,
    transformers: `
# Hugging Face Transformers (Python Server)

You'll need to create a simple Flask/FastAPI server:

1. Install dependencies:
   pip install transformers torch flask

2. Create server.py:
   from flask import Flask, request, jsonify
   from transformers import pipeline
   
   app = Flask(__name__)
   generator = pipeline('text-generation', 
                       model='meta-llama/Llama-3.1-8B-Instruct',
                       device=0)  # GPU
   
   @app.route('/generate', methods=['POST'])
   def generate():
       data = request.json
       result = generator(data['prompt'], max_length=2000)
       return jsonify({'text': result[0]['generated_text']})
   
   app.run(port=8000)

3. Run: python server.py

4. Add to .env.local:
   TRANSFORMERS_BASE_URL=http://localhost:8000
   TRANSFORMERS_MODEL=meta-llama/Llama-3.1-8B-Instruct

Benefits:
✅ Direct Hugging Face integration
✅ Access to all models
✅ Custom Python code
`,
  }

  return instructions[provider] || 'No instructions available'
}

/**
 * Get recommended local setup
 */
export function getRecommendedLocalSetup(): {
  provider: LocalModelProvider
  reason: string
  difficulty: 'easy' | 'medium' | 'hard'
  requirements: string[]
} {
  return {
    provider: 'ollama',
    reason: 'Easiest to setup, best user experience, actively maintained',
    difficulty: 'easy',
    requirements: [
      'macOS, Linux, or Windows',
      '8GB+ RAM for 8B models',
      '40GB+ RAM for 70B models (or GPU)',
      'Optional: NVIDIA GPU for faster inference',
    ],
  }
}

/**
 * Check local model health
 */
export async function checkLocalModelHealth(
  config: LocalModelConfig
): Promise<{ healthy: boolean; latency?: number; error?: string }> {
  const startTime = Date.now()

  try {
    const result = await callLocalModel(
      config,
      [{ role: 'user', content: 'Say "OK"' }],
      { temperature: 0, maxTokens: 10 }
    )

    const latency = Date.now() - startTime

    return {
      healthy: result.content.toLowerCase().includes('ok'),
      latency,
    }
  } catch (error: any) {
    return {
      healthy: false,
      error: error.message,
    }
  }
}
