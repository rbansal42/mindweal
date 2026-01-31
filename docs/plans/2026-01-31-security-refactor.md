# Security & Code Quality Refactor - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix critical security vulnerabilities and improve code quality across the Mindweal codebase.

**Architecture:** Multi-phase refactor addressing XSS, auth, rate limiting, validation, type safety, and database patterns. Each phase is independent and can be committed separately.

**Tech Stack:** DOMPurify (XSS), Zod (validation), TypeORM relations, Next.js security headers

---

## Phase 1: Critical Security Fixes

### Task 1: Install DOMPurify

**Files:**
- Modify: `package.json`

**Step 1:** Install DOMPurify and types
```bash
bun add isomorphic-dompurify
```

**Step 2:** Verify installation
```bash
bun run build
```

**Step 3:** Commit
```bash
git add package.json bun.lock
git commit -m "chore: add isomorphic-dompurify for XSS protection"
```

---

### Task 2: Create HTML sanitization utility

**Files:**
- Create: `src/lib/sanitize.ts`

**Step 1:** Create sanitization helper
```typescript
import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Use this for all user-generated HTML content before rendering.
 */
export function sanitizeHtml(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [
            "p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li",
            "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "code", "pre"
        ],
        ALLOWED_ATTR: ["href", "target", "rel"],
        ALLOW_DATA_ATTR: false,
    });
}
```

**Step 2:** Verify build
```bash
bun run build
```

**Step 3:** Commit
```bash
git add src/lib/sanitize.ts
git commit -m "feat: add HTML sanitization utility"
```

---

### Task 3: Fix XSS in workshops slug page

**Files:**
- Modify: `src/app/(public)/services/workshops/[slug]/page.tsx`

**Step 1:** Add import at top
```typescript
import { sanitizeHtml } from "@/lib/sanitize";
```

**Step 2:** Find line 145 and wrap content
```typescript
// Before:
dangerouslySetInnerHTML={{ __html: workshop.description }}

// After:
dangerouslySetInnerHTML={{ __html: sanitizeHtml(workshop.description) }}
```

---

### Task 4: Fix XSS in workshops listing page

**Files:**
- Modify: `src/app/(public)/services/workshops/page.tsx`

**Step 1:** Add import and wrap line 110

---

### Task 5: Fix XSS in community slug page

**Files:**
- Modify: `src/app/(public)/community/[slug]/page.tsx`

**Step 1:** Add import and wrap line 109

---

### Task 6: Fix XSS in programs listing page

**Files:**
- Modify: `src/app/(public)/services/programs/page.tsx`

**Step 1:** Add import and wrap line 91

---

### Task 7: Fix XSS in community listing page

**Files:**
- Modify: `src/app/(public)/community/page.tsx`

**Step 1:** Add import and wrap line 79

---

### Task 8: Fix XSS in FAQ accordion

**Files:**
- Modify: `src/app/(public)/faq/FAQAccordion.tsx`

**Step 1:** Add import and wrap line 56

---

### Task 9: Fix XSS in programs slug page

**Files:**
- Modify: `src/app/(public)/services/programs/[slug]/page.tsx`

**Step 1:** Add import and wrap line 113

**Step 2:** Verify all XSS fixes
```bash
bun run build
```

**Step 3:** Commit all XSS fixes
```bash
git add src/app/\(public\)/ src/lib/sanitize.ts
git commit -m "security: sanitize HTML content to prevent XSS attacks"
```

---

### Task 10: Add authentication to booking GET route

**Files:**
- Modify: `src/app/api/(public)/bookings/[id]/route.ts`

**Step 1:** Update GET handler to require booking ownership or auth

After line 27 (after `const { id } = await params;`), add:
```typescript
// Verify access - either authenticated or provide matching email
const headersList = await headers();
const session = await auth.api.getSession({ headers: headersList });

const url = new URL(request.url);
const emailParam = url.searchParams.get("email");

if (!session && !emailParam) {
    return NextResponse.json(
        { error: "Authentication required or provide email parameter" },
        { status: 401 }
    );
}
```

After finding booking (after the 404 check around line 46), add:
```typescript
// Verify ownership for unauthenticated requests
if (!session && emailParam !== booking.clientEmail) {
    return NextResponse.json(
        { error: "Email does not match booking" },
        { status: 403 }
    );
}
```

---

### Task 11: Add authentication to booking PATCH route

