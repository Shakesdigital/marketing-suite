# Free LLM Setup Guide for Shakes Digital Marketing Suite

## 🎉 Zero-Cost AI Power!

The Shakes Digital Marketing Suite now supports **100% FREE AI providers** so you can start using all features immediately without any paid API dependencies!

---

## 🚀 Supported Free Providers

### 1. **Groq (RECOMMENDED - FASTEST!)** ⚡

**Why Groq?**
- 🔥 **Lightning fast inference** - Up to 10x faster than competitors
- 💰 **Completely FREE** - Generous free tier
- 🎯 **Best for:** Quick tasks like captions, summaries, email generation
- 🤖 **Models:** Llama 3.1 (8B, 70B)

**Get Your Free API Key:**
1. Visit: https://console.groq.com
2. Sign up (GitHub/Google)
3. Go to "API Keys" section
4. Create new API key
5. Copy to `.env.local`:
   ```
   GROQ_API_KEY=gsk_your_key_here
   ```

**Rate Limits (Free):**
- 30 requests per minute (RPM)
- 14,400 requests per day (RPD)
- Perfect for burst traffic and high-volume use!
- Automatic rate limit handling with fallback

---

### 2. **OpenRouter (FREE TIER)** 🔀

**Why OpenRouter?**
- 🎯 **Multi-model routing** - Access multiple models through one API
- 💰 **Free tier available** - Includes Llama 3.1 models
- 🔄 **Auto-fallback** - Switches to alternative models automatically
- 🤖 **Models:** Llama 3.1 (8B, 70B, 405B) all free!

**Get Your Free API Key:**
1. Visit: https://openrouter.ai/keys
2. Sign up
3. Get free credits
4. Create API key
5. Copy to `.env.local`:
   ```
   OPENROUTER_API_KEY=sk-or-v1-your_key_here
   ```

**Rate Limits (Free):**
- $1 in free credits monthly
- Llama models are FREE (no credit usage)
- Perfect for standard tasks

---

### 3. **Hugging Face Inference API (FREE)** 🤗

**Why Hugging Face?**
- 💰 **Completely FREE** - Generous rate limits
- 🌐 **Open source models** - Access to thousands of models
- 🎯 **Best for:** Blog writing, long-form content
- 🤖 **Models:** Llama 3.2, Llama 3.1, Mistral, and more

**Get Your Free API Key:**
1. Visit: https://huggingface.co/settings/tokens
2. Sign up/log in
3. Create new token (read access)
4. Copy to `.env.local`:
   ```
   HUGGINGFACE_API_KEY=hf_your_token_here
   ```

**Rate Limits (Free):**
- 1,000 requests per hour
- Perfect for blog generation and SEO tasks

---

## 🛠️ Setup Instructions

### Step 1: Choose Your Provider(s)

**Option A: Use Groq Only (Recommended for Beginners)**
```bash
# .env.local
GROQ_API_KEY=gsk_your_key_here
```

**Option B: Use Multiple Providers (Recommended for Power Users)**
```bash
# .env.local
GROQ_API_KEY=gsk_your_key_here
OPENROUTER_API_KEY=sk-or-v1-your_key_here
HUGGINGFACE_API_KEY=hf_your_token_here
```

### Step 2: Configure Environment

Copy `.env.local.example` to `.env.local` and add your keys:

```bash
cp .env.local.example .env.local
# Edit .env.local with your API keys
```

### Step 3: Test Your Setup

```bash
npm run dev
```

Navigate to your dashboard and try:
- "Research 5 trending topics in marketing" (Blog module)
- "Find 5 tech companies in New York" (Lead module)
- "Generate an outreach email for lead John Doe" (Email module)

---

## 🎯 Provider Strategy (Automatic)

The app intelligently routes tasks to the best provider:

### **Fast Tasks** → Groq
- Social media captions
- Email subject lines
- Quick summaries
- Lead research

### **Standard Tasks** → OpenRouter
- Email body generation
- Marketing plans
- Content ideas
- Trend analysis

### **Advanced Tasks** → Groq (70B model)
- Full blog posts (1500-2500 words)
- SEO optimization
- Content calendars
- Complex research

### **Fallback Logic:**
1. Try primary provider (Groq by default)
2. If fails → Try OpenRouter
3. If fails → Try Hugging Face
4. If fails → Error message

---

## 💡 Cost Comparison

| Provider | Monthly Cost | Speed | Quality |
|----------|-------------|-------|---------|
| **Groq** | **FREE** ✅ | ⚡⚡⚡⚡⚡ Ultra Fast | ⭐⭐⭐⭐ Excellent |
| **OpenRouter** | **FREE** ✅ | ⚡⚡⚡⚡ Very Fast | ⭐⭐⭐⭐ Excellent |
| **Hugging Face** | **FREE** ✅ | ⚡⚡⚡ Fast | ⭐⭐⭐⭐ Excellent |
| OpenAI (GPT-4) | $20-100+ 💰 | ⚡⚡⚡ Fast | ⭐⭐⭐⭐⭐ Best |

