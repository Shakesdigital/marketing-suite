// Email Marketing Actions
'use server'

import { createClient } from '@/lib/supabase/server'
import { EmailTemplate, EmailCampaign, EmailOutreach } from '@/types/email'
import { Lead } from '@/types/leads'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Generate personalized email content for a lead
 * Uses AI to create compelling outreach emails
 */
export async function generateEmailForLead(
  companyId: string,
  leadId: string,
  emailType: 'outreach' | 'follow_up' | 'collaboration' = 'outreach'
): Promise<{ success: boolean; email?: { subject: string; body: string }; error?: string }> {
  try {
    const supabase = createClient()

    // Get company and lead data
    const [companyResult, leadResult] = await Promise.all([
      supabase.from('companies').select('*').eq('id', companyId).single(),
      supabase.from('leads').select('*').eq('id', leadId).single(),
    ])

    if (!companyResult.data || !leadResult.data) {
      return { success: false, error: 'Company or lead not found' }
    }

    const company = companyResult.data
    const lead = leadResult.data

    // Build context for AI
    const emailContext = {
      senderCompany: company.name,
      senderIndustry: company.industry,
      senderDescription: company.description,
      senderServices: company.products_services,
      brandVoice: company.brand_voice || 'professional and friendly',
      recipientName: lead.contact_name || 'there',
      recipientCompany: lead.business_name,
      recipientIndustry: lead.industry,
      recipientDescription: lead.description,
      recipientPainPoints: lead.pain_points,
      collaborationType: lead.collaboration_type?.[0] || 'partnership',
      matchReasons: lead.match_reasons,
    }

    const prompt = `Generate a personalized ${emailType} email for a B2B collaboration opportunity.

Sender Context:
- Company: ${emailContext.senderCompany}
- Industry: ${emailContext.senderIndustry}
- Description: ${emailContext.senderDescription}
- Services: ${emailContext.senderServices?.join(', ')}
- Brand Voice: ${emailContext.brandVoice}

Recipient Context:
- Contact: ${emailContext.recipientName}
- Company: ${emailContext.recipientCompany}
- Industry: ${emailContext.recipientIndustry}
- Description: ${emailContext.recipientDescription || 'N/A'}
- Pain Points: ${emailContext.recipientPainPoints?.join(', ') || 'N/A'}

Collaboration Type: ${emailContext.collaborationType}
Match Reasons: ${emailContext.matchReasons?.join(', ') || 'Good fit for collaboration'}

Requirements:
1. Create a compelling subject line (50-60 characters)
2. Write a personalized email body (150-250 words)
3. Reference specific pain points or opportunities
4. Clear value proposition
5. Soft call-to-action
6. Professional but conversational tone matching the brand voice
7. Include a professional signature

${emailType === 'follow_up' ? 'This is a follow-up email, so reference previous contact politely.' : ''}

Return JSON with "subject" and "body" fields only.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert B2B email copywriter specializing in personalized outreach that drives responses. Always return valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const emailContent = JSON.parse(completion.choices[0]?.message?.content || '{}')

    return {
      success: true,
      email: {
        subject: emailContent.subject || 'Collaboration Opportunity',
        body: emailContent.body || '',
      },
    }
  } catch (error: any) {
    console.error('Error generating email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Create email template
 */
export async function createEmailTemplate(
  companyId: string,
  templateData: Partial<EmailTemplate>
): Promise<{ success: boolean; template?: EmailTemplate; error?: string }> {
  try {
    const supabase = createClient()

    const { data: template, error } = await supabase
      .from('email_templates')
      .insert({
        company_id: companyId,
        ...templateData,
        times_sent: 0,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, template }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Get all email templates for a company
 */
export async function getEmailTemplates(companyId: string): Promise<EmailTemplate[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('email_templates')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return data || []
}

/**
 * Create email campaign
 */
export async function createEmailCampaign(
  companyId: string,
  campaignData: Partial<EmailCampaign>
): Promise<{ success: boolean; campaign?: EmailCampaign; error?: string }> {
  try {
    const supabase = createClient()

    const { data: campaign, error } = await supabase
      .from('email_campaigns')
      .insert({
        company_id: companyId,
        ...campaignData,
        status: 'draft',
        current_step: 1,
        total_recipients: campaignData.target_leads?.length || 0,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, campaign }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Get all campaigns for a company
 */
export async function getEmailCampaigns(companyId: string): Promise<EmailCampaign[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('email_campaigns')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  return data || []
}

/**
 * Send campaign (queue emails for sending)
 */
export async function sendEmailCampaign(
  campaignId: string
): Promise<{ success: boolean; emailsQueued?: number; error?: string }> {
  try {
    const supabase = createClient()

    // Get campaign details
    const { data: campaign } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (!campaign) {
      return { success: false, error: 'Campaign not found' }
    }

    // Get template
    const { data: template } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', campaign.template_id)
      .single()

    if (!template) {
      return { success: false, error: 'Template not found' }
    }

    // Get company details
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', campaign.company_id)
      .single()

    // Get leads
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .in('id', campaign.target_leads || [])

    if (!leads || leads.length === 0) {
      return { success: false, error: 'No leads found for campaign' }
    }

    // Create outreach records for each lead
    const outreachRecords = leads.map((lead: Lead) => {
      // Personalize template
      let personalizedSubject = template.subject_line
        .replace(/\{\{contact_name\}\}/g, lead.contact_name || 'there')
        .replace(/\{\{business_name\}\}/g, lead.business_name)
        .replace(/\{\{industry\}\}/g, lead.industry || '')

      let personalizedBody = template.body_text
        .replace(/\{\{contact_name\}\}/g, lead.contact_name || 'there')
        .replace(/\{\{business_name\}\}/g, lead.business_name)
        .replace(/\{\{industry\}\}/g, lead.industry || '')
        .replace(/\{\{sender_company\}\}/g, company?.name || '')

      return {
        company_id: campaign.company_id,
        campaign_id: campaignId,
        lead_id: lead.id,
        template_id: template.id,
        subject: personalizedSubject,
        body_html: template.body_html,
        body_text: personalizedBody,
        from_email: 'noreply@shakesmarketing.com', // Should come from settings
        from_name: company?.name || 'Shakes Marketing',
        to_email: lead.contact_email || '',
        to_name: lead.contact_name || '',
        personalization_data: {
          contact_name: lead.contact_name,
          business_name: lead.business_name,
          industry: lead.industry,
        },
        status: 'pending',
      }
    })

    // Insert outreach records
    const { data: outreach, error: outreachError } = await supabase
      .from('email_outreach')
      .insert(outreachRecords)
      .select()

    if (outreachError) {
      return { success: false, error: outreachError.message }
    }

    // Update campaign status
    await supabase
      .from('email_campaigns')
      .update({
        status: 'scheduled',
        scheduled_date: new Date().toISOString(),
      })
      .eq('id', campaignId)

    // Note: Actual email sending would be handled by a background job
    // that processes the email_outreach table

    return {
      success: true,
      emailsQueued: outreach?.length || 0,
    }
  } catch (error: any) {
    console.error('Error sending campaign:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Generate A/B test variants for email template
 */
export async function generateEmailVariants(
  templateId: string,
  variantCount: number = 2
): Promise<{ success: boolean; variants?: EmailTemplate[]; error?: string }> {
  try {
    const supabase = createClient()

    // Get original template
    const { data: template } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (!template) {
      return { success: false, error: 'Template not found' }
    }

    const prompt = `Generate ${variantCount} alternative versions of this email for A/B testing:

Original Subject: ${template.subject_line}
Original Body: ${template.body_text}

Create variants that test different:
1. Subject line hooks (curiosity vs. benefit-driven)
2. Opening lines
3. Value proposition framing
4. Call-to-action wording

Keep the core message the same but vary the approach.

Return JSON array with ${variantCount} objects, each containing "subject" and "body" fields.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an email marketing expert specializing in A/B testing and conversion optimization.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    })

    const response = JSON.parse(completion.choices[0]?.message?.content || '{}')
    const variants = response.variants || []

    // Create variant templates
    const variantTemplates = variants.map((variant: any, index: number) => ({
      company_id: template.company_id,
      name: `${template.name} - Variant ${String.fromCharCode(65 + index)}`,
      description: `A/B test variant of ${template.name}`,
      category: template.category,
      subject_line: variant.subject,
      preview_text: template.preview_text,
      body_html: template.body_html,
      body_text: variant.body,
      is_variant: true,
      parent_template_id: templateId,
      variant_name: String.fromCharCode(65 + index),
      is_active: true,
    }))

    const { data: insertedVariants, error } = await supabase
      .from('email_templates')
      .insert(variantTemplates)
      .select()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, variants: insertedVariants }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Get campaign analytics
 */
export async function getCampaignAnalytics(campaignId: string) {
  const supabase = createClient()

  const { data: outreach } = await supabase
    .from('email_outreach')
    .select('*')
    .eq('campaign_id', campaignId)

  if (!outreach) {
    return null
  }

  const total = outreach.length
  const sent = outreach.filter((e) => e.status !== 'pending').length
  const delivered = outreach.filter((e) => e.delivered_at).length
  const opened = outreach.filter((e) => e.opened_at).length
  const clicked = outreach.filter((e) => e.clicked_at).length
  const replied = outreach.filter((e) => e.replied_at).length
  const bounced = outreach.filter((e) => e.status === 'bounced').length

  return {
    total,
    sent,
    delivered,
    opened,
    clicked,
    replied,
    bounced,
    openRate: delivered > 0 ? ((opened / delivered) * 100).toFixed(2) : '0',
    clickRate: opened > 0 ? ((clicked / opened) * 100).toFixed(2) : '0',
    replyRate: delivered > 0 ? ((replied / delivered) * 100).toFixed(2) : '0',
    bounceRate: sent > 0 ? ((bounced / sent) * 100).toFixed(2) : '0',
  }
}
