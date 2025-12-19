# Shakes Digital Marketing Suite - Implementation Guide (Part 2)

## 💻 Installation & Setup

### Prerequisites

- Node.js 18+ installed
- Supabase project created
- OpenAI API key
- (Optional) SendGrid API key for email
- (Optional) WordPress site with API access

### Step 1: Install Dependencies

```bash
npm install
```

**New Dependencies Added:**
- `axios` - HTTP requests for web scraping
- `cheerio` - HTML parsing for lead research
- `puppeteer-core` - Browser automation (optional)
- `@sendgrid/mail` - Email sending via SendGrid
- `nodemailer` - Alternative SMTP email sending
- `markdown-it` - Markdown to HTML conversion
- `turndown` - HTML to Markdown conversion
- `csv-parse` / `csv-stringify` - CSV import/export

### Step 2: Environment Variables

Create `.env.local` with:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# SendGrid (Optional)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# WordPress (Optional)
WORDPRESS_SITE_URL=https://yourblog.com
WORDPRESS_USERNAME=your_username
WORDPRESS_APP_PASSWORD=your_app_password

# Medium (Optional)
MEDIUM_ACCESS_TOKEN=your_medium_token
```

### Step 3: Database Setup

```bash
# 1. Go to your Supabase dashboard
# 2. Navigate to SQL Editor
# 3. Run database/schema.sql
# 4. Run database/schema-extensions.sql
```

### Step 4: Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 📚 Module-by-Module Guide

### Module 1: Lead Generation

**Location:** `/dashboard/leads`

**Key Components:**
- `src/app/(dashboard)/dashboard/leads/page.tsx` - Main UI
- `src/lib/actions/lead-actions.ts` - Server actions
- `src/types/leads.ts` - Type definitions

**CopilotKit Actions:**
1. `researchLeads` - AI-powered lead discovery
2. `updateLeadStatus` - Change lead pipeline status
3. `exportLeads` - Export to CSV
4. `addLead` - Manual lead entry
5. `enrichLead` - AI enrichment with business intel

**Usage Example:**

```typescript
// User conversation with CopilotKit:
"Find 10 technology companies in San Francisco interested in content partnerships"

// AI executes:
await researchLeads(companyId, {
  industry: ['technology'],
  location: ['San Francisco'],
  collaboration_types: ['content']
}, 10)

// Returns:
// - 10 qualified leads with contact info
// - Lead scores (0-100)
// - Match reasons
// - Pain points and opportunities
```

**Best Practices:**
- Start with broad criteria, refine based on results
- Review lead scores before outreach
- Enrich high-scoring leads for better personalization
- Export regularly for backup/CRM integration

**Compliance Notes:**
- Only scrapes publicly available data
- Respects robots.txt
- GDPR: Store consent basis in lead notes
- Include data source in research_criteria

---

### Module 2: Email Marketing

**Location:** `/dashboard/emails`

**Key Components:**
- `src/app/(dashboard)/dashboard/emails/page.tsx` - Main UI
- `src/lib/actions/email-actions.ts` - Server actions
- `src/types/email.ts` - Type definitions

**CopilotKit Actions:**
1. `generateEmail` - Create personalized email for lead
2. `createEmailTemplate` - Save reusable template
3. `createEmailCampaign` - Setup campaign
4. `sendCampaign` - Queue emails for sending
5. `generateEmailVariants` - A/B testing variants
6. `bulkGenerateEmails` - Batch email creation

**Usage Example:**

```typescript
// User: "Generate an outreach email for lead John at TechCorp"
await generateEmailForLead(companyId, leadId, 'outreach')

// AI generates:
{
  subject: "Collaboration Opportunity: [Your Company] x TechCorp",
  body: "Hi John,\n\nI came across TechCorp and was impressed by..."
}