**Files:**
- Modify: `src/app/api/(public)/bookings/[id]/route.ts`
- Modify: `src/lib/validation.ts`

**Step 1:** Update rescheduleBookingSchema to include optional email
```typescript
export const rescheduleBookingSchema = z.object({
    startDatetime: z.string().datetime(),
    endDatetime: z.string().datetime(),
    timezone: z.string().optional(),
    bookingEmail: z.string().email().optional(), // For ownership verification
});
```

**Step 2:** Update PATCH handler after line 103:
```typescript
const headersList = await headers();
const session = await auth.api.getSession({ headers: headersList });

if (!session && !data.bookingEmail) {
    return NextResponse.json(
        { error: "Authentication required or provide bookingEmail" },
        { status: 401 }
    );
}
```

After finding booking, add:
```typescript
if (!session && data.bookingEmail !== booking.clientEmail) {
    return NextResponse.json(
        { error: "Email does not match booking" },
        { status: 403 }
    );
}
```

---

### Task 12: Add authentication to booking DELETE route

**Files:**
- Modify: `src/app/api/(public)/bookings/[id]/route.ts`
- Modify: `src/lib/validation.ts`

**Step 1:** Update cancelBookingSchema
```typescript
export const cancelBookingSchema = z.object({
    reason: z.string().min(1, "Please provide a reason for cancellation"),
    bookingEmail: z.string().email().optional(), // For ownership verification
});
```

**Step 2:** After finding booking in DELETE handler (around line 292), add ownership check:
```typescript
// Session is already fetched on line 312, move it earlier
const headersList = await headers();
const session = await auth.api.getSession({ headers: headersList });

if (!session) {
    const validatedBody = cancelBookingSchema.safeParse(body);
    const bookingEmail = validatedBody.success ? validatedBody.data.bookingEmail : undefined;
    
    if (!bookingEmail || bookingEmail !== booking.clientEmail) {
        return NextResponse.json(
            { error: "Provide bookingEmail matching the booking to cancel" },
            { status: 403 }
        );
    }
}
```

**Step 3:** Verify and commit
```bash
bun run build
git add src/app/api/\(public\)/bookings/ src/lib/validation.ts
git commit -m "security: add ownership verification to booking endpoints"
```

---

### Task 13: Create rate limiting utility

**Files:**
- Create: `src/lib/rate-limit.ts`

**Step 1:** Create in-memory rate limiter
```typescript
type RateLimitRecord = {
    count: number;
    resetTime: number;
};

const rateLimitStore = new Map<string, RateLimitRecord>();

interface RateLimitOptions {
    windowMs?: number;
    maxRequests?: number;
}

const defaults: Required<RateLimitOptions> = {
    windowMs: 60 * 1000,
    maxRequests: 10,
};

export function checkRateLimit(
    key: string,
    options: RateLimitOptions = {}
): { limited: boolean; retryAfter?: number; remaining?: number } {
    const { windowMs, maxRequests } = { ...defaults, ...options };
    const now = Date.now();

    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
        rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
        return { limited: false, remaining: maxRequests - 1 };
    }

    if (record.count >= maxRequests) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);
        return { limited: true, retryAfter };
    }

    record.count++;
    return { limited: false, remaining: maxRequests - record.count };
}

export function getRateLimitKey(request: Request, prefix: string): string {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";
    return `${prefix}:${ip}`;
}

// Cleanup old entries periodically
if (typeof setInterval !== "undefined") {
    setInterval(() => {
        const now = Date.now();
        for (const [key, record] of rateLimitStore.entries()) {
            if (now > record.resetTime) {
                rateLimitStore.delete(key);
            }
        }
    }, 5 * 60 * 1000);
}
```

**Step 2:** Verify and commit
```bash
bun run build
git add src/lib/rate-limit.ts
git commit -m "feat: add in-memory rate limiting utility"
```

---

### Task 14: Apply rate limiting to contact route

**Files:**
- Modify: `src/app/api/(public)/contact/route.ts`

**Step 1:** Add at top of file:
```typescript
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
```

**Step 2:** Add at start of POST handler:
```typescript
const rateLimitKey = getRateLimitKey(request, "contact");
const rateLimit = checkRateLimit(rateLimitKey, { maxRequests: 5 });

if (rateLimit.limited) {
    return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
    );
}
```

---

### Task 15: Apply rate limiting to application route

