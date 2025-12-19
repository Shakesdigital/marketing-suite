We can go to# Shakes Digital Marketing Suite

A comprehensive, AI-powered social media marketing assistant built with Next.js, CopilotKit, and Supabase.

## Features

- **Intelligent Company Onboarding**: Conversational AI-driven business profiling
- **Automated Market Research**: Deep competitor and trend analysis
- **Smart Marketing Plan Generation**: Custom strategies with daily/weekly/monthly plans
- **Content Calendar**: AI-generated topics and scheduling
- **Automated Post Creation**: Platform-optimized captions, hashtags, and visuals
- **Multi-client Support**: Agency mode for managing multiple businesses
- **Full Automation**: Set-and-forget content scheduling with review capabilities

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **AI Framework**: CopilotKit (chat, actions, runtime)
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **LLM**: OpenAI GPT-4 (or other providers via CopilotKit)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account
- OpenAI API key (or other LLM provider)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.local.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.local.example .env.local
   ```

4. Set up your Supabase database using the schema in `database/schema.sql`

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes and CopilotKit actions
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── copilot/          # CopilotKit components
│   ├── dashboard/        # Dashboard components
│   ├── onboarding/       # Onboarding flow
│   └── ui/               # Reusable UI components
├── lib/                   # Utilities and configurations
│   ├── supabase/         # Database client
│   ├── actions/          # CopilotKit actions
│   └── utils/            # Helper functions
└── types/                 # TypeScript type definitions
```

## Key Features Explained

### 1. Company Onboarding
Uses CopilotKit's conversational AI to collect business information through natural dialogue, storing structured data in Supabase.

### 2. Market Research
Automated research engine that analyzes competitors, trends, and opportunities using AI-powered web scraping and analysis.

### 3. Marketing Plans
Generates comprehensive, customized strategies with clear goals, content pillars, and KPIs tailored to the business profile.

### 4. Content Calendar
AI-generated content topics aligned with marketing strategy, with interactive review and approval workflow.

### 5. Automated Posting
Fully automated content generation and scheduling system with platform-specific optimization and manual override capabilities.

## CopilotKit Integration

This app leverages CopilotKit's powerful features:

- **useCopilotChat**: Conversational UI for onboarding and interactions
- **useCopilotAction**: Custom actions for market research, plan generation, content creation
- **CopilotRuntime**: Backend AI processing and LLM integration
- **useCopilotReadable**: Context sharing between UI and AI

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT License - see LICENSE file for details