// User: "Create a campaign for all qualified leads"
await createEmailCampaign(companyId, {
  name: "Q1 Outreach",
  template_id: templateId,
  target_leads: qualifiedLeadIds,
  campaign_type: 'one_time'
})
```

**Email Personalization:**

Templates support merge fields:
- `{{contact_name}}` - Lead's contact name
- `{{business_name}}` - Lead's company name
- `{{industry}}` - Lead's industry
- `{{sender_company}}` - Your company name

**A/B Testing Workflow:**
1. Create base template
2. Generate 2-3 variants with AI
3. Split campaign across variants
4. Track performance (opens, clicks, replies)
5. Use winning variant for future campaigns

**Compliance Notes:**
- Always include unsubscribe link
- GDPR: Maintain consent records
- CAN-SPAM: Include physical address
- Honor opt-outs immediately

---

### Module 3: Blog Content & SEO

**Location:** `/dashboard/blog`

**Key Components:**
- `src/app/(dashboard)/dashboard/blog/page.tsx` - Main UI
- `src/lib/actions/blog-actions.ts` - Server actions
- `src/types/blog.ts` - Type definitions

**CopilotKit Actions:**
1. `researchTrendingTopics` - Discover content opportunities
2. `generateBlogPost` - Create full blog post
3. `scheduleBlogPost` - Schedule publication
4. `optimizeBlogPostSEO` - SEO analysis and recommendations
5. `generateBlogCalendar` - Strategic content planning
6. `publishToWordPress` - Auto-publish to WordPress
7. `batchGenerateBlogPosts` - Bulk content creation

**Usage Example:**

```typescript
// User: "Research 10 trending topics in digital marketing"
await researchTrendingTopics(companyId, 10)

// Returns topics with:
// - Trend scores (0-100)
// - Relevance scores
// - Search volume
// - Competition level
// - Suggested titles
// - Content angles

// User: "Generate a blog post about AI in marketing"
await generateBlogPost(companyId, topicId)

// Generates:
// - 1500-2500 word article
// - SEO optimized with keywords
// - Meta description
// - Internal/external links
// - Proper H2/H3 structure
// - Markdown formatted
```

**SEO Optimization Features:**
- Focus keyword identification
- Keyword density analysis
- Meta description generation
- Title optimization
- Internal linking suggestions
- External authority link recommendations
- Readability scoring

**Content Calendar Strategy:**

```typescript
// Generate 3-month calendar with 2 posts/week
await generateBlogContentCalendar(companyId, 3, 2)

// AI creates strategic mix:
// - Educational content (how-to, guides)
// - Promotional (product features, case studies)
// - Thought leadership (opinions, trends)
// - Seasonal/timely content
// - Balanced keyword difficulty
```

**Publishing Workflow:**
1. Research trending topics → Review & approve
2. Generate blog post → Edit & refine
3. Optimize SEO → Review recommendations
4. Schedule publication → Set date/time
5. Auto-publish to WordPress/Medium
6. Track performance → Views, shares, engagement

---

## 🤖 CopilotKit Actions Reference

### Lead Generation Actions

#### `researchLeads`
**Purpose:** AI-powered lead discovery and generation

**Parameters:**
```typescript
{
  industry?: string[]        // e.g., ['technology', 'healthcare']
  location?: string[]        // e.g., ['United States', 'Remote']
  companySize?: string[]     // 'small' | 'medium' | 'large' | 'enterprise'
  keywords?: string[]        // Related search terms
  collaborationTypes?: string[] // 'content' | 'partnership' | 'sponsorship'
  targetCount?: number       // Default: 10
}
```

**Returns:**
- Array of leads with contact info
- Lead scores (0-100)
- Match reasons
- Pain points and opportunities

**Example Prompts:**
- "Find 10 tech startups in Austin for partnerships"
- "Research medium-sized healthcare companies interested in content collaboration"
- "Generate 20 leads for B2B SaaS collaboration"

---

#### `updateLeadStatus`
**Purpose:** Update lead pipeline status

**Parameters:**
```typescript
{
  leadId: string
  status: 'new' | 'contacted' | 'responded' | 'qualified' | 'converted' | 'lost'
}
```

**Example Prompts:**
- "Mark lead TechCorp as contacted"
- "Move all responded leads to qualified"
- "Update lead status to converted"

---

#### `enrichLead`
**Purpose:** Use AI to gather additional business intelligence

**Parameters:**
```typescript
{
  leadId: string
}
```

**Enriches with:**
- Detailed company description
- Pain points (3-5)
- Products/services offered
- Employee count estimate
- Revenue estimate
- Funding stage

**Example Prompts:**
- "Enrich this lead with more data"
- "Get more information about TechCorp"

---

### Email Marketing Actions

#### `generateEmail`
**Purpose:** Create personalized email for specific lead

**Parameters:**
```typescript
{
  leadId: string
  emailType: 'outreach' | 'follow_up' | 'collaboration'
}
```

**Example Prompts:**
- "Generate an outreach email for lead John Smith"
- "Create a follow-up email for TechCorp"
- "Write a collaboration proposal email"

---

#### `createEmailCampaign`
**Purpose:** Setup multi-recipient email campaign

**Parameters:**
```typescript
{
  name: string
  templateId: string
  leadIds: string[]
  scheduledDate?: string
}
```

**Example Prompts:**
- "Create a campaign for all qualified leads"
- "Setup email campaign targeting 10 top leads"
- "Schedule a campaign for next Monday"

---

#### `generateEmailVariants`
**Purpose:** Create A/B test variants

**Parameters:**
```typescript
{
  templateId: string
  variantCount?: number  // Default: 2
}
```

**Tests:**
- Subject line variations
- Opening hooks
- Value proposition framing
- Call-to-action wording

**Example Prompts:**
- "Create A/B test variants for my outreach template"
- "Generate 3 email variants to test"

---

### Blog Content Actions

#### `researchTrendingTopics`
**Purpose:** Discover trending content opportunities

**Parameters:**
```typescript
{
  count?: number  // Default: 10
}
```

**Returns:**
- Topic with trend score (0-100)
- Relevance score (0-100)
- Search volume
- Competition level
- Suggested titles
- Content angles

**Example Prompts:**
- "Research 10 trending topics in my industry"
- "Find hot topics for blog content"
- "What should I write about this month?"

---

#### `generateBlogPost`
**Purpose:** Create complete SEO-optimized blog post

**Parameters:**
```typescript
{
  topicId?: string       // Use trending topic
  customTopic?: string   // Or custom topic
  title?: string         // Optional custom title
}
```

**Generates:**
- 1500-2500 word article
- Markdown formatted
- SEO keywords
- Meta description
- Internal/external links
- Proper heading structure

**Example Prompts:**
- "Generate a blog post about AI in marketing"
- "Write an article on this trending topic"
- "Create a how-to guide for email automation"

---

#### `generateBlogCalendar`
**Purpose:** Strategic content calendar planning

**Parameters:**
```typescript
{
  monthsAhead?: number    // Default: 3
  postsPerWeek?: number   // Default: 2
}
```

**Creates:**
- Strategic content mix
- Balanced keyword difficulty
- Seasonal relevance
- Estimated publish dates
- Content types (how-to, listicle, case study)

**Example Prompts:**
- "Create a 3-month content calendar"
- "Plan blog posts for next quarter"
- "Generate weekly content schedule"

---

## 🔌 API Integration Points

### Email Providers

#### SendGrid Integration

```typescript
// In email-actions.ts (production implementation)
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

