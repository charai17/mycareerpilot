# mycareerpilot Graph Report

## Audit Note
The Graphify package installed locally, but its internal modules were not importable in this Windows sandbox and the installed metadata was malformed. I used the Graphify workflow shape on the local source files instead: persistent graph JSON, community map, and a plain-language report.

Sources:
- `product-brief.md`
- `graphify-source-notes.md`
- `index.html`
- `styles.css`
- `app.js`

## Summary
- Nodes: 25
- Edges: 27
- Communities: 7
- Confidence tags: EXTRACTED and INFERRED

## Communities
- Product Core: product identity and commercial purpose
- User & Workflow: profile, search, CV creation, application preparation, tracker
- Technical Architecture: Next.js and Supabase foundation
- AI Pipeline: OpenAI-powered matching, CV generation, and answer drafting
- Automation: Playwright and job-source connectors
- Trust & Compliance: sensitive data, consent, audit logs, job-board restrictions
- Agency Roles: specialist lenses guiding the build

## God Nodes
- **mycareerpilot**: central product node connecting users, stack, billing, and roadmap.
- **Career Profile**: the main input that drives job matching, CV tailoring, and user preferences.
- **Application Assistant**: the highest-risk workflow because it connects AI-generated content, form filling, user approval, and submission.
- **Sensitive Personal Data**: the core compliance node connected to Supabase, security, consent, and auditability.

## Surprising Connections
- **Assisted Approval connects UX and compliance**: the review screen is not just a product feature; it is the trust boundary that makes automation commercially safer.
- **Job Source Connectors connect growth and risk**: "search everywhere" is a user promise, but each source needs different legal, technical, and reliability handling.
- **Career Profile is both data model and product moat**: better profile structure improves recommendations, CV tailoring, and application quality over time.
- **Audit Logs are a product feature**: users need confidence that the AI did not submit anything silently or incorrectly.

## Suggested Questions
1. Which nodes should be built first to create the smallest trustworthy MVP?
2. Where does automation create the most product risk?
3. Which Agency roles should guide each build phase?
4. What data needs the strongest privacy controls before launch?
5. How should job-source connectors expand without breaking the product promise?

## Recommended Build Order
1. Google sign-in and user profile
2. Career profile data model
3. CV Studio master CV and tailored CV drafts
4. Manual job URL import
5. Job matching score
6. Application review screen
7. Tracker pipeline
8. Supabase row-level security and delete-my-data flow
9. Stripe billing
10. Job-source connector expansion

## Most Important Build Boundary
Do not start with full auto-submit. Start with assisted approval: prepare, show, confirm, then submit only on supported sources.
