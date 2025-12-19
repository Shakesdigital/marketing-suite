// CopilotKit Actions for Company Onboarding

import { supabase } from '@/lib/supabase/client'
import { Company, TargetAudience, SocialAccounts } from '@/types'

export interface OnboardingData {
  companyName?: string
  industry?: string
  description?: string
  productsServices?: string[]
  uniqueValueProposition?: string
  brandVoice?: string
  websiteUrl?: string
  targetAudience?: TargetAudience
  socialAccounts?: SocialAccounts
}

export async function saveOnboardingData(
  userId: string,
  companyId: string | null,
  data: Partial<OnboardingData>,
  step: number
): Promise<{ success: boolean; companyId?: string; error?: string }> {
  try {
    if (companyId) {
      // Update existing company
      const { error } = await supabase
        .from('companies')
        .update({
          ...data,
          onboarding_step: step,
          updated_at: new Date().toISOString(),
        })
        .eq('id', companyId)

      if (error) throw error

      return { success: true, companyId }
    } else {
      // Create new company
      const { data: newCompany, error } = await supabase
        .from('companies')
        .insert({
          user_id: userId,
          name: data.companyName || 'Untitled Company',
          industry: data.industry,
          description: data.description,
          products_services: data.productsServices,
          unique_value_proposition: data.uniqueValueProposition,
          brand_voice: data.brandVoice,
          website_url: data.websiteUrl,
          target_audience: data.targetAudience,
          social_accounts: data.socialAccounts,
          onboarding_step: step,
          onboarding_completed: false,
        })
        .select()
        .single()

      if (error) throw error

      return { success: true, companyId: newCompany.id }
    }
  } catch (error: any) {
    console.error('Error saving onboarding data:', error)
    return { success: false, error: error.message }
  }
}

export async function completeOnboarding(
  companyId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('companies')
      .update({
        onboarding_completed: true,
        onboarding_step: 100,
        updated_at: new Date().toISOString(),
      })
      .eq('id', companyId)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error('Error completing onboarding:', error)
    return { success: false, error: error.message }
  }
}

export async function getCompanyById(companyId: string): Promise<Company | null> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (error) throw error

    return data as Company
  } catch (error) {
    console.error('Error fetching company:', error)
    return null
  }
}

// Helper function to extract structured data from conversational input
export function parseOnboardingResponse(userMessage: string, field: string): any {
  // This is a simplified parser - in production, you'd use more sophisticated NLP
  const lowerMessage = userMessage.toLowerCase()

  switch (field) {
    case 'productsServices':
      // Look for comma-separated items or "and" separated items
      return userMessage
        .split(/,|and/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0)

    case 'targetAudience':
      // Extract demographic information
      const demographics: any = {}
      
      // Age detection
      const ageMatch = userMessage.match(/(\d{2})-(\d{2})|(\d{2}) to (\d{2})/)
      if (ageMatch) {
        demographics.age_range = `${ageMatch[1] || ageMatch[3]}-${ageMatch[2] || ageMatch[4]}`
      }

      // Gender detection
      if (lowerMessage.includes('women') || lowerMessage.includes('female')) {
        demographics.gender = 'Female'
      } else if (lowerMessage.includes('men') || lowerMessage.includes('male')) {
        demographics.gender = 'Male'
      } else if (lowerMessage.includes('all genders') || lowerMessage.includes('everyone')) {
        demographics.gender = 'All'
      }

      return { demographics }

    default:
      return userMessage
  }
}
