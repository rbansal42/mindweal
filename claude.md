# Mindweal by Pihu Suri

Mental health clinic website with custom scheduling, authentication, content management, and automated email workflows.

**Tagline:** Untangle - Heal - Thrive

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Database**: MySQL 8.0 (Docker), TypeORM for entities
- **Runtime**: Bun 1.3.6, Node.js 24
- **Auth**: Better Auth (email/password, Google OAuth)
- **Email**: Nodemailer with Zoho SMTP, React Email templates
- **Scheduling**: Custom booking system
- **Content**: Custom admin dashboard with Tiptap rich text editor

## Project Structure

```
mindweal/
├── src/
│   ├── app/                # Pages and API routes
│   │   ├── auth/           # Auth pages (login, register, etc.)
│   │   ├── book/           # Public booking pages
│   │   ├── client/         # Client portal
│   │   ├── therapist/      # Therapist portal
│   │   ├── admin/          # Admin dashboard
│   │   └── api/            # API routes
│   ├── components/         # Reusable components
│   │   ├── auth/           # Auth forms
│   │   ├── booking/        # Booking components
│   │   └── layout/         # Header, Footer
│   ├── entities/           # TypeORM entities
│   ├── lib/                # Utilities
│   │   ├── auth.ts         # Better Auth config
│   │   ├── auth-client.ts  # Client-side auth
│   │   ├── db.ts           # TypeORM DataSource
│   │   └── email.ts        # Email utilities
│   ├── templates/          # Email templates
│   └── config.ts           # Centralized configuration
├── migrations/             # TypeORM migrations
├── scripts/                # Utility scripts
├── docs/plans/             # Design documents
├── init/                   # Database initialization SQL
├── package.json
└── docker-compose.yml      # MySQL container
```

## Development Commands

**Start MySQL database:**
```bash
docker-compose up -d
```

**Development (from project root):**
```bash
bun install
bun run dev      # Dev server with Turbopack (port 4242)
bun run build    # Production build
bun run lint     # ESLint
```

## Database Entities

Located in `src/entities/`:

| Entity | Purpose |
|--------|---------|
| `User` | All users (client, therapist, admin, reception roles) |
| `Therapist` | Therapist profiles |
| `TherapistAvailability` | Weekly recurring availability |
| `BlockedDate` | One-time blocked dates/times |
| `SessionType` | Session types per therapist |
| `Booking` | Appointments |
| `Session` | Auth sessions |
| `Account` | OAuth accounts |
| `VerificationToken` | Email verification & password reset |
| `Program` | Therapy programs |
| `Workshop` | Workshops and events |
| `CommunityProgram` | Community initiatives |
| `JobPosting` | Career opportunities |

## Authentication

Using Better Auth with:
- Email/password registration and login
- Google OAuth
- Email verification
- Password reset
- Role-based access (client, therapist, admin, reception)

Auth API: `/api/auth/[...all]`

Client-side hooks available from `@/lib/auth-client`:
```typescript
import { signIn, signUp, signOut, useSession } from "@/lib/auth-client";
```

## Booking System

### Public Booking
- `/book/[therapist-slug]` - Book with specific therapist
- Guest bookings allowed (no account required)
- Video sessions get auto-generated Google Meet links

### Portals
- `/client/*` - Client portal (view/manage bookings)
- `/therapist/*` - Therapist portal (availability, schedule)
- `/admin/*` - Admin dashboard (all schedules, create bookings)

## Code Conventions

### Branding
Always use "Mindweal by Pihu Suri" - never just "Mindweal"

### Colors (from logo - no purple)
- Primary Teal: `#00A99D`
- Primary Teal Dark: `#008B82`
- Secondary Green: `#4A9E6B`
- Accent Green: `#10B981`

### TypeScript
- Frontend uses strict mode
- Path alias: `@/*` maps to `./src/*`
- Use `"use client"` directive for client components

### Naming
- Components: PascalCase (`ContactForm.tsx`)
- Functions: camelCase (`getTherapists`)
- Pages: `page.tsx`, API routes: `route.ts`

### Forms
Use react-hook-form with zod validation:
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
```

## Environment Variables

**Frontend (.env.local):**
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=3307
DATABASE_USER=mindweal
DATABASE_PASSWORD=
DATABASE_NAME=mindweal

# Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Google Calendar (for Meet links)
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=

# Email
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=noreply@mindweal.in
SMTP_FROM_NAME=Mindweal
```

## Key Files

| File | Purpose |
|------|---------|
| `src/config.ts` | App config, auth config, booking config |
| `src/lib/auth.ts` | Better Auth server configuration |
| `src/lib/auth-client.ts` | Client-side auth hooks |
| `src/lib/db.ts` | TypeORM DataSource |
| `src/lib/email.ts` | Email sending utilities |
| `src/entities/` | All TypeORM entities |
| `src/templates/` | React Email templates |

## Email Templates

- `PasswordReset.tsx` - Password reset link
- `EmailVerification.tsx` - Email verification link
- `BookingConfirmationClient.tsx` - Client booking confirmation
- `BookingConfirmationTherapist.tsx` - Therapist notification
- `BookingReminder.tsx` - Session reminder
- `BookingCancellation.tsx` - Cancellation notice

# Testing

- Always run bun build to ensure that the application builds succesfully after making any changes.
- Fix any problems that causes bug failure

## The Iron Law

NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST

If you haven't completed Phase 1, you cannot propose fixes.

If 3+ fixes failed: Question the architecture.
DON'T attempt Fix #4 without architectural discussion.
