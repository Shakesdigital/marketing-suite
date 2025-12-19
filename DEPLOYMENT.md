# Shakes Digital Marketing Suite - Deployment Guide

Complete guide for deploying your application to production.

## Table of Contents

1. [Deployment Options](#deployment-options)
2. [Vercel Deployment](#vercel-deployment)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [Domain Configuration](#domain-configuration)
6. [Post-Deployment](#post-deployment)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)

---

## Deployment Options

### Recommended: Vercel

**Pros:**
- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Serverless functions
- Free tier available
- Built by Next.js creators

**Best for:** Production deployments

### Alternative: Netlify

**Pros:**
- Similar to Vercel
- Good free tier
- Easy setup

**Best for:** Alternative production option

### Alternative: Self-Hosted

**Pros:**
- Full control
- Custom infrastructure

**Best for:** Enterprise with specific requirements

---

## Vercel Deployment

### Step 1: Prerequisites

✅ GitHub account
✅ Vercel account (free)
✅ Supabase project
✅ OpenAI API key

### Step 2: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Shakes Digital Marketing Suite"

# Add remote (create repo on GitHub first)
git remote add origin https://github.com/yourusername/shakes-marketing-suite.git

# Push
git push -u origin main
```

### Step 3: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Vercel auto-detects Next.js

### Step 4: Configure Build Settings

Vercel automatically configures:
- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

No changes needed!

### Step 5: Add Environment Variables

In Vercel project settings → Environment Variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here

# App URL (will be your Vercel URL)
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

**Important:** Add variables for all environments (Production, Preview, Development)

### Step 6: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes
3. Your app is live! 🚀

**Deployment URL:** `https://your-project.vercel.app`

---

## Environment Variables

### Required Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (secret!) | Supabase Dashboard → Settings → API |
| `OPENAI_API_KEY` | OpenAI API key | platform.openai.com/api-keys |
| `NEXT_PUBLIC_APP_URL` | Your app URL | Your Vercel deployment URL |

### Variable Security

**Public Variables (`NEXT_PUBLIC_*`):**
- Safe to expose to browser
- Used in client-side code
- Visible in network requests

**Private Variables:**
- Server-side only
- Never exposed to browser
- Keep secret!

### Setting in Vercel

```bash
# Via Vercel CLI
vercel env add OPENAI_API_KEY

# Via Dashboard
Project Settings → Environment Variables → Add
```

---

## Database Setup

### Supabase Production Configuration

#### 1. Database Pooling

For production, enable connection pooling:

1. Supabase Dashboard → Settings → Database
2. Enable "Connection pooler"
3. Use pooled connection string in production

#### 2. Security Rules

Verify RLS is enabled:

```sql
-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All tables should have `rowsecurity = true`

#### 3. Backup Configuration

1. Supabase Dashboard → Settings → Backups
2. Verify daily backups enabled (default)
3. Test restore procedure

#### 4. Performance Optimization

Add indexes if needed:

```sql
-- Example: Add index for frequently queried column
CREATE INDEX idx_posts_platform ON content_posts(platform);
```

---

## Domain Configuration

### Custom Domain Setup

#### Via Vercel Dashboard

1. Project Settings → Domains
2. Add your domain (e.g., `yourapp.com`)
3. Follow DNS configuration instructions
4. Add DNS records to your domain registrar:

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

5. Wait for SSL certificate (automatic)
6. Domain live in ~24 hours

#### Update Environment Variables

Update `NEXT_PUBLIC_APP_URL`:

```env
NEXT_PUBLIC_APP_URL=https://yourapp.com
```

#### Supabase Redirect URLs

1. Supabase Dashboard → Authentication → URL Configuration
2. Add to allowed redirect URLs:
   - `https://yourapp.com/**`
   - `https://www.yourapp.com/**`

---

## Post-Deployment

### 1. Verify Deployment

**Test Checklist:**
- [ ] Homepage loads
- [ ] Signup works
- [ ] Login works
- [ ] Dashboard accessible
- [ ] AI assistant responds
- [ ] Company onboarding works
- [ ] Market research generates
- [ ] Content creation works

### 2. Performance Check

Use Vercel Analytics or Google PageSpeed:

```bash
# Check performance
https://pagespeed.web.dev/
```

**Target Metrics:**
- First Contentful Paint: <1.8s
- Largest Contentful Paint: <2.5s
- Time to Interactive: <3.8s

### 3. SSL Certificate

Verify HTTPS:
- Green lock icon in browser
- Certificate valid
- No mixed content warnings

### 4. Error Tracking

Set up monitoring (recommended):

**Sentry Setup:**
```bash
npm install @sentry/nextjs

# Follow setup wizard
npx @sentry/wizard@latest -i nextjs
```

### 5. Analytics

Add analytics (optional):

**Vercel Analytics:**
- Automatically enabled in Vercel
- View in Vercel dashboard

**Google Analytics:**
```typescript
// Add to app/layout.tsx
<Script
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
  strategy="afterInteractive"
/>
```

---

## Monitoring

### Application Health

**Uptime Monitoring:**
- [UptimeRobot](https://uptimerobot.com) (free)
- [Pingdom](https://www.pingdom.com)
- Monitor: `https://yourapp.com/api/health`

**Create Health Check Endpoint:**

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'healthy' })
}
```

### Database Monitoring

**Supabase Dashboard:**
- Database health
- Query performance
- Connection count
- Storage usage

**Set up alerts for:**
- High CPU usage
- Many connections
- Slow queries
- Storage limits

### OpenAI Usage

**Monitor API Usage:**
1. OpenAI Dashboard → Usage
2. Track token consumption
3. Set up billing alerts
4. Monitor rate limits

**Cost Optimization:**
- Use GPT-3.5 for simple tasks
- Cache responses where possible
- Implement rate limiting
- Batch similar requests

---

## CI/CD Pipeline

### Automatic Deployments

Vercel automatically deploys:

**Production:**
- Trigger: Push to `main` branch
- URL: `https://yourapp.com`

**Preview:**
- Trigger: Pull request
- URL: `https://pr-123-yourapp.vercel.app`

**Development:**
- Trigger: Push to any branch
- URL: `https://branch-name-yourapp.vercel.app`

### GitHub Actions (Optional)

Add tests before deployment:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
```

---

## Scaling

### Performance Optimization

**As you grow:**

1. **Enable Edge Functions**
   - Move API routes to edge
   - Reduce latency globally

2. **Implement Caching**
   - Redis for session data
   - CDN for static assets

3. **Database Optimization**
   - Add indexes
   - Enable connection pooling
   - Consider read replicas

4. **Rate Limiting**
   - Protect API endpoints
   - Prevent abuse
   - Control costs

### Cost Management

**OpenAI Costs:**
- Monitor token usage
- Set monthly budget limits
- Use cheaper models where possible

**Supabase Costs:**
- Monitor database size
- Archive old data
- Optimize queries

**Vercel Costs:**
- Free for small teams
- Pro: $20/month per team member
- Enterprise: Custom pricing

---

## Troubleshooting

### Common Deployment Issues

#### Issue: Build Fails

**Error:** `Type error: ...`

**Solution:**
```bash
# Run locally first
npm run type-check
# Fix errors, then deploy
```

#### Issue: Environment Variables Not Working

**Error:** `undefined` values in production

**Solution:**
1. Verify variables in Vercel dashboard
2. Ensure correct environment (Production/Preview/Development)
3. Redeploy after adding variables

#### Issue: Database Connection Fails

**Error:** `connection refused`

**Solution:**
1. Verify Supabase URL is correct
2. Check service role key
3. Verify RLS policies
4. Test connection locally

#### Issue: AI Not Responding

**Error:** Copilot sidebar shows errors

**Solution:**
1. Check OpenAI API key
2. Verify API endpoint: `/api/copilotkit`
3. Check browser console
4. Verify OpenAI account has credits

#### Issue: 404 on Routes

**Error:** Some pages not found

**Solution:**
1. Verify file structure matches Next.js conventions
2. Check dynamic routes: `[id]` folders
3. Ensure `page.tsx` files exist
4. Clear `.next` cache and rebuild

### Getting Help

**Resources:**
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [CopilotKit Docs](https://docs.copilotkit.ai)

**Support Channels:**
- Vercel Discord
- Next.js GitHub Discussions
- Supabase Discord
- CopilotKit Discord

---

## Security Checklist

Before going live:

- [ ] All environment variables secure
- [ ] RLS policies enabled on all tables
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Service role key never exposed to client
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Input validation on all forms
- [ ] SQL injection protection (Supabase handles this)
- [ ] XSS protection (React handles this)
- [ ] Authentication working correctly

---

## Maintenance

### Regular Tasks

**Weekly:**
- Check error logs
- Monitor API usage
- Review performance metrics

**Monthly:**
- Update dependencies: `npm update`
- Review security alerts: `npm audit`
- Check database size
- Review OpenAI costs

**Quarterly:**
- Major dependency updates
- Security review
- Performance optimization
- User feedback review

### Backup Strategy

**Automated (via Supabase):**
- Daily database backups
- Point-in-time recovery
- 7-day retention (free tier)

**Manual:**
```bash
# Export database (if needed)
pg_dump -h db.project.supabase.co -U postgres -d postgres > backup.sql
```

---

## Production Checklist

Before announcing your app:

- [ ] All features tested in production
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] Monitoring set up
- [ ] Backup verified
- [ ] Security audit completed
- [ ] Performance optimized
- [ ] Documentation updated
- [ ] Support channels established

---

## Success! 🎉

Your Shakes Digital Marketing Suite is now live in production!

**Next Steps:**
1. Share with first users
2. Gather feedback
3. Monitor usage
4. Iterate and improve

**Maintenance Tip:** Set calendar reminders for weekly monitoring and monthly updates to keep your app running smoothly!

---

## Quick Reference

### Useful Commands

```bash
# Deploy from CLI
vercel --prod

# Check deployment logs
vercel logs

# Environment variables
vercel env ls
vercel env add VARIABLE_NAME
vercel env rm VARIABLE_NAME

# Rollback deployment
vercel rollback [deployment-url]
```

### Important URLs

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://app.supabase.com
- **OpenAI Dashboard:** https://platform.openai.com
- **Your App:** https://yourapp.vercel.app

---

Congratulations on deploying your AI-powered social media marketing platform! 🚀