**Files:**
- Modify: `src/app/api/(public)/application/route.ts`

**Step 1:** Add same pattern with `maxRequests: 3`

---

### Task 16: Apply rate limiting to booking creation route

**Files:**
- Modify: `src/app/api/(public)/bookings/route.ts`

**Step 1:** Add same pattern with `maxRequests: 10`

**Step 2:** Verify and commit all rate limiting
```bash
bun run build
git add src/app/api/\(public\)/
git commit -m "security: add rate limiting to public form endpoints"
```

---

### Task 17: Add security headers

**Files:**
- Modify: `next.config.ts`

**Step 1:** Update config:
```typescript
import type { NextConfig } from "next";

const securityHeaders = [
    { key: "X-DNS-Prefetch-Control", value: "on" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
    serverExternalPackages: ["typeorm", "mysql2", "ical-generator"],
    async headers() {
        return [{ source: "/:path*", headers: securityHeaders }];
    },
};

export default nextConfig;
```

**Step 2:** Verify and commit
```bash
bun run build
git add next.config.ts
git commit -m "security: add HTTP security headers"
```

---

## Phase 2: Code Quality Improvements

### Task 18: Add missing Zod schemas

**Files:**
- Modify: `src/lib/validation.ts`

**Step 1:** Add at end of file:
```typescript
// Contact form schema
export const contactFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    subject: z.string().optional(),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

// Job application schema
export const jobApplicationSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    position: z.string().optional(),
    coverLetter: z.string().optional(),
});

export type JobApplicationInput = z.infer<typeof jobApplicationSchema>;

// Admin create user schema
export const createUserSchema = z.object({
    email: z.string().email("Invalid email address"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    role: z.enum(["client", "therapist", "admin", "reception"]),
    phone: z.string().optional(),
    timezone: z.string().default("Asia/Kolkata"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

**Step 2:** Verify and commit
```bash
bun run build
git add src/lib/validation.ts
git commit -m "feat: add Zod schemas for contact, application, user creation"
```

---

### Task 19: Apply Zod to contact route

**Files:**
- Modify: `src/app/api/(public)/contact/route.ts`

**Step 1:** Replace manual validation:
```typescript
import { contactFormSchema } from "@/lib/validation";

// Replace lines 10-25 with:
const body = await request.json();

const validated = contactFormSchema.safeParse(body);
if (!validated.success) {
    return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
    );
}

const { name, email, phone, subject, message } = validated.data;
```

---

### Task 20: Apply Zod to application route

**Files:**
- Modify: `src/app/api/(public)/application/route.ts`

**Step 1:** Replace manual validation with Zod pattern

---

### Task 21: Apply Zod to admin users route

**Files:**
- Modify: `src/app/api/(admin)/admin/users/route.ts`

**Step 1:** Import and use createUserSchema

**Step 2:** Verify and commit
```bash
bun run build
git add src/app/api/
git commit -m "refactor: use Zod validation in contact, application, users routes"
```

---

### Task 22: Create typed session interface

**Files:**
- Create: `src/types/auth.ts`

**Step 1:** Create types:
```typescript
import type { UserRole } from "@/entities/User";

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    phone?: string | null;
    timezone: string;
    emailVerified?: Date | null;
    image?: string | null;
    therapistId?: string | null;
}

export interface AuthSession {
    user: AuthUser;
    session: {
        id: string;
        userId: string;
        expiresAt: Date;
    };
}
```

**Step 2:** Verify and commit
```bash
bun run build
git add src/types/
git commit -m "feat: add typed AuthSession interface"
```

---

### Task 23: Add file validation to application route

**Files:**
- Modify: `src/app/api/(public)/application/route.ts`

**Step 1:** Add validation constants after imports:
```typescript
const ALLOWED_RESUME_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_RESUME_SIZE = 5 * 1024 * 1024; // 5MB
```

**Step 2:** Add validation before file processing:
```typescript
if (resume) {
    if (!ALLOWED_RESUME_TYPES.includes(resume.type)) {
        return NextResponse.json(
            { error: "Invalid file type. Please upload PDF or Word document." },
            { status: 400 }
        );
    }

    if (resume.size > MAX_RESUME_SIZE) {
        return NextResponse.json(
            { error: "File too large. Maximum size is 5MB." },
            { status: 400 }
        );
    }
}
```

**Step 3:** Verify and commit
```bash
bun run build
git add src/app/api/\(public\)/application/route.ts
git commit -m "security: add file validation to job application upload"
```

---

### Task 24: Export getDataSource from db.ts

**Files:**
- Modify: `src/lib/db.ts`

**Step 1:** Add at end of file:
```typescript
/**
 * Get initialized DataSource. Use this in API routes instead of
 * defining a local getDataSource function.
 */
