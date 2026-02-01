# Security & Code Quality Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix critical security vulnerabilities and high-priority code quality issues across the Mindweal codebase.

**Architecture:** Phased approach - Phase 1 addresses CRITICAL/IMPORTANT security issues, Phase 2 addresses code quality quick wins that can be parallelized.

**Tech Stack:** Next.js 16, TypeScript, Zod, Better Auth

---

## Phase 1: Critical Security Fixes

### Task 1.1: Create HTML Escape Utility for Email Templates

**Files:**
- Create: `src/lib/html-escape.ts`

**Step 1: Create the utility**

```typescript
// src/lib/html-escape.ts
/**
 * Escapes HTML special characters to prevent XSS attacks in email templates.
 * Use this for any user-provided content that will be embedded in HTML emails.
 */
export function escapeHtml(text: string): string {
  if (!text) return "";
  return text.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[char] || char;
  });
}

/**
 * Escapes multiple fields in an object for safe HTML embedding.
 */
export function escapeHtmlFields<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };
  for (const field of fields) {
    if (typeof result[field] === "string") {
      (result as Record<string, unknown>)[field as string] = escapeHtml(
        result[field] as string
      );
    }
  }
  return result;
}
```

**Step 2: Verify build passes**

Run: `bun run build`

**Step 3: Commit**

```bash
git add src/lib/html-escape.ts
git commit -m "feat: add HTML escape utility for XSS prevention in emails"
```

---

### Task 1.2: Fix XSS in Contact Form Email

**Files:**
- Modify: `src/app/api/(public)/contact/route.ts`

**Step 1: Add import and escape user input**

At top of file, add:
```typescript
import { escapeHtml } from "@/lib/html-escape";
```

In the POST handler, escape user input before embedding in HTML:
- Escape `name`, `email`, `phone`, `message`, `subject` before using in email templates

**Step 2: Verify build passes**

Run: `bun run build`

**Step 3: Commit**

```bash
git add src/app/api/(public)/contact/route.ts
git commit -m "fix: escape HTML in contact form email to prevent XSS"
```

---

### Task 1.3: Fix XSS in Job Application Email

**Files:**
- Modify: `src/app/api/(public)/application/route.ts`

**Step 1: Add import and escape user input**

At top of file, add:
```typescript
import { escapeHtml } from "@/lib/html-escape";
```

Escape `name`, `email`, `phone`, `position`, `coverLetter` before embedding in email HTML.

**Step 2: Verify build passes**

Run: `bun run build`

**Step 3: Commit**

```bash
git add src/app/api/(public)/application/route.ts
git commit -m "fix: escape HTML in job application email to prevent XSS"
```

---

### Task 1.4: Add Validation to Therapist Session Types Route

**Files:**
- Modify: `src/lib/validation.ts` - add `sessionTypeSchema`
- Modify: `src/app/api/(therapist)/therapist/session-types/route.ts`
- Modify: `src/app/api/(therapist)/therapist/session-types/[id]/route.ts`

**Step 1: Add Zod schema to validation.ts**

```typescript
// Add to src/lib/validation.ts
export const sessionTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  duration: z.number().int().min(15).max(480),
  price: z.number().min(0),
  currency: z.string().length(3).default("INR"),
  meetingType: z.enum(["in-person", "video", "phone"]),
  isActive: z.boolean().optional(),
});

export const updateSessionTypeSchema = sessionTypeSchema.partial();
```

**Step 2: Apply validation to POST route**

**Step 3: Apply validation to PATCH route**

**Step 4: Verify build passes**

**Step 5: Commit**

```bash
git add src/lib/validation.ts src/app/api/\(therapist\)/therapist/session-types/
git commit -m "fix: add Zod validation to therapist session-types routes"
```

---

### Task 1.5: Add Validation to Therapist Availability Route

**Files:**
- Modify: `src/lib/validation.ts` - add `availabilityInputSchema`
- Modify: `src/app/api/(therapist)/therapist/availability/route.ts`
- Modify: `src/app/api/(therapist)/therapist/availability/[id]/route.ts`

**Step 1: Add Zod schema**

```typescript
export const availabilityInputSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
});
```

**Step 2: Apply validation**

**Step 3: Verify and commit**

---

### Task 1.6: Add Validation to Therapist Blocked Dates Route

**Files:**
- Modify: `src/lib/validation.ts`
- Modify: `src/app/api/(therapist)/therapist/blocked-dates/route.ts`

**Step 1: Add schema**

```typescript
export const blockedDateSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  reason: z.string().max(200).optional(),
});
```

**Step 2: Apply and commit**

---

### Task 1.7: Add Validation to Therapist Settings Route

**Files:**
- Modify: `src/lib/validation.ts`
- Modify: `src/app/api/(therapist)/therapist/settings/route.ts`

**Step 1: Add schema for settings update**

**Step 2: Apply and commit**

---

### Task 1.8: Secure ICS Download Endpoint

**Files:**
- Modify: `src/app/api/(public)/bookings/[id]/ics/route.ts`

**Step 1: Add email verification requirement**

The ICS endpoint should require an email query parameter that matches the booking's client email:

```typescript
// Add to GET handler:
const email = request.nextUrl.searchParams.get("email");
if (!email || booking.clientEmail.toLowerCase() !== email.toLowerCase()) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

**Step 2: Add rate limiting**

```typescript
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

