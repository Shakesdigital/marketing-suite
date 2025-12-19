# Shakes Digital Marketing Suite - Setup Guide

Complete setup guide for getting your AI-powered social media marketing application up and running.

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier works)
- An OpenAI API key (or other LLM provider)

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- CopilotKit for AI integration
- Supabase for database and authentication
- Tailwind CSS for styling

## Step 2: Set Up Supabase

### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your Project URL and API keys

### 2.2 Run Database Schema

1. In your Supabase dashboard, go to SQL Editor
2. Copy the entire contents of `database/schema.sql`
3. Paste and run the SQL script
4. This creates all necessary tables, indexes, and security policies

### 2.3 Enable Authentication

1. In Supabase dashboard, go to Authentication → Providers
2. Enable Email provider (enabled by default)
3. Optional: Configure other providers (Google, GitHub, etc.)

## Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Getting Your Keys:

**Supabase:**
- Project URL: Settings → API → Project URL
- Anon Key: Settings → API → Project API keys → `anon` `public`
- Service Role Key: Settings → API → Project API keys → `service_role` (keep secret!)

**OpenAI:**
- Get your API key from [platform.openai.com](https://platform.openai.com/api-keys)

## Step 4: Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Step 5: Test the Application

### 5.1 Create an Account

1. Navigate to [http://localhost:3000/signup](http://localhost:3000/signup)
2. Create a new account
3. You'll be redirected to the dashboard

### 5.2 Test AI Assistant

1. Click the AI Assistant button in the sidebar (CopilotKit icon)
2. Try asking: "Help me get started"
3. The AI should respond and guide you

### 5.3 Complete Onboarding

1. Navigate to Companies → Add Company
2. Open the AI Assistant
3. Tell the AI about your business
4. The AI will guide you through onboarding using CopilotKit actions

## Step 6: Verify CopilotKit Integration

The AI assistant should be able to:

✅ Collect company information conversationally
✅ Perform market research
✅ Generate marketing plans
✅ Create content calendars
✅ Generate and schedule posts

If the AI isn't responding:
1. Check your OpenAI API key in `.env.local`
2. Verify the CopilotKit endpoint at `/api/copilotkit`
3. Check browser console for errors

## Step 7: Database Verification

Check that tables were created successfully:

1. Go to Supabase Dashboard → Table Editor
2. You should see these tables:
   - profiles
   - companies
   - market_research
   - marketing_plans
   - content_topics
   - content_posts
   - content_calendar
   - automation_settings
   - conversations

## Common Issues and Solutions

### Issue: "Invalid API key" error

**Solution:** Verify your OpenAI API key is correct and has available credits

### Issue: Database permission errors

**Solution:** Ensure RLS policies are enabled. Re-run the schema.sql script

### Issue: AI not responding

**Solutions:**
1. Check browser console for errors
2. Verify `/api/copilotkit` endpoint is accessible
3. Check that OPENAI_API_KEY is set correctly
4. Try refreshing the page

### Issue: Authentication not working

**Solutions:**
1. Verify Supabase URL and keys are correct
2. Check that email provider is enabled in Supabase
3. Look for errors in browser console

## Production Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set all environment variables in your hosting platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_APP_URL` (your production URL)

## Security Considerations

⚠️ **Important Security Notes:**

1. **Never commit `.env.local`** - it contains secret keys
2. **Keep service role key secure** - only use server-side
3. **Enable RLS policies** - already done in schema.sql
4. **Use environment variables** - never hardcode secrets
5. **Rotate keys periodically** - especially if exposed

## Next Steps

Once everything is working:

1. **Customize branding** - Update colors, logo, etc.
2. **Add social media integrations** - Connect real platform APIs
3. **Implement image generation** - Add DALL-E or Midjourney integration
4. **Set up analytics** - Track user engagement
5. **Add payment processing** - For premium features
6. **Configure email notifications** - Using Supabase Edge Functions

## Need Help?

If you encounter issues:

1. Check the browser console for errors
2. Review Supabase logs in the dashboard
3. Verify all environment variables are set
4. Ensure database schema ran successfully

## Testing the Full Workflow

To test the complete application flow:

1. **Sign up** - Create a new account
2. **Add Company** - Use AI assistant to onboard a business
3. **Market Research** - Ask AI to "perform market research"
4. **Marketing Plan** - Ask AI to "generate a marketing plan"
5. **Content Calendar** - Ask AI to "create a content calendar with 5 Instagram posts per week"
6. **Generate Content** - Ask AI to "generate content for the next 4 weeks"
7. **Review Posts** - Check the calendar and individual posts

The entire workflow should be conversational through the AI assistant!

## Troubleshooting Commands

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check

# Run linter
npm run lint
```

## Success!

Your Shakes Digital Marketing Suite should now be fully operational! 🎉

The AI assistant will guide users through:
- ✅ Company onboarding
- ✅ Market research
- ✅ Marketing plan creation
- ✅ Content calendar setup
- ✅ Automated content generation

Enjoy your AI-powered social media marketing platform!