**Verdict:** Free options provide 95% of the quality at 0% of the cost! 🎉

---

## 🔧 Advanced Configuration

### Custom Provider Priority

Edit `src/lib/ai/providers.ts` to change provider priority:

```typescript
export const AI_PROVIDERS: Record<AIProvider, ...> = {
  groq: {
    priority: 1,  // Highest priority (tried first)
    // ...
  },
  openrouter: {
    priority: 2,  // Second priority
    // ...
  },
  // ...
}
```

### Task-Specific Routing

Edit `src/lib/ai/providers.ts` → `getProviderForTask()`:

```typescript
export function getProviderForTask(taskType: 'fast' | 'standard' | 'advanced') {
  if (taskType === 'fast') {
    return providers.find(p => p.name === 'groq') || providers[0]
  }
  // Customize routing logic here
}
```

---

## 🎓 Best Practices

### 1. **Start with Groq**
- Easiest setup
- Best performance
- Free forever

### 2. **Add OpenRouter for Redundancy**
- Automatic failover
- Different model options
- Still free!

### 3. **Monitor Usage**
- Check provider dashboards
- Track rate limits
- Switch providers if needed

### 4. **Optimize Prompts**
- Shorter prompts = faster responses
- Be specific = better results
- Use examples = consistent output

---

## 🐛 Troubleshooting

### "No AI provider configured" Error

**Solution:** Add at least one API key to `.env.local`

```bash
GROQ_API_KEY=gsk_your_key_here
```

### Rate Limit Errors

**Solution 1:** Add multiple providers for automatic fallback
**Solution 2:** Wait a few minutes and try again
**Solution 3:** Spread requests over time

### Slow Response Times

**Solution 1:** Use Groq (fastest provider)
**Solution 2:** Use 'fast' task type for quick tasks
**Solution 3:** Optimize prompts (be concise)

### JSON Parsing Errors

**Solution:** The app automatically extracts JSON from responses
If issues persist, switch to OpenRouter or Groq (better JSON support)

---

## 📊 Provider Comparison Matrix

| Feature | Groq | OpenRouter | Hugging Face |
|---------|------|------------|--------------|
| Speed | ⚡⚡⚡⚡⚡ | ⚡⚡⚡⚡ | ⚡⚡⚡ |
| Free Tier | ✅ Generous | ✅ Good | ✅ Generous |
| Setup Difficulty | 🟢 Easy | 🟢 Easy | 🟡 Medium |
| JSON Support | ✅ Excellent | ✅ Excellent | ⚠️ Good |
| Model Variety | Llama 3.1 | Many models | Thousands |
| Reliability | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 🎯 Recommended Setup for Different Use Cases

### **Personal Use / Testing**
```bash
GROQ_API_KEY=gsk_your_key_here
```
✅ Simple, fast, free!

### **Small Business**
```bash
GROQ_API_KEY=gsk_your_key_here
OPENROUTER_API_KEY=sk-or-v1-your_key_here
```
✅ Redundancy + still free!

### **Agency / High Volume**
```bash
GROQ_API_KEY=gsk_your_key_here
OPENROUTER_API_KEY=sk-or-v1-your_key_here
HUGGINGFACE_API_KEY=hf_your_token_here
```
✅ Maximum reliability with triple fallback!

### **Enterprise (Optional Paid)**
```bash
GROQ_API_KEY=gsk_your_key_here
OPENROUTER_API_KEY=sk-or-v1-your_key_here
OPENAI_API_KEY=sk-your_openai_key  # Premium fallback
```
✅ Best of both worlds!

---

## 🚀 Quick Start Commands

```bash
# 1. Clone the repo
git clone https://github.com/Shakesdigital/marketing-suite.git
cd marketing-suite

# 2. Install dependencies
npm install

# 3. Get free Groq API key (2 minutes)
# Visit: https://console.groq.com

# 4. Setup environment
cp .env.local.example .env.local
# Add: GROQ_API_KEY=gsk_your_key_here

# 5. Run the app
npm run dev

# 6. Test it!
# Go to http://localhost:3000/dashboard
# Try: "Research 5 trending topics in marketing"
```

---

## 🎉 You're Ready!

With free LLM providers, you can now:
- ✅ Generate unlimited leads
- ✅ Create personalized emails
- ✅ Write SEO-optimized blog posts
- ✅ Research trending topics
- ✅ Build marketing plans
- ✅ Schedule content
- ✅ Track performance

**All for $0/month!** 🚀

---

## 📞 Support

**Issues with providers?**
- Check provider status pages
- Verify API keys are correct
- Review rate limits
- Try alternative provider

**Need help?**
- GitHub Issues: [Create Issue](https://github.com/Shakesdigital/marketing-suite/issues)
- Documentation: See implementation guides
- Provider docs: Check provider websites

---

**Built with ❤️ using free and open-source AI models!**