const rateLimitKey = getRateLimitKey(request, "ics-download");
const rateLimit = checkRateLimit(rateLimitKey, { maxRequests: 10, windowMs: 60000 });
if (rateLimit.limited) {
  return NextResponse.json({ error: "Too many requests" }, { status: 429 });
}
```

**Step 3: Verify and commit**

---

### Task 1.9: Add Rate Limiting to Booking Lookup Endpoint

**Files:**
- Modify: `src/app/api/(public)/bookings/[id]/route.ts`

**Step 1: Add rate limiting to GET, PATCH, DELETE**

**Step 2: Verify and commit**

---

## Phase 2: Code Quality Quick Wins (Parallelizable)

### Task 2.1: Replace Local getDataSource with Shared Import

**Files:**
- Modify: All 38 API route files that define local `getDataSource()`

**Pattern:**
1. Remove local `async function getDataSource()` definition
2. Add `import { getDataSource } from "@/lib/db";`

**Files to modify:**
- `src/app/api/(admin)/admin/users/route.ts`
- `src/app/api/(admin)/admin/users/[id]/route.ts`
- `src/app/api/(admin)/admin/faqs/route.ts`
- `src/app/api/(admin)/admin/faqs/[id]/route.ts`
- `src/app/api/(admin)/admin/team-members/route.ts`
- `src/app/api/(admin)/admin/team-members/[id]/route.ts`
- `src/app/api/(admin)/admin/programs/route.ts`
- `src/app/api/(admin)/admin/programs/[id]/route.ts`
- `src/app/api/(admin)/admin/workshops/route.ts`
- `src/app/api/(admin)/admin/workshops/[id]/route.ts`
- `src/app/api/(admin)/admin/community-programs/route.ts`
- `src/app/api/(admin)/admin/community-programs/[id]/route.ts`
- `src/app/api/(admin)/admin/job-postings/route.ts`
- `src/app/api/(admin)/admin/job-postings/[id]/route.ts`
- `src/app/api/(admin)/admin/therapists/route.ts`
- `src/app/api/(admin)/admin/therapists/[id]/route.ts`
- `src/app/api/(admin)/admin/therapists/[id]/publish/route.ts`
- `src/app/api/(admin)/admin/therapists/[id]/unpublish/route.ts`
- `src/app/api/(admin)/admin/therapists/[id]/restore/route.ts`
- `src/app/api/(admin)/admin/therapists/archived/route.ts`
- `src/app/api/(admin)/admin/specializations/route.ts`
- `src/app/api/(admin)/admin/specializations/[id]/route.ts`
- `src/app/api/(public)/bookings/route.ts`
- `src/app/api/(public)/bookings/[id]/route.ts`
- `src/app/api/(public)/bookings/[id]/ics/route.ts`
- `src/app/api/(public)/therapists/[slug]/route.ts`
- `src/app/api/(public)/therapists/[slug]/availability/route.ts`
- `src/app/api/(public)/therapists/[slug]/slots/route.ts`
- `src/app/api/(public)/therapists/[slug]/session-types/route.ts`
- `src/app/api/(public)/team-members/route.ts`
- `src/app/api/(public)/team-members/[slug]/route.ts`
- `src/app/api/(public)/faqs/route.ts`
- `src/app/api/(therapist)/therapist/availability/route.ts`
- `src/app/api/(therapist)/therapist/availability/[id]/route.ts`
- `src/app/api/(therapist)/therapist/blocked-dates/route.ts`
- `src/app/api/(therapist)/therapist/blocked-dates/[id]/route.ts`
- `src/app/api/(therapist)/therapist/session-types/route.ts`
- `src/app/api/(therapist)/therapist/session-types/[id]/route.ts`
- `src/app/api/(therapist)/therapist/settings/route.ts`
- `src/app/api/(therapist)/therapist/bookings/[id]/status/route.ts`

---

### Task 2.2: Replace (session.user as any).role with Typed AuthSession

**Files:**
- Modify: All 58 API route files using `(session.user as any).role`

**Pattern:**
1. Add `import type { AuthSession } from "@/types/auth";`
2. Change `const session = await auth.api.getSession({ headers: request.headers });`
   to `const session = await auth.api.getSession({ headers: request.headers }) as AuthSession | null;`
3. Replace `(session.user as any).role` with `session.user.role`

---

### Task 2.3: Create Shared generateUniqueSlug Utility

**Files:**
- Create: `src/lib/slug.ts`
- Modify: `src/app/api/(admin)/admin/team-members/route.ts`
- Modify: `src/app/api/(admin)/admin/programs/route.ts`
- Modify: `src/app/api/(admin)/admin/workshops/route.ts`
- Modify: `src/app/api/(admin)/admin/community-programs/route.ts`

**Step 1: Create shared utility**

```typescript
// src/lib/slug.ts
import slugify from "slugify";
import type { Repository, ObjectLiteral } from "typeorm";

export async function generateUniqueSlug<T extends ObjectLiteral>(
  value: string,
  repo: Repository<T>,
  slugField: keyof T = "slug" as keyof T
): Promise<string> {
  const baseSlug = slugify(value, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  while (await repo.findOne({ where: { [slugField]: slug } as any })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
```

**Step 2: Replace local implementations in 4 files**

---

### Task 2.4: Move Inline Workshop Schema to validation.ts

**Files:**
- Modify: `src/lib/validation.ts`
- Modify: `src/app/api/(admin)/admin/workshops/route.ts`

---

## Phase 3: React Component Fixes (Future)

### Task 3.1: Fix key={index} Usages (15 files)

*To be implemented in future iteration*

### Task 3.2: Replace alert() with Toast Notifications (24 files)

*To be implemented in future iteration - requires toast library setup*

---

## Execution Notes

**Phase 1 Tasks (1.1-1.9):** Execute sequentially, each builds on previous
**Phase 2 Tasks (2.1-2.4):** Can be parallelized - each is independent

**Verification after each task:**
```bash
bun run build
```

**Final verification:**
```bash
bun run build && bun run lint
```
