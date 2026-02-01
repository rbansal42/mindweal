# Build Time Optimization - Implementation Plan

**Date:** 2026-02-01  
**Design:** [2026-02-01-build-time-optimization-design.md](./2026-02-01-build-time-optimization-design.md)

---

## Overview

This plan implements build time optimization in 6 phases, each deliverable as a separate PR for safe incremental deployment.

**Total files to modify:** 24 files  
**Execution:** Parallel agents where possible

---

## Phase 1: Foundation - FAQ Page ISR

**Goal:** Prove ISR pattern works with existing API

### Files to Modify (1)

**Page:**
- `src/app/(public)/faq/page.tsx`

### Changes

#### `src/app/(public)/faq/page.tsx`

**Step 1:** Remove `force-dynamic`
```typescript
// DELETE THIS LINE
export const dynamic = "force-dynamic";
```

**Step 2:** Convert `getFAQs()` function from direct DB to fetch
```typescript
// BEFORE
async function getFAQs() {
    const ds = await getDataSource();
    const faqRepo = ds.getRepository(FAQ);
    const faqs = await faqRepo.find({
        where: { isActive: true },
        order: { category: "ASC", displayOrder: "ASC" },
    });
    return faqs;
}

// AFTER
async function getFAQs() {
    const res = await fetch(`${appConfig.url}/api/faqs`, {
        next: { revalidate: 300 } // 5 minutes
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.faqs || [];
}
```

**Step 3:** Add import
```typescript
import { appConfig } from "@/config";
```

### Verification

```bash
# Build should pass
bun run build

# Visit http://localhost:4242/faq
# Verify FAQs display correctly
```

### Expected Build Output Change
```diff
- ƒ /faq    (force-dynamic)
+ ○ /faq    (ISR, revalidates every 300s)
```

---

## Phase 2: Blog System ISR

**Goal:** Implement complete blog ISR pattern

### Files to Modify (6)

**API Routes (3 new):**
- `src/app/api/(public)/blog/route.ts`
- `src/app/api/(public)/blog/[slug]/route.ts`
- `src/app/api/(public)/blog/category/[category]/route.ts`

**Pages (3):**
- `src/app/(public)/blog/page.tsx`
- `src/app/(public)/blog/[slug]/page.tsx`
- `src/app/(public)/blog/category/[category]/page.tsx`

### Task Breakdown

#### Task 2.1: Create Blog List API

**File:** `src/app/api/(public)/blog/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { BlogPost } from "@/entities/BlogPost";

export async function GET(request: NextRequest) {
    try {
        const ds = await getDataSource();
        const blogRepo = ds.getRepository(BlogPost);

        const [featured, recent] = await Promise.all([
            blogRepo.find({
                where: {
                    status: "published",
                    isActive: true,
                    isFeatured: true,
                },
                order: { featuredOrder: "ASC", publishedAt: "DESC" },
                take: 3,
            }),
            blogRepo.find({
                where: {
                    status: "published",
                    isActive: true,
                },
                order: { publishedAt: "DESC" },
                take: 12,
            }),
        ]);

        return NextResponse.json({ 
            success: true, 
            featured: featured.map(serializePost),
            recent: recent.map(serializePost)
        });
    } catch (error) {
        console.error("Error fetching blog posts:", error);
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}

function serializePost(post: BlogPost) {
    return {
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.coverImage,
        category: post.category,
        tags: post.tags,
        isFeatured: post.isFeatured,
        authorName: post.authorName,
        publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
        createdAt: post.createdAt.toISOString(),
    };
}
```

#### Task 2.2: Create Blog Detail API

**File:** `src/app/api/(public)/blog/[slug]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { Not } from "typeorm";
import { getDataSource } from "@/lib/db";
import { BlogPost } from "@/entities/BlogPost";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const ds = await getDataSource();
        const repo = ds.getRepository(BlogPost);

        const post = await repo.findOne({
            where: { slug, status: "published", isActive: true },
            relations: ["author"],
        });

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        // Get related posts
        const related = await repo.find({
            where: {
                category: post.category,
                status: "published",
                isActive: true,
                id: Not(post.id),
            },
            order: { publishedAt: "DESC" },
            take: 3,
        });

        return NextResponse.json({
            success: true,
            post: serializePost(post),
            related: related.map(serializeRelated),
        });
    } catch (error) {
        console.error("Error fetching blog post:", error);
        return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
    }
}

function serializePost(post: BlogPost) {
    return {
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.coverImage,
        category: post.category,
        tags: post.tags,
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        author: post.author ? {
            name: post.author.name,
            photoUrl: post.author.photoUrl,
        } : null,
        authorName: post.authorName,
        publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
        createdAt: post.createdAt.toISOString(),
    };
}

function serializeRelated(post: BlogPost) {
    return {
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        category: post.category,
    };
}
```

