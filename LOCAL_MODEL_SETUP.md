# Self-Hosted Local AI Models Guide

## 🎯 Why Self-Host?

### **Unlimited Usage**
- ✅ **No API costs** - Run forever for free
- ✅ **No rate limits** - Process as many requests as your hardware allows
- ✅ **Complete privacy** - Data never leaves your machine
- ✅ **Offline capable** - Works without internet
- ✅ **Full control** - Choose your models and configurations

### **Perfect For:**
- 💰 High-volume operations (10,000+ requests/day)
- 🔒 Sensitive data (HIPAA, GDPR compliance)
- 🚀 Agencies serving multiple clients
- 🏢 Enterprise deployments
- 🧪 Development and testing

---

## 🚀 Quick Start with Ollama (Recommended)

### **Why Ollama?**
- Easiest setup (5 minutes)
- Works on Mac, Linux, Windows
- Automatic model management
- GPU acceleration built-in
- OpenAI-compatible API

### **Installation**

#### macOS / Linux:
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

#### Windows:
Download installer from: https://ollama.com/download

### **Setup Steps**

1. **Pull a model:**
```bash
# Fast model (4.7GB)
ollama pull llama3.1:8b

# Best quality model (40GB, requires 48GB RAM or GPU)
ollama pull llama3.1:70b

# Tiny model for testing (2GB)
ollama pull llama3.1:3b
```

2. **Start Ollama server:**
```bash
ollama serve
# Runs on http://localhost:11434
```

3. **Configure your app:**
```bash
# Add to .env.local
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# Optional: Different model for advanced tasks
OLLAMA_MODEL_LARGE=llama3.1:70b
```

4. **Restart your app:**
```bash
npm run dev
```

5. **Done!** 🎉 Unlimited AI requests!

### **Testing**

```bash
# Test Ollama directly
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "Why is the sky blue?",
  "stream": false
}'
```

---

## 📊 Performance Benchmarks

### **Hardware Requirements**

| Model | RAM Required | GPU VRAM | Speed (tokens/s) | Quality |
|-------|-------------|----------|------------------|---------|
| **llama3.1:3b** | 4GB | Optional | 50-100 | ⭐⭐⭐ |
| **llama3.1:8b** | 8GB | Optional | 30-60 | ⭐⭐⭐⭐ |
| **llama3.1:70b** | 48GB | 40GB | 5-15 | ⭐⭐⭐⭐⭐ |

**GPU Acceleration:**
- NVIDIA GPU: 5-10x faster
- Apple Silicon (M1/M2/M3): 3-5x faster
- AMD GPU: 2-3x faster

### **Cost Comparison**

| Scenario | Cloud (Groq) | Self-Hosted (Ollama) |
|----------|--------------|---------------------|
| **10,000 requests/day** | FREE (within limits) | FREE (no limits) |
| **100,000 requests/day** | Need multiple providers | $0 hardware cost |
| **1,000,000 requests/day** | Impossible with free tiers | $0 (if you have hardware) |
| **Sensitive data** | Risky | ✅ Private |
| **Offline work** | ❌ Impossible | ✅ Works offline |

**Electricity cost:** ~$2-5/month for 24/7 operation

---

## 🔧 Advanced Setup Options

### **Option 2: llama.cpp Server**

**Best for:** Maximum control, runs on anything

```bash
# 1. Clone and build
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make LLAMA_CUDA=1  # For NVIDIA GPU
# or
make LLAMA_METAL=1 # For Apple Silicon

# 2. Download model
wget https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat.Q4_K_M.gguf

# 3. Start server
./server -m llama-2-7b-chat.Q4_K_M.gguf -c 4096 --port 8080 --host 0.0.0.0

# 4. Configure app
# .env.local
LLAMACPP_BASE_URL=http://localhost:8080
LLAMACPP_MODEL=llama-2-7b-chat
```

**Pros:**
- Runs on CPU efficiently
- Very fast with GPU
- Low memory usage
- Production-ready

---

### **Option 3: vLLM (High Performance)**

