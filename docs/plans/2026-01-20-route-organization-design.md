# Route Organization Design

> **Created:** 2026-01-20

## Overview

Reorganized the Next.js App Router structure using route groups to improve code organization without changing URLs.

## Design Decisions

1. **Format:** Next.js route groups (parentheses naming)
2. **Groups:** `(public)`, `(auth)`, `(portals)` for pages; `(public)`, `(auth)`, `(admin)`, `(therapist)` for API
3. **Dynamic rendering:** Added `export const dynamic = "force-dynamic"` to all database-connected pages

## New Structure

### Pages

```
app/
├── (public)/              # Public marketing pages
│   ├── about/
│   ├── book/[slug]/
│   ├── booking/[ref]/
│   ├── community/
│   ├── contact/
│   ├── join-us/
│   ├── legal/
│   ├── resources/
│   ├── services/
│   ├── team/
│   └── therapists/[slug]/
│
├── (auth)/                # Authentication pages
│   └── auth/
│       ├── login/
│       ├── register/
│       ├── forgot-password/
│       ├── reset-password/
│       └── verify-email/
│
├── (portals)/             # Authenticated dashboards
│   ├── admin/
│   ├── therapist/
│   └── client/
│
└── api/                   # API routes
```

### API Routes

```
api/
├── (public)/              # Public API endpoints
│   ├── bookings/
│   ├── contact/
│   ├── therapists/
│   └── application/
│
├── (auth)/                # Auth API
│   └── auth/[...all]/
│
├── (admin)/               # Admin-only APIs
│   └── admin/
│
├── (therapist)/           # Therapist portal APIs
│   └── therapist/
│
└── uploadthing/           # Third-party integration
```

## Benefits

1. **URLs unchanged** - Route groups don't affect URL structure
2. **Clear organization** - Easy to find files by purpose
3. **Shared layouts** - Can add group-specific layouts later
4. **Better IDE navigation** - Collapsed folders by concern

## Technical Notes

- Added `export const dynamic = "force-dynamic"` to 23 pages that use database connections
- This prevents static generation timeouts during build
- Pages now render dynamically at request time

## Pages Updated

All pages using `AppDataSource` or `@/lib/db` now have the dynamic export:
- Public: therapists, therapists/[slug], book/[slug], booking/[ref]
- Admin: all pages (dashboard, therapists, bookings, calendar, users, settings)
- Therapist: all pages (dashboard, bookings, schedule, availability, settings)
- Client: dashboard, appointments

## Build Status

✅ Build passes successfully with 43 routes:
- 17 static pages (○)
- 9 SSG pages with generateStaticParams (●)
- 17 dynamic pages (ƒ) for API and database-connected routes