#### Task 2.3: Create Blog Category API

**File:** `src/app/api/(public)/blog/category/[category]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { BlogPost } from "@/entities/BlogPost";

type BlogCategory = "wellness-tips" | "practice-news" | "professional-insights" | "resources";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ category: string }> }
) {
    try {
        const { category } = await params;
        
        const validCategories: BlogCategory[] = ["wellness-tips", "practice-news", "professional-insights", "resources"];
        if (!validCategories.includes(category as BlogCategory)) {
            return NextResponse.json({ error: "Invalid category" }, { status: 400 });
        }

        const ds = await getDataSource();
        const repo = ds.getRepository(BlogPost);

        const posts = await repo.find({
            where: {
                category: category as BlogCategory,
                status: "published",
                isActive: true,
            },
            order: { publishedAt: "DESC" },
        });

        return NextResponse.json({
            success: true,
            posts: posts.map(serializePost),
            category,
        });
    } catch (error) {
        console.error("Error fetching blog posts by category:", error);
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}

function serializePost(post: BlogPost) {
    return {
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        category: post.category,
        tags: post.tags,
        authorName: post.authorName,
        publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
        createdAt: post.createdAt.toISOString(),
    };
}
```

#### Task 2.4: Convert Blog List Page to ISR

**File:** `src/app/(public)/blog/page.tsx`

Changes:
1. Remove `export const dynamic = "force-dynamic";`
2. Remove `serializeBlogPost` function (handled by API)
3. Update `getBlogPosts()` to use fetch:

```typescript
async function getBlogPosts() {
    const res = await fetch(`${appConfig.url}/api/blog`, {
        next: { revalidate: 60 }
    });
    if (!res.ok) return { featured: [], recent: [] };
    const data = await res.json();
    return {
        featured: data.featured || [],
        recent: data.recent || [],
    };
}
```

4. Add import: `import { appConfig } from "@/config";`
5. Remove imports: `getDataSource`, `BlogPost`

#### Task 2.5: Convert Blog Detail Page to ISR

**File:** `src/app/(public)/blog/[slug]/page.tsx`

Changes:
1. Remove `export const dynamic = "force-dynamic";`
2. Update `getBlogPost()` and `getRelatedPosts()` to single fetch:

```typescript
async function getBlogData(slug: string) {
    const res = await fetch(`${appConfig.url}/api/blog/${slug}`, {
        next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
}
```

3. Update component to use new data structure:

```typescript
export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params;
    const data = await getBlogData(slug);

    if (!data || !data.post) {
        notFound();
    }

    const { post, related } = data;
    // ... rest of component
}
```

4. Remove serialization logic (handled by API)
5. Update `generateMetadata` to use new fetch

#### Task 2.6: Convert Blog Category Page to ISR

**File:** `src/app/(public)/blog/category/[category]/page.tsx`

Changes:
1. Remove `export const dynamic = "force-dynamic";`
2. Update `getBlogPostsByCategory()` to use fetch:

```typescript
async function getBlogPostsByCategory(category: string) {
    const res = await fetch(`${appConfig.url}/api/blog/category/${category}`, {
        next: { revalidate: 60 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.posts || [];
}
```

3. Remove serialization logic
4. Add import: `import { appConfig } from "@/config";`

### Verification

```bash
bun run build
# Check for blog routes showing ISR instead of force-dynamic

# Manual testing:
# - Visit /blog
# - Visit /blog/welcome-to-mindweals-blog
# - Visit /blog/category/wellness-tips
```

---

## Phase 3: Programs ISR

**Goal:** Optimize programs pages and remove build-time generation

### Files to Modify (4)

**API Routes (2 new):**
- `src/app/api/(public)/programs/route.ts`
- `src/app/api/(public)/programs/[slug]/route.ts`

**Pages (2):**
- `src/app/(public)/services/programs/page.tsx`
- `src/app/(public)/services/programs/[slug]/page.tsx`

### Task Breakdown

