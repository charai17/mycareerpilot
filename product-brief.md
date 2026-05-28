# mycareerpilot Product Brief

## Vision
mycareerpilot is a calm, professional SaaS workspace that helps paying users find suitable jobs globally, tailor CVs to each opportunity, prepare application answers, submit applications with permission, and track progress from discovery to offer.

## Target Users
The first audience is individual job seekers across regions and industries. Users can choose preferred regions, role types, salary expectations, remote preferences, seniority, and job categories. Recommendations should be based on the user's CV, career profile, preferences, and application history.

## Core Workflow
1. User signs in with Google.
2. User builds a career profile or uploads an existing CV.
3. mycareerpilot recommends jobs from supported sources and manual job URLs.
4. AI scores each job against the user's profile.
5. AI creates a tailored CV and drafts application answers.
6. User reviews the prepared application.
7. mycareerpilot submits only after user approval on supported sources.
8. Application status is tracked in a pipeline.

## MVP Scope
The MVP should include Google sign-in, profile builder, CV builder, job tracker, manual job URL import, basic job matching, tailored CV draft generation, and an assisted application review screen.

## Later Scope
Later versions can add more job-source connectors, browser-based form filling, trusted auto-submit rules, Stripe billing, team/admin plans, analytics, interview preparation, and email/calendar integrations.

## Automation Policy
Launch with assisted approval. The AI can prepare and fill applications, but the user reviews the final content before submission. Full auto-submit should be restricted to explicit user rules, supported sources, and clear audit logs.

## Recommended Stack
Use Next.js for the web app, Supabase for Google auth, Postgres, row-level security, and file storage, OpenAI for CV parsing and generation, Stripe for subscriptions, and Playwright for assisted form filling where allowed.

## Key Risks
Job boards may restrict automated access. Users will store sensitive personal data. AI-generated application content can be inaccurate. Auto-apply can damage user trust if it sends weak, wrong, or non-consensual applications. The system needs strong privacy, permission, auditability, and source-specific automation boundaries.

## Design Direction
The product should feel like a clean SaaS dashboard: calm, professional, direct, and trustworthy. The layout should prioritize user control, application review, pipeline visibility, and clear status over decorative marketing content.
