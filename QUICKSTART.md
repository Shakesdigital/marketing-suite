# Quick Start Guide - 5 Minutes to First AI-Generated Post

Get your Shakes Digital Marketing Suite running in 5 minutes!

## 1. Install (1 minute)

```bash
npm install
cp .env.local.example .env.local
```

## 2. Configure (2 minutes)

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
OPENAI_API_KEY=your_openai_key
```

## 3. Database (1 minute)

1. Go to Supabase SQL Editor
2. Paste contents of `database/schema.sql`
3. Execute

## 4. Run (30 seconds)

```bash
npm run dev
```

Visit: http://localhost:3000

## 5. Test (30 seconds)

1. Sign up at `/signup`
2. Click "Add Company"
3. Open AI Assistant (sidebar)
4. Say: "Help me set up my coffee shop"
5. Follow AI instructions

## What's Next?

After onboarding:
- "Perform market research"
- "Generate a marketing plan"
- "Create a content calendar with 5 posts per week"
- "Generate content for 4 weeks"

Done! You have automated social media marketing! 🎉

## Troubleshooting

**AI not responding?**
- Check OpenAI API key
- Verify you have API credits
- Check browser console

**Database errors?**
- Verify Supabase credentials
- Ensure schema.sql ran successfully
- Check RLS policies are enabled

**Need help?** See SETUP_GUIDE.md for detailed instructions.