**Best for:** Maximum throughput, GPU required

```bash
# 1. Install vLLM
pip install vllm

# 2. Start server
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-3.1-8B-Instruct \
  --port 8000 \
  --host 0.0.0.0

# 3. Configure app
# .env.local
VLLM_BASE_URL=http://localhost:8000
VLLM_MODEL=meta-llama/Llama-3.1-8B-Instruct
```

**Pros:**
- Highest throughput (10x faster than Ollama)
- Optimized for GPUs
- OpenAI-compatible API
- Perfect for production

**Cons:**
- Requires NVIDIA GPU
- More complex setup

---

### **Option 4: Text Generation WebUI**

**Best for:** Beginners who want a GUI

```bash
# 1. Clone
git clone https://github.com/oobabooga/text-generation-webui
cd text-generation-webui

# 2. Run installer
./start_linux.sh    # Linux
./start_macos.sh    # macOS
./start_windows.bat # Windows

# 3. Open http://localhost:7860
# 4. Download model via web interface
# 5. Enable API in settings

# 6. Configure app
# .env.local
TEXTGEN_BASE_URL=http://localhost:5000
TEXTGEN_MODEL=your-model-name
```

**Pros:**
- Beautiful web interface
- Easy model management
- Many customization options
- Chat interface for testing

---

## 🎯 Integration with Shakes Marketing Suite

### **Automatic Detection**

The app automatically detects and uses local models:

```typescript
// Priority order:
1. Groq (cloud, free, fast)
2. OpenRouter (cloud, free, reliable)
3. Hugging Face (cloud, free, generous)
4. Local Models (self-hosted, unlimited)
5. OpenAI (paid, premium)
```

### **Force Local-Only Mode**

```bash
# .env.local - Only use local models
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# Comment out cloud providers
# GROQ_API_KEY=...
# OPENROUTER_API_KEY=...
```

### **Hybrid Mode (Recommended)**

```bash
# .env.local - Cloud for fast tasks, local for privacy
GROQ_API_KEY=gsk_...           # Fast tasks
OLLAMA_BASE_URL=http://localhost:11434  # Private data
OLLAMA_MODEL=llama3.1:8b
```

**Smart routing:**
- Public data → Cloud (free, faster)
- Sensitive data → Local (private)
- High volume → Local (no limits)
- Bursts → Cloud then local

---

## 💡 Use Cases

### **1. Privacy-First Lead Generation**

```typescript
// All lead data stays local
"Find 1000 healthcare leads" 
→ Processed on local model
→ Zero data sent to cloud
→ HIPAA compliant
```

### **2. Unlimited Email Campaigns**

```typescript
// Generate 10,000 emails locally
batchGenerateEmails(10000)
→ No rate limits
→ No API costs
→ Complete control
```

### **3. Bulk Blog Content**

```typescript
// Create 100 blog posts
"Generate 100 blog posts for Q1"
→ Process overnight
→ Zero cost
→ Consistent quality
```

### **4. Development & Testing**

```typescript
// Unlimited testing
"Test every feature"
→ No API usage
→ Fast iteration
→ No cost concerns
```

---

## 🔍 Model Recommendations

### **For General Use:**
```bash
ollama pull llama3.1:8b
# Best balance of speed and quality
# Works on most hardware
```

### **For Best Quality:**
```bash
ollama pull llama3.1:70b
# Near GPT-4 quality
# Requires 48GB RAM or GPU
```

### **For Maximum Speed:**
```bash
ollama pull llama3.1:3b
# Ultra-fast
# Good for simple tasks
```

### **For Coding:**
```bash
ollama pull codellama:13b
# Optimized for code
# Great for technical content
```

### **For Long Content:**
```bash
ollama pull llama3.1:8b
# 8K context window
# Perfect for blog posts
```

---

## 🚨 Troubleshooting

### **"Connection refused" error**

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not, start it
ollama serve

# Or check if port is in use
lsof -i :11434
```

### **Slow performance**

```bash
# Check if GPU is being used
ollama run llama3.1:8b --verbose

