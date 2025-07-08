# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `pnpm install` - Install dependencies
- `pnpm dev` - Run development server with Turbopack at http://localhost:3000
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run Next.js linting

### Database
- `docker-compose up -d` - Start PostgreSQL database (required for development)
- `pnpm exec prisma migrate dev --name <migration_name>` - Create and apply database migrations
- `pnpm exec prisma generate` - Generate Prisma client after schema changes
- `pnpm exec prisma migrate deploy` - Apply migrations in production

### Component Installation
- `pnpm dlx shadcn-ui@latest add <component_name>` - Add ShadCN UI components

## Architecture

Hi.new is a minimalist contact shortlink platform built with Next.js 15, allowing anyone to contact you via `hi.new/<slug>` through web forms or API calls.

### Core Features
1. **Link Management**: Users create unique slugs (e.g., hi.new/elie) that point to contact forms
2. **Multiple Delivery Options**: Each link can have multiple delivery methods (Email via Resend, Webhooks)
3. **API Contact**: Links accept both GET (web form) and POST (API) requests
4. **Rate Limiting**: Optional IP-based rate limiting using Upstash Redis

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth with email/password
- **Email**: Resend for email delivery
- **Payments**: Stripe for payment processing
- **UI**: ShadCN UI components with Tailwind CSS
- **Forms**: React Hook Form with Zod validation

### Key Patterns

#### Database Access
Always use the singleton Prisma client from lib/prisma.ts:
```typescript
import { prisma } from "@/lib/prisma";
```

#### Authentication
Better Auth is configured in lib/auth.ts with Prisma adapter. Use server-side session checking:
```typescript
const session = await auth.api.getSession({ headers: await headers() });
```

#### Server Actions
Located in actions/ directory, these handle form submissions and data mutations. They validate input with Zod schemas and check authentication.

#### API Routes
- `GET /[slug]` - Redirects to contact form
- `POST /[slug]` - Accepts JSON payload with senderName, senderEmail, and message

#### Form Validation
All forms use React Hook Form with Zod schemas defined in lib/schemas/.

### Environment Variables
Required for development:
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - Better Auth secret key
- `RESEND_API_KEY` - Resend API key for email delivery
- `UPSTASH_REDIS_REST_URL` - Optional, for rate limiting
- `DEFAULT_FROM_EMAIL` - Sender email for notifications
- `STRIPE_SECRET_KEY` - Stripe secret key for payment processing
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook endpoint secret
- `STRIPE_PAYMENT_SUCCESS_URL` - URL to redirect after successful payment
- `STRIPE_PAYMENT_CANCEL_URL` - URL to redirect after cancelled payment

### Development Notes
- Uses pnpm as package manager (v9.11.0)
- TypeScript with strict mode
- ESLint configuration extends Next.js defaults
- Tailwind CSS v4 with tw-animate-css for animations
- Docker Compose for local PostgreSQL development