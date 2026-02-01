# AGENTS.md - Mindweal by Pihu Suri

Guidelines for AI coding agents working in this repository.

## Quick Reference

```bash
# Development (run from project root)
bun install              # Install dependencies
bun run dev              # Dev server with Turbopack (port 4242)
bun run build            # Production build - ALWAYS RUN AFTER CHANGES
bun run lint             # ESLint check

# Database (run from project root)
docker-compose up -d     # Start MySQL container (port 3307)

# Migrations (run from project root)
bun run migration:create migrations/MigrationName  # Create new migration
bun run migration:run                               # Run pending migrations
bun run migration:revert                            # Revert last migration
```

## Critical Rules

1. **ALWAYS run `bun run build`** after making any changes to verify the build succeeds
2. **NO fixes without root cause investigation first** - understand before you fix
3. **If 3+ fixes fail**, question the architecture before attempting fix #4
4. **Use "Mindweal by Pihu Suri"** in branding - never just "Mindweal"

## Git Workflow - Atomic Commits

Make **atomic commits** - each commit should be a single, focused change:

- One logical change per commit (e.g., "add entity", "add API route", "add page")
- Commit should be buildable and not break the app
- Write clear commit messages: `type: description` (e.g., `feat: add Program entity`)

**Commit types:** `feat`, `fix`, `refactor`, `docs`, `chore`, `style`

