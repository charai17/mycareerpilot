# mycareerpilot Graphify Source Notes

## Product Entities
- mycareerpilot is the SaaS product.
- Job seeker is the paying user.
- Career profile stores role targets, regions, salary, seniority, work preferences, skills, and employment history.
- CV Studio creates a master CV and tailored CV versions.
- Job Search discovers roles from job-source connectors and manual URLs.
- Application Assistant prepares CVs, cover letters, and application answers.
- Assisted Approval requires user review before submission.
- Tracker stores the pipeline from discovered to offer.
- Billing supports paid plans.

## System Entities
- Next.js hosts the web application.
- Supabase provides Google auth, Postgres, file storage, and row-level security.
- OpenAI powers CV parsing, job matching, tailored CV generation, and answer drafting.
- Playwright supports browser form filling where allowed.
- Stripe handles subscriptions.
- Job-source connectors ingest jobs from ATS boards, job boards, and company career pages.

## Risk Entities
- Sensitive personal data includes names, addresses, CVs, salary expectations, employment history, visa status, and application answers.
- Job-board restrictions may limit automated search, scraping, or submission.
- AI hallucination can produce inaccurate CV claims or weak application answers.
- Auto-submit risk can damage user trust if applications are sent without clear permission.
- Audit logs and explicit consent reduce trust, compliance, and operational risk.

## Agency Lenses
- Product Manager should protect MVP focus and success metrics.
- UX Architect should design onboarding, review, and tracker flows.
- Software Architect should define system boundaries and reversible choices.
- AI Engineer should design matching and generation pipelines.
- Security Engineer should protect user data and permissions.
- Frontend Developer should build a calm, accessible SaaS dashboard.
