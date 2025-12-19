// Lead Generation and Research Actions
'use server'

import { createClient } from '@/lib/supabase/server'
import { Lead, LeadResearchSession, ResearchCriteria } from '@/types/leads'
import { generateJSON } from '@/lib/ai/client'

/**
 * Research and generate leads based on criteria
 * Uses AI to find and score potential business leads
 */
export async function researchLeads(
  companyId: string,
  criteria: ResearchCriteria,
  targetCount: number = 10
): Promise<{ success: boolean; sessionId?: string; leads?: Lead[]; error?: string }> {
  try {
    const supabase = createClient()
    
    // Get company details for context
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (!company) {
      return { success: false, error: 'Company not found' }
    }

    // Create research session
    const { data: session, error: sessionError } = await supabase
      .from('lead_research_sessions')
      .insert({
        company_id: companyId,
        search_criteria: criteria,
        target_count: targetCount,
        status: 'in_progress',
      })
      .select()
      .single()

    if (sessionError || !session) {
      return { success: false, error: 'Failed to create research session' }
    }

    const startTime = Date.now()

    // Use AI to research and generate leads
    const prompt = `You are a B2B lead generation expert. Research and generate ${targetCount} high-quality business leads based on these criteria:

Company Context:
- Name: ${company.name}
- Industry: ${company.industry}
- Description: ${company.description}
- Services: ${company.products_services?.join(', ')}

Search Criteria:
- Industries: ${criteria.industry?.join(', ') || 'Any'}
- Locations: ${criteria.location?.join(', ') || 'Any'}
- Company Sizes: ${criteria.company_size?.join(', ') || 'Any'}
- Keywords: ${criteria.keywords?.join(', ') || 'N/A'}
- Collaboration Types: ${criteria.collaboration_types?.join(', ') || 'content, partnership'}

For each lead, provide:
1. Business name
2. Industry
3. Location
4. Estimated company size (small/medium/large/enterprise)
5. Website URL (realistic format)
6. Contact person name and title
7. Contact email (format: firstname@businessdomain.com)
8. Brief description of the business
9. Potential pain points they might have
10. Products/services they offer
11. Why they're a good match for collaboration
12. Lead score (0-100 based on fit)
13. Recommended collaboration type

Focus on businesses that would genuinely benefit from collaboration with ${company.name}. Make the data realistic and diverse.

Return a JSON object with a "leads" array containing all generated leads.`

    const systemPrompt = 'You are a lead generation AI that returns only valid JSON with business leads. Each lead should be realistic and well-researched.'

    const aiResponse = await generateJSON(prompt, systemPrompt, 'standard')
    const generatedLeads = aiResponse.leads || []

    // Transform and insert leads into database
    const leadsToInsert = generatedLeads.map((lead: any) => ({
      company_id: companyId,
      business_name: lead.business_name || lead.name,
      industry: lead.industry,
      location: lead.location,
      company_size: lead.company_size,
      website_url: lead.website_url || lead.website,
      contact_name: lead.contact_name,
      contact_title: lead.contact_title,
      contact_email: lead.contact_email || lead.email,
      description: lead.description,
      pain_points: lead.pain_points || [],
      products_services: lead.products_services || [],
      lead_score: lead.lead_score || 50,
      lead_status: 'new',
      outreach_status: 'pending',
      source: 'ai_research',
      research_criteria: criteria,
      match_reasons: lead.match_reasons || [lead.collaboration_reason],
      collaboration_type: lead.collaboration_type ? [lead.collaboration_type] : ['content'],
    }))

    const { data: insertedLeads, error: leadsError } = await supabase
      .from('leads')
      .insert(leadsToInsert)
      .select()

    if (leadsError) {
      console.error('Error inserting leads:', leadsError)
      // Update session as failed
      await supabase
        .from('lead_research_sessions')
        .update({
          status: 'failed',
          error_message: leadsError.message,
        })
        .eq('id', session.id)

      return { success: false, error: leadsError.message }
    }

    const duration = Math.floor((Date.now() - startTime) / 1000)

    // Update session as completed
    await supabase
      .from('lead_research_sessions')
      .update({
        status: 'completed',
        leads_found: generatedLeads.length,
        leads_imported: insertedLeads?.length || 0,
        research_duration_seconds: duration,
        ai_model_used: 'auto',
      })
      .eq('id', session.id)

    return {
      success: true,
      sessionId: session.id,
      leads: insertedLeads,
    }
  } catch (error: any) {
    console.error('Error in researchLeads:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get all leads for a company
 */
export async function getLeads(companyId: string): Promise<Lead[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('leads')
    .select('*')
    .eq('company_id', companyId)
    .order('lead_score', { ascending: false })

  return data || []
}

/**
 * Update lead status
 */
export async function updateLeadStatus(
  leadId: string,
  status: string,
  outreachStatus?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    const updates: any = { lead_status: status }

    if (outreachStatus) {
      updates.outreach_status = outreachStatus
    }

    if (status === 'contacted' && outreachStatus === 'sent') {
      updates.first_contacted_at = new Date().toISOString()
      updates.last_contacted_at = new Date().toISOString()
    }

    if (status === 'converted') {
      updates.converted_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', leadId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Export leads to CSV
 */
export async function exportLeadsToCSV(companyId: string): Promise<{ success: boolean; csv?: string; error?: string }> {
  try {
    const leads = await getLeads(companyId)

    const headers = [
      'Business Name',
      'Industry',
      'Location',
      'Contact Name',
      'Contact Email',
      'Contact Title',
      'Website',
      'Lead Score',
      'Status',
      'Outreach Status',
    ]

    const rows = leads.map((lead) => [
      lead.business_name,
      lead.industry || '',
      lead.location || '',
      lead.contact_name || '',
      lead.contact_email || '',
      lead.contact_title || '',
      lead.website_url || '',
      lead.lead_score,
      lead.lead_status,
      lead.outreach_status,
    ])

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')

    return { success: true, csv }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Enrich lead with additional data using AI
 */
export async function enrichLead(leadId: string): Promise<{ success: boolean; lead?: Lead; error?: string }> {
  try {
    const supabase = createClient()
    
    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (!lead) {
      return { success: false, error: 'Lead not found' }
    }

    // Use AI to enrich lead data
    const prompt = `Research and enrich this business lead with additional information:

Business: ${lead.business_name}
Industry: ${lead.industry || 'Unknown'}
Location: ${lead.location || 'Unknown'}
Website: ${lead.website_url || 'Unknown'}

Provide enriched data in JSON format with:
- description: Brief company description
- pain_points: Array of 3-5 potential pain points
- products_services: Array of their main offerings
- employee_count: Estimated employee count
- revenue_estimate: Estimated annual revenue range
- funding_stage: Funding stage if applicable
- key_decision_makers: Array of likely decision maker roles`

    const systemPrompt = 'You are a business intelligence AI that provides detailed company information in JSON format.'

    const enrichedData = await generateJSON(prompt, systemPrompt, 'fast')

    // Update lead with enriched data
    const { data: updatedLead, error } = await supabase
      .from('leads')
      .update({
        description: enrichedData.description || lead.description,
        pain_points: enrichedData.pain_points || lead.pain_points,
        products_services: enrichedData.products_services || lead.products_services,
        employee_count: enrichedData.employee_count || lead.employee_count,
        revenue_estimate: enrichedData.revenue_estimate || lead.revenue_estimate,
        funding_stage: enrichedData.funding_stage || lead.funding_stage,
      })
      .eq('id', leadId)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, lead: updatedLead }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Delete a lead
 */
export async function deleteLead(leadId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    const { error } = await supabase.from('leads').delete().eq('id', leadId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Add lead manually
 */
export async function addLead(
  companyId: string,
  leadData: Partial<Lead>
): Promise<{ success: boolean; lead?: Lead; error?: string }> {
  try {
    const supabase = createClient()

    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        company_id: companyId,
        ...leadData,
        source: 'manual',
        lead_status: leadData.lead_status || 'new',
        outreach_status: leadData.outreach_status || 'pending',
        lead_score: leadData.lead_score || 50,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, lead }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