export async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}
```

**Step 2:** Verify and commit
```bash
bun run build
git add src/lib/db.ts
git commit -m "feat: export getDataSource helper from db.ts"
```

---

### Task 25: Remove duplicated getDataSource from all routes

**Files to modify:** All API route files with local getDataSource

**Pattern:**
1. Remove local `async function getDataSource() { ... }` definition
2. Update import: `import { getDataSource } from "@/lib/db";`

**Files list:**
- `src/app/api/(admin)/admin/users/route.ts`
- `src/app/api/(admin)/admin/users/[id]/route.ts`
- `src/app/api/(admin)/admin/therapists/route.ts`
- `src/app/api/(admin)/admin/therapists/[id]/route.ts`
- `src/app/api/(admin)/admin/therapists/archived/route.ts`
- `src/app/api/(admin)/admin/therapists/[id]/publish/route.ts`
- `src/app/api/(admin)/admin/therapists/[id]/unpublish/route.ts`
- `src/app/api/(admin)/admin/therapists/[id]/restore/route.ts`
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
- `src/app/api/(admin)/admin/specializations/route.ts`
- `src/app/api/(admin)/admin/specializations/[id]/route.ts`
- `src/app/api/(public)/bookings/route.ts`
- `src/app/api/(public)/bookings/[id]/route.ts`
- `src/app/api/(public)/faqs/route.ts`
- `src/app/api/(public)/team-members/route.ts`
- `src/app/api/(public)/team-members/[slug]/route.ts`
- `src/app/api/(public)/therapists/[slug]/route.ts`
- `src/app/api/(public)/therapists/[slug]/session-types/route.ts`
- `src/app/api/(therapist)/therapist/availability/route.ts`
- `src/app/api/(therapist)/therapist/availability/[id]/route.ts`
- `src/app/api/(therapist)/therapist/blocked-dates/route.ts`
- `src/app/api/(therapist)/therapist/blocked-dates/[id]/route.ts`
- `src/app/api/(therapist)/therapist/bookings/[id]/status/route.ts`
- `src/app/api/(therapist)/therapist/session-types/route.ts`
- `src/app/api/(therapist)/therapist/session-types/[id]/route.ts`
- `src/app/api/(therapist)/therapist/settings/route.ts`

**Step 1:** Update all files (can be done with search/replace)

**Step 2:** Verify and commit
```bash
bun run build
git add src/app/api/
git commit -m "refactor: use shared getDataSource from lib/db.ts"
```

---

## Phase 3: Frontend Patterns

### Task 26: Fix TimeSlotPicker key prop

**Files:**
- Modify: `src/components/booking/TimeSlotPicker.tsx`

**Step 1:** Change line 52 from `key={index}` to use unique slot identifier:
```typescript
key={slot.start.toISOString()}
```

**Step 2:** Verify and commit
```bash
bun run build
git add src/components/booking/TimeSlotPicker.tsx
git commit -m "fix: use unique key instead of index in TimeSlotPicker"
```

---

### Task 27: Search for other key={index} usage

**Step 1:** Search codebase
```bash
grep -r "key={index}" src/ --include="*.tsx"
```

**Step 2:** Fix any other occurrences found

---

### Task 28: Check for alert() usage and replace with console or toast

**Step 1:** Search for alert usage
```bash
grep -r "alert(" src/ --include="*.tsx" --include="*.ts"
```

**Step 2:** Replace with appropriate error handling

**Step 3:** Commit
```bash
git commit -m "fix: replace alert() with proper error handling"
```

---

## Phase 4: Database Refactor

### Task 29: Create migration to rename tables

**Files:**
- Create: `migrations/TIMESTAMP-RenameTablesForConsistency.ts`

**Step 1:** Create migration:
```bash
bun run migration:create migrations/RenameTablesForConsistency
```

**Step 2:** Edit migration:
```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameTablesForConsistency1738300000000 implements MigrationInterface {
    name = "RenameTablesForConsistency1738300000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if tables need renaming (they might already be correct)
        const tables = await queryRunner.query(`SHOW TABLES`);
        const tableNames = tables.map((t: any) => Object.values(t)[0]);

        if (tableNames.includes("specialization")) {
            await queryRunner.query(`RENAME TABLE specialization TO specializations`);
        }

        if (tableNames.includes("therapist")) {
            await queryRunner.query(`RENAME TABLE therapist TO therapists`);
        }

        if (tableNames.includes("therapist_availability")) {
            await queryRunner.query(`RENAME TABLE therapist_availability TO therapist_availabilities`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`RENAME TABLE specializations TO specialization`);
        await queryRunner.query(`RENAME TABLE therapists TO therapist`);
        await queryRunner.query(`RENAME TABLE therapist_availabilities TO therapist_availability`);
    }
}
```

**Step 3:** Run migration
```bash
bun run migration:run
```

**Step 4:** Commit
```bash
git add migrations/
git commit -m "fix: rename database tables to follow plural convention"
```

---

### Task 30: Fix TherapistAvailability entity table name

**Files:**
- Modify: `src/entities/TherapistAvailability.ts`

**Step 1:** Update entity decorator:
```typescript
@Entity("therapist_availabilities")  // was "therapist_availability"
```

**Step 2:** Verify and commit
```bash
bun run build
git add src/entities/TherapistAvailability.ts
git commit -m "fix: update TherapistAvailability entity table name"
```

---

### Task 31: Add TypeORM relations to User entity

**Files:**
- Modify: `src/entities/User.ts`

**Step 1:** Add relation to Therapist:
```typescript
import { OneToOne, JoinColumn } from "typeorm";
import { Therapist } from "./Therapist";

