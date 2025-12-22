'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core'
import { supabase } from '@/lib/supabase/client'
import { saveOnboardingData, completeOnboarding } from '@/lib/actions/onboarding-actions'
import { SocialAccounts } from '@/types'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle } from 'lucide-react'

export default function NewCompanyPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string>('')
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [onboardingData, setOnboardingData] = useState({
    companyName: '',
    industry: '',
    description: '',
    productsServices: [] as string[],
    uniqueValueProposition: '',
    brandVoice: '',
    websiteUrl: '',
    targetAudience: {
      demographics: {} as object,
      psychographics: {} as object,
      pain_points: [] as string[],
      behaviors: {} as object,
    },
    socialAccounts: {} as SocialAccounts,
  })

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }
    getUser()
  }, [])

  // Make onboarding data readable by Copilot
  useCopilotReadable({
    description: 'Current company onboarding data and progress',
    value: {
      currentStep,
      onboardingData,
      completedSteps: [
        currentStep > 0,
        currentStep > 1,
        currentStep > 2,
        currentStep > 3,
        currentStep > 4,
      ],
    },
  })

  // Action: Save basic company information
  useCopilotAction({
    name: 'saveBasicCompanyInfo',
    description: 'Save basic company information including name, industry, and description',
    parameters: [
      {
        name: 'companyName',
        type: 'string',
        description: 'The name of the company',
        required: true,
      },
      {
        name: 'industry',
        type: 'string',
        description: 'The industry or sector the company operates in',
        required: true,
      },
      {
        name: 'description',
        type: 'string',
        description: 'A brief description of what the company does',
        required: true,
      },
      {
        name: 'websiteUrl',
        type: 'string',
        description: 'Company website URL (optional)',
        required: false,
      },
    ],
    handler: async ({ companyName, industry, description, websiteUrl }) => {
      const updatedData = {
        ...onboardingData,
        companyName,
        industry,
        description,
        websiteUrl: websiteUrl || '',
      }

      setOnboardingData(updatedData)

      const result = await saveOnboardingData(userId, companyId, updatedData, 1)
      if (result.success && result.companyId) {
        setCompanyId(result.companyId)
        setCurrentStep(1)
      }

      return `Great! I've saved ${companyName}'s basic information. Now let's talk about your products and services.`
    },
  })

  // Action: Save products and services
  useCopilotAction({
    name: 'saveProductsServices',
    description: 'Save the company products, services, and unique value proposition',
    parameters: [
      {
        name: 'productsServices',
        type: 'string[]',
        description: 'Array of products or services the company offers',
        required: true,
      },
      {
        name: 'uniqueValueProposition',
        type: 'string',
        description: 'What makes this company unique or different from competitors',
        required: true,
      },
    ],
    handler: async ({ productsServices, uniqueValueProposition }) => {
      const updatedData = {
        ...onboardingData,
        productsServices,
        uniqueValueProposition,
      }

      setOnboardingData(updatedData)

      await saveOnboardingData(userId, companyId, updatedData, 2)
      setCurrentStep(2)

      return `Perfect! I understand your offerings. Now, let's define your brand voice and tone.`
    },
  })

  // Action: Save brand voice
  useCopilotAction({
    name: 'saveBrandVoice',
    description: 'Save the company brand voice, tone, and communication style',
    parameters: [
      {
        name: 'brandVoice',
        type: 'string',
        description: 'Description of the brand voice and tone (e.g., professional, friendly, casual, authoritative)',
        required: true,
      },
    ],
    handler: async ({ brandVoice }) => {
      const updatedData = {
        ...onboardingData,
        brandVoice,
      }

      setOnboardingData(updatedData)

      await saveOnboardingData(userId, companyId, updatedData, 3)
      setCurrentStep(3)

      return `Excellent! Now let's talk about your target audience. Who are you trying to reach?`
    },
  })

  // Action: Save target audience
  useCopilotAction({
    name: 'saveTargetAudience',
    description: 'Save detailed target audience information including demographics, psychographics, pain points, and behaviors',
    parameters: [
      {
        name: 'demographics',
        type: 'object',
        description: 'Demographic information: age_range, gender, location, income_level, education',
        required: true,
      },
      {
        name: 'psychographics',
        type: 'object',
        description: 'Psychographic information: interests, values, lifestyle, personality',
        required: false,
      },
      {
        name: 'painPoints',
        type: 'string[]',
        description: 'Array of pain points or challenges the target audience faces',
        required: true,
      },
      {
        name: 'behaviors',
        type: 'object',
        description: 'Behavioral information: online_habits, purchasing_behavior, preferred_platforms',
        required: false,
      },
    ],
    handler: async ({ demographics, psychographics, painPoints, behaviors }) => {
      const updatedData = {
        ...onboardingData,
        targetAudience: {
          demographics,
          psychographics: psychographics || {},
          pain_points: painPoints,
          behaviors: behaviors || {},
        },
      }

      setOnboardingData(updatedData)

      await saveOnboardingData(userId, companyId, updatedData, 4)
      setCurrentStep(4)

      return `Great! Last step - let's connect your social media accounts or list which platforms you want to use.`
    },
  })

  // Action: Save social media accounts
  useCopilotAction({
    name: 'saveSocialAccounts',
    description: 'Save social media accounts and platforms the company uses or wants to use',
    parameters: [
      {
        name: 'platforms',
        type: 'object',
        description: 'Object with platform names as keys (instagram, facebook, twitter, linkedin, tiktok) and account details as values',
        required: true,
      },
    ],
    handler: async ({ platforms }) => {
      const updatedData = {
        ...onboardingData,
        socialAccounts: platforms,
      }

      setOnboardingData(updatedData)

      await saveOnboardingData(userId, companyId, updatedData, 5)
      setCurrentStep(5)

      // Complete onboarding
      if (companyId) {
        await completeOnboarding(companyId)
      }

      return `🎉 Congratulations! Your company onboarding is complete! I'll now start analyzing your market and creating a custom marketing strategy. You can view the progress in your dashboard.`
    },
  })

  // Action: Complete onboarding manually
  useCopilotAction({
    name: 'completeOnboarding',
    description: 'Mark the onboarding as complete and proceed to market research',
    parameters: [],
    handler: async () => {
      if (companyId) {
        await completeOnboarding(companyId)
        router.push(`/dashboard/companies/${companyId}`)
        return 'Onboarding completed! Redirecting to your company dashboard...'
      }
      return 'Please complete all steps first.'
    },
  })

  const steps = [
    { name: 'Basic Info', description: 'Company name, industry, description' },
    { name: 'Products & Services', description: 'What you offer' },
    { name: 'Brand Voice', description: 'Tone and style' },
    { name: 'Target Audience', description: 'Who you serve' },
    { name: 'Social Accounts', description: 'Platform connections' },
  ]

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Company Onboarding</h1>
          <p className="mt-2 text-gray-600">
            Let's get your business set up! Open the AI assistant on the right to start a conversation,
            or fill out the information below manually.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.name} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${index <= currentStep
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 bg-white text-gray-400'
                      }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <Circle className="h-6 w-6" />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-sm font-medium">{step.name}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-4 h-0.5 flex-1 ${index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Onboarding Instructions */}
        <div className="rounded-lg border bg-white p-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Let's Get Started! 🚀</h2>
            <p className="mt-4 text-lg text-gray-600">
              Click the AI Assistant button in the sidebar to begin a conversational onboarding
              experience. I'll guide you through each step and collect all the information I need
              about your business.
            </p>
            <div className="mt-6 space-y-4">
              <p className="text-gray-600">
                I'll ask you about:
              </p>
              <ul className="mx-auto max-w-md space-y-2 text-left text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <span>Your company name, industry, and what you do</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <span>Your products, services, and what makes you unique</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <span>Your brand voice and communication style</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <span>Your target audience and their characteristics</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <span>Your social media platforms and accounts</span>
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <p className="text-sm text-gray-500">
                The entire process takes about 5-10 minutes. Once complete, I'll automatically
                start researching your market and creating your custom marketing strategy!
              </p>
            </div>
          </div>
        </div>

        {/* Current Data Display (for debugging/transparency) */}
        {currentStep > 0 && (
          <div className="mt-8 rounded-lg border bg-gray-50 p-6">
            <h3 className="mb-4 font-semibold">Collected Information</h3>
            <div className="space-y-2 text-sm">
              {onboardingData.companyName && (
                <p><strong>Company:</strong> {onboardingData.companyName}</p>
              )}
              {onboardingData.industry && (
                <p><strong>Industry:</strong> {onboardingData.industry}</p>
              )}
              {onboardingData.description && (
                <p><strong>Description:</strong> {onboardingData.description}</p>
              )}
              {onboardingData.productsServices.length > 0 && (
                <p><strong>Products/Services:</strong> {onboardingData.productsServices.join(', ')}</p>
              )}
              {onboardingData.brandVoice && (
                <p><strong>Brand Voice:</strong> {onboardingData.brandVoice}</p>
              )}
            </div>
          </div>
        )}

        {/* Complete Button */}
        {currentStep === 5 && companyId && (
          <div className="mt-8 text-center">
            <Button
              size="lg"
              onClick={() => router.push(`/dashboard/companies/${companyId}`)}
            >
              Go to Company Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