async function sendEmailViaSendGrid(email: EmailOutreach) {
  const msg = {
    to: email.to_email,
    from: email.from_email,
    subject: email.subject,
    text: email.body_text,
    html: email.body_html,
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true }
    }
  }
  
  await sgMail.send(msg)
}
```

#### SMTP/Nodemailer Integration

```typescript
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  }
})

async function sendEmailViaSMTP(email: EmailOutreach) {
  await transporter.sendMail({
    from: `${email.from_name} <${email.from_email}>`,
    to: email.to_email,
    subject: email.subject,
    text: email.body_text,
    html: email.body_html
  })
}
```

---

### WordPress Publishing

```typescript
// In blog-actions.ts (production implementation)
async function publishToWordPressAPI(post: BlogPost, settings: BlogPublishingSettings) {
  const auth = Buffer.from(
    `${settings.wordpress_username}:${settings.wordpress_app_password_encrypted}`
  ).toString('base64')

  const response = await fetch(
    `${settings.wordpress_site_url}/wp-json/wp/v2/posts`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        title: post.title,
        content: post.content,
        status: settings.publish_as_draft ? 'draft' : 'publish',
        excerpt: post.excerpt,
        categories: [settings.default_category],
        tags: post.tags,
        meta: {
          _yoast_wpseo_title: post.seo_title,
          _yoast_wpseo_metadesc: post.meta_description,
          _yoast_wpseo_focuskw: post.focus_keyword
        }
      })
    }
  )

  const data = await response.json()
  return data.id
}
```

---

## 🔒 Compliance & GDPR

### Data Privacy Best Practices

#### Lead Data Collection

**Legal Basis:**
- Legitimate interest for B2B prospecting
- Document data source in `research_criteria`
- Only collect publicly available information

**Storage:**
```sql
-- Example: Add consent tracking
ALTER TABLE leads ADD COLUMN consent_basis TEXT;
ALTER TABLE leads ADD COLUMN data_source TEXT;
ALTER TABLE leads ADD COLUMN privacy_policy_url TEXT;
```

#### Email Marketing Compliance

**CAN-SPAM Requirements:**
- Physical address in email footer
- Clear "From" identification
- Accurate subject lines
- Obvious unsubscribe mechanism
- Process opt-outs within 10 business days

**GDPR Requirements:**
- Consent before sending (B2C)
- Legitimate interest (B2B prospecting)
- Right to be forgotten
- Data portability
- Breach notification

**Implementation:**

```typescript
// Add to email templates
const footer = `
---
${company.name}
${company.address}

Unsubscribe: ${unsubscribeUrl}
Privacy Policy: ${privacyPolicyUrl}
`