// Add after therapistId column:
@OneToOne(() => Therapist, { nullable: true })
@JoinColumn({ name: "therapistId" })
therapist?: Therapist;
```

---

### Task 32: Add TypeORM relations to Therapist entity

**Files:**
- Modify: `src/entities/Therapist.ts`

**Step 1:** Add imports and relations:
```typescript
import { OneToOne, OneToMany, ManyToMany, JoinTable, JoinColumn } from "typeorm";
import { User } from "./User";
import { TherapistAvailability } from "./TherapistAvailability";
import { BlockedDate } from "./BlockedDate";
import { SessionType } from "./SessionType";
import { Booking } from "./Booking";
import { Specialization } from "./Specialization";

// Add relations:
@OneToOne(() => User, user => user.therapist, { nullable: true })
@JoinColumn({ name: "userId" })
user?: User;

@OneToMany(() => TherapistAvailability, availability => availability.therapist)
availabilities?: TherapistAvailability[];

@OneToMany(() => BlockedDate, blockedDate => blockedDate.therapist)
blockedDates?: BlockedDate[];

@OneToMany(() => SessionType, sessionType => sessionType.therapist)
sessionTypes?: SessionType[];

@OneToMany(() => Booking, booking => booking.therapist)
bookings?: Booking[];

@ManyToMany(() => Specialization)
@JoinTable({
    name: "therapist_specializations",
    joinColumn: { name: "therapistId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "specializationId", referencedColumnName: "id" },
})
specializations?: Specialization[];
```

Note: This requires a new join table migration for specializations (replacing simple-array).

---

### Task 33: Add TypeORM relations to Booking entity

**Files:**
- Modify: `src/entities/Booking.ts`

**Step 1:** Add imports and relations:
```typescript
import { ManyToOne, JoinColumn } from "typeorm";
import { Therapist } from "./Therapist";
import { User } from "./User";
import { SessionType } from "./SessionType";

// Add relations:
@ManyToOne(() => Therapist, therapist => therapist.bookings)
@JoinColumn({ name: "therapistId" })
therapist?: Therapist;

@ManyToOne(() => User, { nullable: true })
@JoinColumn({ name: "clientId" })
client?: User;

@ManyToOne(() => SessionType, { nullable: true })
@JoinColumn({ name: "sessionTypeId" })
sessionType?: SessionType;
```

---

### Task 34: Add TypeORM relations to remaining entities

**Files to modify:**
- `src/entities/TherapistAvailability.ts` - add ManyToOne to Therapist
- `src/entities/BlockedDate.ts` - add ManyToOne to Therapist
- `src/entities/SessionType.ts` - add ManyToOne to Therapist, OneToMany to Booking

**Pattern for each:**
```typescript
@ManyToOne(() => Therapist, therapist => therapist.availabilities)
@JoinColumn({ name: "therapistId" })
therapist?: Therapist;
```

---

### Task 35: Create migration for therapist_specializations join table

**Files:**
- Create: `migrations/TIMESTAMP-CreateTherapistSpecializationsJoinTable.ts`

**Step 1:** Create migration for join table (replacing simple-array approach)

**Step 2:** Migrate existing data from specializationIds column

**Step 3:** Drop old column

---

### Task 36: Verify all relations and build

**Step 1:** Run full build
```bash
bun run build
```

**Step 2:** Commit all relation changes
```bash
git add src/entities/ migrations/
git commit -m "feat: add TypeORM relations to all entities"
```

---

## Phase 5: Documentation

### Task 37: Update AGENTS.md with new guidelines

**Files:**
- Modify: `AGENTS.md`

**Step 1:** Add new section after "Error Handling":

```markdown
## Security Requirements

### HTML Sanitization
- **ALWAYS** sanitize user-generated HTML before rendering
- Use `sanitizeHtml()` from `@/lib/sanitize` for any `dangerouslySetInnerHTML`
- Never trust content from database without sanitization

### API Route Security Checklist
- [ ] Authentication: Use `auth.api.getSession()` or `getServerSession()`
- [ ] Authorization: Check user role matches required access level
- [ ] Validation: Use Zod schemas from `@/lib/validation.ts`
- [ ] Rate limiting: Apply to public form endpoints
- [ ] Ownership: Verify user owns the resource they're modifying

### File Upload Validation
- Validate file type against whitelist
- Enforce maximum file size
- Sanitize filenames to prevent path traversal

## API Routes Pattern (Updated)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/db";  // Use shared helper
import { someSchema } from "@/lib/validation";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import type { AuthSession } from "@/types/auth";

export async function POST(request: NextRequest) {
    try {
        // 1. Rate limiting (for public routes)
        const rateLimitKey = getRateLimitKey(request, "endpoint-name");
        const rateLimit = checkRateLimit(rateLimitKey, { maxRequests: 10 });
        if (rateLimit.limited) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
            );
        }

        // 2. Auth check (typed session)
        const session = await auth.api.getSession({ headers: request.headers }) as AuthSession | null;
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 3. Role check (no more 'as any')
        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 4. Input validation with Zod
        const body = await request.json();
        const validated = someSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validated.error.flatten() },
                { status: 400 }
            );
        }

        // 5. Business logic
        const ds = await getDataSource();
        // ...
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
```

## TypeORM Entity Relations

Use proper TypeORM decorators for relationships:

```typescript
import { ManyToOne, OneToMany, JoinColumn } from "typeorm";