**Example workflow for a new feature:**
```bash
git commit -m "feat: add Workshop entity"
git commit -m "feat: add Workshop admin API routes"
git commit -m "feat: add Workshop admin pages"
git commit -m "feat: add public Workshop listing page"
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16, React 19, TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Database | MySQL 8.0 via TypeORM |
| Auth | Better Auth (email/password, Google OAuth) |
| Forms | react-hook-form + zod validation |
| Rich Text | Tiptap editor |
| Uploads | UploadThing |
| Runtime | Bun 1.3.6 |

## Project Structure

```
mindweal/
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (portals)/     # Route groups (admin/, client/, therapist/)
│   │   ├── api/           # API routes ((admin)/, (public)/, (therapist)/)
│   │   └── auth/          # Auth pages
│   ├── components/        # Reusable components
│   ├── entities/          # TypeORM entities
│   ├── lib/               # Utilities (auth.ts, db.ts, validation.ts)
│   ├── templates/         # React Email templates
│   └── config.ts          # Centralized configuration
├── migrations/            # TypeORM migrations
├── scripts/               # Utility scripts
├── docs/plans/            # Design documents
├── init/                  # Database init SQL
├── package.json
└── docker-compose.yml     # MySQL container
```

## Code Style

### TypeScript
- Strict mode enabled - no `any` types without justification
- Use path alias `@/*` for imports (maps to `./src/*`)
- Export types with schemas: `export type X = z.infer<typeof xSchema>`

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `BookingForm.tsx` |
| Functions | camelCase | `getTherapists()` |
| Pages | `page.tsx` | `app/about/page.tsx` |
| API routes | `route.ts` | `app/api/bookings/route.ts` |
| Entities | PascalCase singular | `Therapist.ts` |
| DB tables | snake_case plural | `therapist_availabilities` |

### Import Order
```typescript
// 1. React/Next imports
import { NextRequest, NextResponse } from "next/server";
// 2. Third-party libraries
import { z } from "zod";
// 3. Internal imports (use @/ alias)
import { auth } from "@/lib/auth";
import { Program } from "@/entities/Program";
```

### React Components
- Server components are default (no directive needed) - prefer these
- Client components require `"use client";` directive at top

### API Routes Pattern
```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AppDataSource } from "@/lib/db";

async function getDataSource() {
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();
  return AppDataSource;
}

export async function GET(request: NextRequest) {
  try {
    // 1. Auth check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2. Role check
    if ((session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. Business logic
    const ds = await getDataSource();
    const data = await ds.getRepository(Entity).find();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

### TypeORM Entities
```typescript
@Entity("table_name")  // snake_case, plural
export class EntityName {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "enum", enum: ["draft", "published"], default: "draft" })
  status!: "draft" | "published";

  @Column({ default: true })
  isActive!: boolean;  // For soft delete

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
```

### Error Handling
- Always wrap API logic in try/catch
- Log errors with `console.error("Context:", error)`
- Return appropriate HTTP status codes (401, 403, 404, 500)
- Validate input with zod schemas before processing

---

## Security Requirements

### HTML Sanitization
- **ALWAYS** sanitize user-generated HTML before rendering with `dangerouslySetInnerHTML`
- Use `sanitizeHtml()` from `@/lib/sanitize` for any HTML content from database
- Never trust content from database or user input without sanitization

```typescript
import { sanitizeHtml } from "@/lib/sanitize";

// Always sanitize HTML content
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
```

### API Route Security Checklist

For every new API route, verify:
- [ ] **Authentication**: Use `auth.api.getSession()` or `getServerSession()`
- [ ] **Authorization**: Check user role matches required access level
- [ ] **Validation**: Use Zod schemas from `@/lib/validation.ts` - never manual validation
- [ ] **Rate Limiting**: Apply to public form endpoints using `@/lib/rate-limit.ts`
- [ ] **Ownership**: Verify user owns the resource they're modifying

### File Upload Validation
When handling file uploads:
- Validate file type against whitelist (don't trust `Content-Type` header alone)
- Enforce maximum file size
- Sanitize filenames to prevent path traversal
- Use UploadThing for general uploads (already configured with auth)

```typescript
const ALLOWED_TYPES = ["application/pdf", "application/msword"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
}
if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
}
```

---

## API Routes Pattern (Updated)

Use this pattern for all new API routes:

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
        const session = await auth.api.getSession({ 
            headers: request.headers 
        }) as AuthSession | null;
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
        // ... repository operations
        
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
```

### Key Changes from Old Pattern
1. **Use `getDataSource()` from `@/lib/db`** - Don't define local helper functions
2. **Use typed `AuthSession`** from `@/types/auth` - Avoid `(session.user as any).role`
3. **Always use Zod schemas** - Define in `@/lib/validation.ts`, never inline validation
4. **Apply rate limiting** to public endpoints

---

## React Component Patterns

### List Rendering
- **NEVER** use `key={index}` for lists - always use unique identifiers
- Use `key={item.id}` or `key={uniqueValue.toString()}` 

```typescript
// BAD - causes issues with reordering/updates
{items.map((item, index) => <Item key={index} />)}

// GOOD - stable unique key
{items.map((item) => <Item key={item.id} />)}
{slots.map((slot) => <Slot key={new Date(slot.start).toISOString()} />)}
```

### Error Handling in Components
- Don't use `alert()` for errors
- Use toast notifications or inline error messages
- Log errors with context: `console.error("Context:", error)`

## Brand Colors (No Purple!)

- Primary Teal: `#00A99D` / Dark: `#008B82`
- Secondary Green: `#4A9E6B`
- Accent Green: `#10B981`

## Key Files

| File | Purpose |
|------|---------|
| `src/config.ts` | App configuration |
| `src/lib/auth.ts` | Better Auth server config |
| `src/lib/auth-client.ts` | Client-side auth hooks |
| `src/lib/db.ts` | TypeORM DataSource |
| `src/lib/validation.ts` | Zod schemas |
| `data-source.ts` | TypeORM CLI config |

## Content Status Pattern

All content entities use dual status:
- `status: "draft" | "published"` - editorial workflow
- `isActive: boolean` - soft delete flag
- Public visibility requires: `status = "published" AND isActive = true`

---

## Systematic Debugging

**The Iron Law: NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST**

### Phase 1: Root Cause Investigation
1. **Read error messages carefully** - don't skip past them
2. **Reproduce consistently** - can you trigger it reliably?
3. **Check recent changes** - git diff, recent commits
4. **Trace data flow** - where does the bad value originate?

### Phase 2: Pattern Analysis
1. Find working examples in the codebase
2. Compare against references
3. Identify differences between working and broken

### Phase 3: Hypothesis and Testing
1. Form single hypothesis: "I think X is the root cause because Y"
2. Make the SMALLEST possible change to test
3. One variable at a time - don't fix multiple things at once

### Phase 4: Implementation
1. Create failing test case first (if applicable)
2. Implement single fix addressing root cause
3. Verify fix works
4. **If 3+ fixes failed: STOP and question the architecture**

### Red Flags - STOP and Follow Process
- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "I don't fully understand but this might work"
- Proposing solutions before tracing data flow

---

## Verification Before Completion

**The Iron Law: NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE**

### Before Claiming Success
1. **IDENTIFY**: What command proves this claim?
2. **RUN**: Execute the FULL command (fresh, complete)
3. **READ**: Full output, check exit code
4. **VERIFY**: Does output confirm the claim?
5. **ONLY THEN**: Make the claim with evidence

### Verification Requirements
| Claim | Requires |
|-------|----------|
| "Tests pass" | Test command output showing 0 failures |
| "Build succeeds" | `bun run build` exit code 0 |
| "Bug fixed" | Original symptom no longer occurs |
| "Linter clean" | `bun run lint` output: 0 errors |

### Red Flags
- Using "should", "probably", "seems to"
- Expressing satisfaction before verification
- About to commit without running build
- Relying on partial verification

---

## Brainstorming Ideas Into Designs

**Use BEFORE any creative work** - creating features, building components, adding functionality.

### The Process

**1. Understanding the idea:**
- Check current project state first (files, docs, recent commits)
- Ask questions ONE AT A TIME to refine the idea
- Prefer multiple choice questions when possible
- Focus on: purpose, constraints, success criteria

**2. Exploring approaches:**
- Propose 2-3 different approaches with trade-offs
- Lead with recommended option and explain why

**3. Presenting the design:**
- Present in sections of 200-300 words
- Ask after each section: "Does this look right so far?"
- Cover: architecture, components, data flow, error handling

**4. After the design:**
- Write validated design to `docs/plans/YYYY-MM-DD-<topic>-design.md`
- Commit the design document
- Ask: "Ready to set up for implementation?"

### Key Principles
- **One question at a time** - Don't overwhelm
- **YAGNI ruthlessly** - Remove unnecessary features
- **Explore alternatives** - Always propose 2-3 approaches
- **Incremental validation** - Present design in sections

---

## Writing Implementation Plans

**Use when you have a spec or requirements for a multi-step task, BEFORE touching code.**

### Plan Document Header
```markdown
# [Feature Name] Implementation Plan

**Goal:** [One sentence describing what this builds]
**Architecture:** [2-3 sentences about approach]
**Tech Stack:** [Key technologies/libraries]
```

### Task Structure (Bite-Sized - 2-5 minutes each)
```markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.ts`
- Modify: `exact/path/to/existing.ts`
- Test: `tests/exact/path/to/test.ts`

**Step 1:** Write the failing test
**Step 2:** Run test to verify it fails
**Step 3:** Write minimal implementation
**Step 4:** Run test to verify it passes
**Step 5:** Commit
```

### Remember
- Exact file paths always
- Complete code in plan (not "add validation")
- Exact commands with expected output
- DRY, YAGNI, TDD, frequent commits

**Save plans to:** `docs/plans/YYYY-MM-DD-<feature-name>.md`

---

## Executing Plans

**Use when you have a written implementation plan to execute.**

### The Process

1. **Load and Review Plan** - Read plan, identify concerns, create TodoWrite
2. **Execute Batch** - Default: first 3 tasks, mark in_progress → completed
3. **Report** - Show what was implemented, verification output, "Ready for feedback"
4. **Continue** - Apply feedback, execute next batch
5. **Complete** - Use finishing-a-development-branch skill

### When to Stop and Ask
- Hit a blocker mid-batch
- Plan has critical gaps
- You don't understand an instruction
- Verification fails repeatedly

**Don't force through blockers - stop and ask.**

---

## Using Git Worktrees

**Use when starting feature work that needs isolation from current workspace.**

### Directory Priority
1. Check if `.worktrees/` exists (preferred)
2. Check if `worktrees/` exists
3. Check AGENTS.md for preference
4. Ask user

### Creation Steps
```bash
# Create worktree with new branch
git worktree add .worktrees/<branch-name> -b <branch-name>
cd .worktrees/<branch-name>

# Run project setup
bun install

# Verify clean baseline
bun run build
```

### Safety Verification
**MUST verify directory is ignored before creating:**
```bash
git check-ignore -q .worktrees
```

If NOT ignored: Add to .gitignore and commit first.

---

## Finishing a Development Branch

**Use when implementation is complete and all tests pass.**

### The Process

1. **Verify Tests** - Run `bun run build` - if fails, stop and fix
2. **Determine Base Branch** - Usually `main`
3. **Present Options:**
   ```
   1. Merge back to main locally
   2. Push and create a Pull Request
   3. Keep the branch as-is (I'll handle it later)
   4. Discard this work
   ```
4. **Execute Choice**
5. **Cleanup Worktree** (for options 1, 2, 4)

### Option Actions
| Option | Merge | Push | Keep Worktree | Cleanup Branch |
|--------|-------|------|---------------|----------------|
| 1. Merge locally | ✓ | - | - | ✓ |
| 2. Create PR | - | ✓ | ✓ | - |
| 3. Keep as-is | - | - | ✓ | - |
| 4. Discard | - | - | - | ✓ (force) |

### Red Flags
- **Never** proceed with failing tests
- **Never** merge without verifying tests on result
- **Never** delete work without confirmation
- **Always** get typed "discard" confirmation for Option 4
