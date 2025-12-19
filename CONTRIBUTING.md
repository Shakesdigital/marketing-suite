# Contributing to Shakes Digital Marketing Suite

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Process](#development-process)
4. [Coding Standards](#coding-standards)
5. [Testing](#testing)
6. [Pull Request Process](#pull-request-process)
7. [Feature Requests](#feature-requests)
8. [Bug Reports](#bug-reports)

---

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

**Unacceptable behavior:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites

- Node.js 18+
- Git
- Supabase account
- OpenAI API key
- Code editor (VS Code recommended)

### Fork and Clone

```bash
# Fork the repository on GitHub

# Clone your fork
git clone https://github.com/yourusername/shakes-marketing-suite.git

# Navigate to directory
cd shakes-marketing-suite

# Add upstream remote
git remote add upstream https://github.com/original/shakes-marketing-suite.git
```

### Install Dependencies

```bash
npm install
```

### Configure Environment

```bash
cp .env.local.example .env.local
# Fill in your credentials
```

### Run Development Server

```bash
npm run dev
```

---

## Development Process

### Branch Strategy

**Main Branches:**
- `main` - Production-ready code
- `develop` - Development branch

**Feature Branches:**
- `feature/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `docs/doc-update` - Documentation updates
- `refactor/component-name` - Code refactoring

### Creating a Feature Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/amazing-feature

# Make your changes
# Commit regularly with descriptive messages
git commit -m "Add amazing feature"

# Push to your fork
git push origin feature/amazing-feature
```

---

## Coding Standards

### TypeScript

**Use TypeScript for type safety:**

```typescript
// ✅ Good
interface User {
  id: string
  name: string
  email: string
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Avoid
function getUser(id: any): any {
  // ...
}
```

### React Components

**Functional components with TypeScript:**

```typescript
// ✅ Good
interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  )
}

// ❌ Avoid
export function Button(props: any) {
  return <button onClick={props.onClick}>{props.label}</button>
}
```

### File Naming

- **Components:** PascalCase - `MyComponent.tsx`
- **Utilities:** camelCase - `myUtility.ts`
- **Pages:** kebab-case - `my-page.tsx`
- **Types:** PascalCase - `MyTypes.ts`

### Code Organization

```typescript
// 1. Imports (grouped and sorted)
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MyComponent } from '@/components/MyComponent'
import { myUtility } from '@/lib/utils'

// 2. Type definitions
interface MyComponentProps {
  // ...
}

// 3. Component definition
export default function MyComponent({ prop }: MyComponentProps) {
  // 4. Hooks
  const [state, setState] = useState()
  const router = useRouter()
  
  // 5. Effects
  useEffect(() => {
    // ...
  }, [])
  
  // 6. Event handlers
  const handleClick = () => {
    // ...
  }
  
  // 7. Render
  return (
    <div>{/* ... */}</div>
  )
}
```

### Styling

**Use Tailwind CSS:**

```typescript
// ✅ Good
<div className="flex items-center gap-4 rounded-lg bg-white p-6">
  {/* ... */}
</div>

// ❌ Avoid inline styles
<div style={{ display: 'flex', padding: '24px' }}>
  {/* ... */}
</div>
```

### Comments

**Write self-documenting code, add comments for complex logic:**

```typescript
// ✅ Good - Comment explains WHY
// Calculate optimal posting time based on audience timezone and engagement patterns
const optimalTime = calculatePostingTime(timezone, patterns)

// ❌ Avoid - Comment states the obvious
// Set the user name
setUserName(name)
```

---

## Testing

### Manual Testing

Before submitting PR:

1. Test the feature thoroughly
2. Test on different screen sizes
3. Test error scenarios
4. Verify no console errors
5. Check TypeScript compilation

```bash
npm run type-check
npm run lint
```

### Future: Automated Testing

We plan to add:
- Unit tests (Jest)
- Integration tests
- E2E tests (Playwright)

---

## Pull Request Process

### Before Submitting

**Checklist:**
- [ ] Code follows style guidelines
- [ ] TypeScript compiles without errors
- [ ] No console errors or warnings
- [ ] Tested on multiple browsers
- [ ] Tested on mobile/tablet
- [ ] Documentation updated (if needed)
- [ ] Commit messages are clear

### PR Title Format

```
[Type] Brief description

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- refactor: Code refactoring
- style: Formatting, styling
- test: Adding tests
- chore: Maintenance

Examples:
feat: Add automated content scheduling
fix: Resolve CopilotKit connection issue
docs: Update setup guide with new steps
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
How to test these changes

## Screenshots
If applicable

## Related Issues
Fixes #123
```

### Review Process

1. Submit PR
2. Automated checks run
3. Code review by maintainer
4. Address feedback
5. Approval and merge

---

## Feature Requests

### Proposing New Features

**Use GitHub Issues with template:**

```markdown
## Feature Title
Clear, descriptive title

## Problem
What problem does this solve?

## Proposed Solution
How should it work?

## Alternatives Considered
Other approaches you've thought about

## Additional Context
Screenshots, examples, etc.
```

### Feature Discussion

- Features are discussed in issues
- Community can vote (👍/👎)
- Maintainers decide on roadmap fit
- Approved features added to backlog

---

## Bug Reports

### Reporting Bugs

**Use GitHub Issues with template:**

```markdown
## Bug Title
Clear, specific title

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Environment
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]

## Screenshots
If applicable

## Console Errors
Paste any console errors
```

### Bug Priorities

**Critical:** Security, data loss, crashes
**High:** Major features broken
**Medium:** Minor features broken
**Low:** Cosmetic issues

---

## Development Guidelines

### Database Changes

When modifying schema:

1. Update `database/schema.sql`
2. Document migration steps
3. Test with fresh database
4. Update type definitions

### Adding CopilotKit Actions

When adding new AI actions:

```typescript
// 1. Define action
useCopilotAction({
  name: 'actionName',
  description: 'Clear description for AI',
  parameters: [/* ... */],
  handler: async (params) => {
    // 2. Validate inputs
    // 3. Perform action
    // 4. Return user-friendly message
  },
})

// 5. Document in FEATURES.md
// 6. Test thoroughly
```

### API Routes

Follow this pattern:

```typescript
// app/api/endpoint/route.ts
export async function POST(req: Request) {
  try {
    // 1. Validate authentication
    // 2. Parse and validate input
    // 3. Perform operation
    // 4. Return response
    return Response.json({ success: true, data })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
```

---

## Code Review Checklist

### For Reviewers

When reviewing PRs:

**Code Quality:**
- [ ] Follows coding standards
- [ ] No code duplication
- [ ] Proper error handling
- [ ] Type-safe

**Functionality:**
- [ ] Feature works as described
- [ ] No regression bugs
- [ ] Edge cases handled

**Security:**
- [ ] No security vulnerabilities
- [ ] Proper authentication/authorization
- [ ] Input validation

**Performance:**
- [ ] No performance degradation
- [ ] Efficient database queries
- [ ] Optimized renders

---

## Git Commit Messages

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Examples

```
feat(onboarding): add multi-step progress indicator

Add visual progress indicator to show users their position
in the onboarding flow. Improves UX by reducing uncertainty.

Closes #45

---

fix(calendar): resolve scheduling timezone issue

Posts were being scheduled in UTC instead of user timezone.
Now properly converts to user's local timezone.

Fixes #67

---

docs(setup): update environment variable instructions

Clarified OpenAI API key setup steps based on user feedback.
```

---

## Questions?

- **GitHub Issues:** For bugs and features
- **Discussions:** For questions and ideas
- **Discord:** (if available) For real-time help

---

## Recognition

Contributors will be:
- Listed in README.md
- Credited in release notes
- Part of our community!

Thank you for contributing to Shakes Digital Marketing Suite! 🚀