# If CPU-only, enable GPU:
# NVIDIA: Reinstall with CUDA support
# Apple: Ollama uses Metal automatically
```

### **Out of memory**

```bash
# Use smaller model
ollama pull llama3.1:3b

# Or use quantized version
ollama pull llama3.1:8b-q4_K_M

# Check available RAM
free -h  # Linux
top      # macOS
```

### **Model download slow**

```bash
# Use faster mirror
export OLLAMA_HOST=https://ollama.ai

# Or download manually
wget https://ollama.ai/library/llama3.1/...
ollama create llama3.1 -f Modelfile
```

---

## 📈 Scaling Tips

### **Single Machine**

```bash
# Optimize Ollama
OLLAMA_NUM_PARALLEL=4  # Process 4 requests simultaneously
OLLAMA_MAX_LOADED_MODELS=2  # Keep 2 models in memory

# Configure in app
setMaxConcurrent(10)  # Process 10 requests at once
```

### **Multiple Machines**

```bash
# Run Ollama on multiple servers
# Server 1:
OLLAMA_BASE_URL=http://server1:11434

# Server 2:
OLLAMA_BASE_URL=http://server2:11434

# Load balance in app
LOCAL_MODEL_URLS=http://server1:11434,http://server2:11434
```

### **Docker Deployment**

```dockerfile
# Dockerfile
FROM ollama/ollama

# Pull models
RUN ollama pull llama3.1:8b

# Expose port
EXPOSE 11434

CMD ["ollama", "serve"]
```

```bash
# docker-compose.yml
version: '3'
services:
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

---

## 🎓 Best Practices

### **1. Start Small**
- Begin with `llama3.1:8b`
- Test with cloud providers first
- Gradually shift to local

### **2. Monitor Performance**
```bash
# Check model stats
ollama ps

# Monitor system resources
htop  # CPU/RAM
nvidia-smi  # GPU
```

### **3. Regular Updates**
```bash
# Update Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Update models
ollama pull llama3.1:8b
```

### **4. Backup Models**
```bash
# Models stored in:
~/.ollama/models/

# Backup
tar -czf ollama-models-backup.tar.gz ~/.ollama/models/
```

### **5. Security**
```bash
# Bind to localhost only (default)
ollama serve --host 127.0.0.1

# Or use firewall
ufw allow from 192.168.1.0/24 to any port 11434
```

---

## 💰 ROI Calculation

### **Scenario: Marketing Agency**

**Requirements:**
- 50,000 requests/month
- Sensitive client data
- 24/7 availability

**Cloud Cost:**
- Would need multiple paid API accounts
- ~$200-500/month

**Self-Hosted Cost:**
- Server: $50/month (or own hardware)
- Electricity: $5/month
- **Total: $55/month**

**Savings: $145-445/month** (or $1,740-5,340/year)

**Break-even:** Immediate if using existing hardware!

---

## 🎯 Summary

### **Choose Ollama if:**
✅ You want easiest setup
✅ You value your time
✅ You have Mac/Linux/Windows
✅ You want automatic updates

### **Choose llama.cpp if:**
✅ You want maximum control
✅ You have limited RAM
✅ You're comfortable with CLI

### **Choose vLLM if:**
✅ You have NVIDIA GPU
✅ You need maximum throughput
✅ Production deployment

### **Choose Text Gen WebUI if:**
✅ You want a GUI
✅ You're not technical
✅ You like experimenting

---

## 🔗 Resources

**Official Sites:**
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggerganov/llama.cpp
- vLLM: https://vllm.ai
- Text Gen WebUI: https://github.com/oobabooga/text-generation-webui

**Model Sources:**
- Ollama Library: https://ollama.com/library
- Hugging Face: https://huggingface.co/models
- TheBloke (GGUF): https://huggingface.co/TheBloke

**Community:**
- Ollama Discord: https://discord.gg/ollama
- r/LocalLLaMA: https://reddit.com/r/LocalLLaMA

---

**Go unlimited! 🚀**