#### Task 3.1: Create Programs List API

**File:** `src/app/api/(public)/programs/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Program } from "@/entities/Program";

export async function GET(request: NextRequest) {
    try {
        const ds = await getDataSource();
        const repo = ds.getRepository(Program);

        const programs = await repo.find({
            where: { status: "published", isActive: true },
            order: { displayOrder: "ASC", title: "ASC" },
        });

        return NextResponse.json({
            success: true,
            programs: programs.map(p => ({
                id: p.id,
                slug: p.slug,
                title: p.title,
                description: p.description,
                category: p.category,
                imageUrl: p.imageUrl,
                duration: p.duration,
                format: p.format,
                price: p.price,
            })),
        });
    } catch (error) {
        console.error("Error fetching programs:", error);
        return NextResponse.json({ error: "Failed to fetch programs" }, { status: 500 });
    }
}
```

#### Task 3.2: Create Program Detail API

**File:** `src/app/api/(public)/programs/[slug]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Program } from "@/entities/Program";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const ds = await getDataSource();
        const repo = ds.getRepository(Program);

        const program = await repo.findOne({
            where: { slug, status: "published", isActive: true },
        });

        if (!program) {
            return NextResponse.json({ error: "Program not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            program: {
                id: program.id,
                slug: program.slug,
                title: program.title,
                description: program.description,
                category: program.category,
                targetAudience: program.targetAudience,
                objectives: program.objectives,
                curriculum: program.curriculum,
                methodology: program.methodology,
                benefits: program.benefits,
                prerequisites: program.prerequisites,
                imageUrl: program.imageUrl,
                duration: program.duration,
                format: program.format,
                schedule: program.schedule,
                price: program.price,
                nextStartDate: program.nextStartDate,
                enrollmentDeadline: program.enrollmentDeadline,
                maxParticipants: program.maxParticipants,
                facilitators: program.facilitators,
                contactEmail: program.contactEmail,
                metaTitle: program.metaTitle,
                metaDescription: program.metaDescription,
            },
        });
    } catch (error) {
        console.error("Error fetching program:", error);
        return NextResponse.json({ error: "Failed to fetch program" }, { status: 500 });
    }
}
```

#### Task 3.3: Convert Programs List Page to ISR

**File:** `src/app/(public)/services/programs/page.tsx`

Changes:
1. Remove `export const dynamic = "force-dynamic";`
2. Update `getPrograms()` to fetch:

```typescript
async function getPrograms() {
    const res = await fetch(`${appConfig.url}/api/programs`, {
        next: { revalidate: 300 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.programs || [];
}
```

#### Task 3.4: Convert Program Detail Page to ISR

**File:** `src/app/(public)/services/programs/[slug]/page.tsx`

Changes:
1. **REMOVE** `export const dynamic = "force-dynamic";`
2. **REMOVE** `generateStaticParams` function (entire function)
3. **REMOVE** `getAllProgramSlugs` function
4. Update `getProgram()` to fetch:

```typescript
async function getProgram(slug: string) {
    const res = await fetch(`${appConfig.url}/api/programs/${slug}`, {
        next: { revalidate: 300 }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.program || null;
}
```

---

## Phase 4: Workshops ISR

**Goal:** Optimize workshops pages and remove build-time generation

### Files to Modify (4)

**API Routes (2 new):**
- `src/app/api/(public)/workshops/route.ts`
- `src/app/api/(public)/workshops/[slug]/route.ts`

**Pages (2):**
- `src/app/(public)/services/workshops/page.tsx`
- `src/app/(public)/services/workshops/[slug]/page.tsx`

### Task Breakdown

#### Task 4.1: Create Workshops List API

**File:** `src/app/api/(public)/workshops/route.ts`

Similar to programs list API, but for Workshop entity.

#### Task 4.2: Create Workshop Detail API

**File:** `src/app/api/(public)/workshops/[slug]/route.ts`

Similar to program detail API, but for Workshop entity.

#### Task 4.3: Convert Workshops List Page to ISR

**File:** `src/app/(public)/services/workshops/page.tsx`

Same pattern as programs list page.

#### Task 4.4: Convert Workshop Detail Page to ISR

**File:** `src/app/(public)/services/workshops/[slug]/page.tsx`

Changes:
1. **REMOVE** `export const dynamic = "force-dynamic";`
2. **REMOVE** `generateStaticParams` function
3. Convert to fetch pattern with `revalidate: 300`