// Honor unsubscribes
async function handleUnsubscribe(emailAddress: string) {
  await supabase
    .from('leads')
    .update({ 
      outreach_status: 'unsubscribed',
      notes: 'Unsubscribed on ' + new Date().toISOString()
    })
    .eq('contact_email', emailAddress)
}

// Data deletion (GDPR Right to be Forgotten)
async function deleteLeadData(leadId: string) {
  // Cascading deletes handled by foreign keys
  await supabase.from('leads').delete().eq('id', leadId)
}
```

---

## 🧪 Testing & Deployment

### Testing Strategy

#### Unit Tests (Example with Jest)

```typescript
// __tests__/lead-actions.test.ts
import { researchLeads } from '@/lib/actions/lead-actions'

describe('Lead Research', () => {
  it('should generate leads based on criteria', async () => {
    const result = await researchLeads('company-id', {
      industry: ['technology'],
      location: ['San Francisco']
    }, 5)
    
    expect(result.success).toBe(true)
    expect(result.leads).toHaveLength(5)
    expect(result.leads[0]).toHaveProperty('business_name')
    expect(result.leads[0]).toHaveProperty('lead_score')
  })
})
```

### Deployment Checklist

**Pre-Deployment:**
- [ ] Run database migrations
- [ ] Set all environment variables
- [ ] Test email delivery
- [ ] Verify WordPress connection
- [ ] Review RLS policies
- [ ] Check API rate limits
- [ ] Test authentication flow
- [ ] Verify GDPR compliance

**Vercel Deployment:**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add OPENAI_API_KEY
vercel env add SENDGRID_API_KEY
# ... etc

# Production deployment
vercel --prod
```

---

## 📈 Scaling & Performance

### Database Optimization

**Indexes:**
```sql
-- Already included in schema-extensions.sql
-- Additional indexes for common queries:

CREATE INDEX idx_leads_score_status ON leads(lead_score DESC, lead_status);
CREATE INDEX idx_email_campaigns_status_date ON email_campaigns(status, scheduled_date);
CREATE INDEX idx_blog_posts_status_scheduled ON blog_posts(status, scheduled_date);
CREATE INDEX idx_trending_topics_scores ON trending_topics(trend_score DESC, relevance_score DESC);
```

---

## 🎯 Best Practices & Tips

### Lead Generation Tips

1. **Start Broad, Refine Later:** Begin with general criteria, analyze results, then narrow
2. **Quality Over Quantity:** 10 highly relevant leads > 100 poor matches
3. **Regular Enrichment:** Enrich high-scoring leads before outreach
4. **Track Sources:** Document where leads came from for compliance
5. **Pipeline Management:** Move leads through stages systematically

### Email Marketing Tips

1. **Personalization is Key:** Generic emails get ignored
2. **Test Everything:** A/B test subject lines, body copy, CTAs
3. **Timing Matters:** Send B2B emails Tue-Thu 10am-2pm local time
4. **Follow Up:** 2-3 follow-ups increase response by 50%
5. **Track & Optimize:** Monitor open/click rates, adjust accordingly

### Blog Content Tips

1. **Consistency:** Publish regularly (1-2x/week minimum)
2. **SEO Balance:** Mix high and low competition keywords
3. **Long-Form Works:** 1500+ words rank better
4. **Internal Linking:** Link to your other content
5. **Update Old Posts:** Refresh and republish top performers

---

## 🚀 Quick Start Checklist

- [ ] Install dependencies: `npm install`
- [ ] Setup Supabase project
- [ ] Run database schemas
- [ ] Configure `.env.local`
- [ ] Start dev server: `npm run dev`
- [ ] Create first company profile
- [ ] Test lead research
- [ ] Generate sample email
- [ ] Create blog post from trending topic
- [ ] Review and customize for your brand

---

## 📞 Support & Resources

**Documentation:**
- [CopilotKit Docs](https://docs.copilotkit.ai)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

---

## 🔄 Future Enhancements

**Planned Features:**
- SMS marketing module
- Social media scheduling from blog posts
- CRM integration (HubSpot, Salesforce)
- Advanced analytics dashboard
- Multi-language support
- Team collaboration features
- White-label options

---

**Built with ❤️ using CopilotKit, Next.js, and AI**
