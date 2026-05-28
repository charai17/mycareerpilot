# mycareerpilot

mycareerpilot is a calm, professional SaaS concept for helping job seekers find suitable roles, tailor CVs, prepare applications, submit with permission, and track progress.

## Current Build

This repository contains the first Next.js foundation for the product:

- Dashboard, career profile, job search, CV Studio, assisted apply, and tracker screens
- TypeScript app structure with reusable components and typed mock data
- Tailwind CSS visual system for a calm professional SaaS interface
- Product brief and Graphify-style product map
- Early architecture recommendation for a future Next.js, Supabase, OpenAI, Stripe, and Playwright build

## Recommended Build Direction

The next milestone is to wire the app foundation into real services:

- Google sign-in
- User profile and CV data model
- Job tracker
- Manual job URL import
- AI-assisted CV tailoring and application review

The product should start with assisted approval: the AI prepares applications, but the user reviews before anything is submitted.

## Local Setup

Create `.env.local` using `.env.example`, then run:

```bash
npm install
npm run dev
```

The Supabase starter schema lives in `supabase/schema.sql`.