---

## Phase 5: Community Programs ISR

**Goal:** Optimize community pages and remove build-time generation

### Files to Modify (4)

**API Routes (2 new):**
- `src/app/api/(public)/community-programs/route.ts`
- `src/app/api/(public)/community-programs/[slug]/route.ts`

**Pages (2):**
- `src/app/(public)/community/page.tsx`
- `src/app/(public)/community/[slug]/page.tsx`

### Task Breakdown

Same pattern as Programs/Workshops phases.

**Critical:** REMOVE `generateStaticParams` from detail page.

---

## Phase 6: Therapists & Job Postings ISR

**Goal:** Optimize therapists and job postings pages

### Files to Modify (5)

**API Routes (2 new):**
- `src/app/api/(public)/therapists/route.ts`
- `src/app/api/(public)/job-postings/route.ts`

**Pages (3):**
- `src/app/(public)/therapists/page.tsx`
- `src/app/(public)/therapists/[slug]/page.tsx`
- `src/app/(public)/join-us/page.tsx`

### Task Breakdown

#### Task 6.1: Create Therapists List API

**File:** `src/app/api/(public)/therapists/route.ts`

Replicate logic from `/therapists/page.tsx` - fetch therapists with specializations.

#### Task 6.2: Create Job Postings API

**File:** `src/app/api/(public)/job-postings/route.ts`

Fetch active job postings.

#### Task 6.3-6.5: Convert Pages to ISR

Same pattern as previous phases, `revalidate: 60` for therapists.

---

## Execution Strategy

### Parallel Agent Dispatch

**Phase 2 (Blog) - Can parallelize into 3 agents:**
- Agent 1: Tasks 2.1 + 2.4 (List API + Page)
- Agent 2: Tasks 2.2 + 2.5 (Detail API + Page)
- Agent 3: Tasks 2.3 + 2.6 (Category API + Page)

**Phase 3 (Programs) - Can parallelize into 2 agents:**
- Agent 1: Tasks 3.1 + 3.3 (List API + Page)
- Agent 2: Tasks 3.2 + 3.4 (Detail API + Page)

**Phase 4 (Workshops) - Can parallelize into 2 agents:**
- Agent 1: Tasks 4.1 + 4.3 (List API + Page)
- Agent 2: Tasks 4.2 + 4.4 (Detail API + Page)

**Phase 5 (Community) - Can parallelize into 2 agents:**
- Agent 1: List API + Page
- Agent 2: Detail API + Page

**Phase 6 (Therapists + Jobs) - Can parallelize into 3 agents:**
- Agent 1: Therapists API + Pages
- Agent 2: Job Postings API + Page

---

## Verification Checklist (Per Phase)

### Build Verification
```bash
bun run build
# Check output - no ● (SSG) markers, only ƒ or ○
```

### Manual Testing
- [ ] Visit page in browser
- [ ] Verify content renders correctly
- [ ] Check Network tab - fetch should be cached
- [ ] Refresh page - should be instant (cache hit)
- [ ] Check SEO metadata in page source

### Code Review
- [ ] No direct DB imports in pages
- [ ] All fetch calls have `next: { revalidate: N }`
- [ ] Error handling present
- [ ] Serialization removes TypeORM classes

---

## Commit Strategy

**Per Phase:**
1. Commit after creating all API routes
2. Commit after converting all pages
3. Push branch
4. Open PR
5. Review & merge
6. Verify production

**Example commit messages:**
```
Phase 2: Add blog public API routes

- Create /api/blog (list + featured)
- Create /api/blog/[slug] (detail + related)
- Create /api/blog/category/[category]
```

```
Phase 2: Convert blog pages to ISR pattern

- Remove force-dynamic from blog pages
- Use fetch with revalidate: 60
- Remove generateStaticParams from detail page
```

---

## Rollback Plan

If issues arise, revert the specific phase PR:
1. GitHub UI: "Revert" button on merged PR
2. Deploy reverted main branch
3. Estimated rollback time: 5 minutes

---

## Success Criteria

**Per Phase:**
- ✅ Build passes
- ✅ All pages render correctly
- ✅ No console errors
- ✅ Performance equal or better

**Overall (After Phase 6):**
- ✅ Build time < 50 seconds (target: 30-40s)
- ✅ Zero database queries at build time
- ✅ All content pages use ISR
- ✅ No regressions in functionality