@Entity("bookings")
export class Booking {
    @Column({ type: "varchar", length: 36 })
    therapistId!: string;

    // Add relation decorator
    @ManyToOne(() => Therapist, therapist => therapist.bookings)
    @JoinColumn({ name: "therapistId" })
    therapist?: Therapist;
}
```

### Relation Guidelines
- Always keep the FK column (`therapistId`) for direct access
- Add relation property as optional (`therapist?`)
- Use `@JoinColumn` to specify the FK column name
- For bidirectional relations, reference the inverse property

## React Component Patterns

### List Rendering
- **NEVER** use `key={index}` - always use unique identifiers
- Use `key={item.id}` or `key={item.someUniqueValue.toString()}`

### Error Handling
- Don't use `alert()` for errors
- Use toast notifications or inline error messages
- Log errors with context: `console.error("Context:", error)`
```

**Step 2:** Commit
```bash
git add AGENTS.md
git commit -m "docs: add security and code quality guidelines to AGENTS.md"
```

---

## Verification

### Final Verification Steps

1. Run full build:
```bash
bun run build
```

2. Run linter:
```bash
bun run lint
```

3. Test key functionality:
- Create a booking
- View booking details
- Contact form submission
- Admin user creation

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1-17 | Security: XSS, auth, rate limiting, headers |
| 2 | 18-25 | Code quality: Zod, types, file validation, DRY |
| 3 | 26-28 | Frontend: key props, error handling |
| 4 | 29-36 | Database: table names, TypeORM relations |
| 5 | 37 | Documentation: AGENTS.md updates |
