# Build Time Optimization - Design Document

**Date:** 2026-02-01  
**Author:** AI Assistant  
**Status:** Implementation  
**Goal:** Reduce build time from 80+ seconds to ~30-40 seconds

---

## Problem Statement

Current build time exceeds 80 seconds on build servers, primarily due to:

1. **Build-time static generation** - 3 pages use `generateStaticParams` which queries database at build time
2. **Excessive `force-dynamic` usage** - 46 pages marked as `force-dynamic`, preventing any caching
3. **Unnecessary database queries** - Content pages fetch fresh data on every request despite infrequent updates

---

## Analysis

### Current State

| Rendering Type | Count | Issue |
|----------------|-------|-------|
| `generateStaticParams` (SSG) | 3 | Database queries at build time |
| `force-dynamic` | 46 | No caching, server load on every request |
| ISR (revalidate via fetch) | 2 | ✓ Good - team pages already optimized |
| Static | ~15 | ✓ Good - correctly pre-rendered |

### Pages Using `generateStaticParams`

These query the database at build time, generating static pages for every item:

1. `/services/programs/[slug]` - All programs pre-generated
2. `/services/workshops/[slug]` - All workshops pre-generated
3. `/community/[slug]` - All community programs pre-generated

**Impact:** If 10 programs + 10 workshops + 10 community programs exist, that's **30 database queries + 30 page generations** at build time.

### Pages Using `force-dynamic` That Could Use ISR

Content pages that change infrequently:

| Page Group | Pages | Update Frequency |
|------------|-------|------------------|
| Blog | 3 | ~Weekly |
| Therapists | 2 | ~Monthly |
| Programs | 2 | ~Monthly |
| Workshops | 2 | ~Monthly |
| Community | 2 | ~Monthly |
| Join-us | 1 | ~Monthly |
| FAQ | 1 | ~Monthly |

**Total optimization candidates:** 13 pages

---

## Solution Architecture

### Phase 1: Remove Build-Time Static Generation

**Change:** Remove `generateStaticParams` from 3 dynamic routes

**Benefit:**
- Zero database connections at build time
- Pages generate on-demand (first request after deploy)
- `fallback: true` allows new items to appear without rebuild

**Trade-off:**
- First visitor to new page waits for generation (~200ms)
- Acceptable for infrequently-created content

---

### Phase 2: Implement ISR Pattern for Public Content

**Pattern:** Replace direct database access with fetch-based ISR

**Before (current):**
```typescript
export const dynamic = "force-dynamic";

async function getData() {
    const ds = await getDataSource();
    return ds.getRepository(Entity).find({...});
}
```

**After (ISR):**
```typescript
// No dynamic export

async function getData() {
    const res = await fetch(`${appConfig.url}/api/endpoint`, {
        next: { revalidate: 60 } // Cache for 60 seconds
    });
    if (!res.ok) return null;
    return res.json();
}
```

**Benefits:**
- Pages cached for revalidate period (60-300s)
- Reduced database load
- Faster page loads (serve from cache)
- Auto-regeneration when cache expires

**Revalidation Strategy:**

| Content Type | Revalidate | Reason |
|--------------|------------|--------|
| Blog, Therapists | 60s | Moderately dynamic |
| Programs, Workshops, Community, FAQ, Jobs | 300s | Rarely change |

---

### Phase 3: Create Public API Routes

To enable ISR pattern, we need public API endpoints for pages currently using direct DB access.

**New Routes Required:**

```
/api/blog                          # List published posts + featured
/api/blog/[slug]                   # Single post + related
/api/blog/category/[category]      # Posts by category
/api/therapists                    # List published therapists
/api/programs                      # List published programs
/api/programs/[slug]               # Single program
/api/workshops                     # List published workshops
/api/workshops/[slug]              # Single workshop
/api/community-programs            # List published programs
/api/community-programs/[slug]     # Single community program
/api/job-postings                  # List active job postings
```

**Existing Routes (no changes needed):**
- `/api/faqs` ✓
- `/api/team-members` ✓
- `/api/team-members/[slug]` ✓
- `/api/therapists/[slug]` ✓

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      BUILD TIME                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  BEFORE:                                                      │
│  ┌─────────────┐  generateStaticParams  ┌──────────┐        │
│  │ Next Build  │ ───────────────────────▶│ Database │        │
│  └─────────────┘  (30+ queries)          └──────────┘        │
│                                                               │
│  AFTER:                                                       │
│  ┌─────────────┐                                             │
│  │ Next Build  │  (No DB queries)                            │
│  └─────────────┘                                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     RUNTIME                                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Request                                                      │
│     │                                                         │
│     ▼                                                         │
│  ┌──────────┐  ISR (revalidate: 60/300s)                    │
│  │   Page   │◀─────────────────────────────┐                │
│  └──────────┘                                │                │
│     │                                        │                │
│     │ fetch                         ┌───────┴─────┐          │
│     │                               │    Cache    │          │
│     ▼                               │  (in-memory)│          │
│  ┌──────────┐                       └─────────────┘          │
│  │ API Route│                                                │
│  └──────────┘                                                │
│     │                                                         │
│     │ If cache miss/stale                                    │
│     ▼                                                         │
│  ┌──────────┐                                                │
│  │ Database │                                                │
│  └──────────┘                                                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Foundation - FAQ (Low Risk)

**Why first:** FAQ already has public API, minimal changes

- Remove `force-dynamic` from `/faq/page.tsx`
- Convert to fetch with `revalidate: 300`

**Risk:** Low  
**Files:** 1 page

---

### Phase 2: Blog System (New Feature)

**Why second:** Blog is new feature, no existing user dependencies

- Create blog API routes (3 files)
- Convert blog pages to ISR (3 files)

**Risk:** Low  
**Files:** 6 (3 API + 3 pages)

---

### Phase 3: Programs & Workshops (Medium Risk)

**Why third:** Active content, moderate traffic

Programs:
- Create API routes (2 files)
- Remove `generateStaticParams` from detail page
- Convert to ISR (2 pages)

Workshops:
- Create API routes (2 files)
- Remove `generateStaticParams` from detail page
- Convert to ISR (2 pages)

**Risk:** Medium  
**Files:** 8 (4 API + 4 pages)

---

### Phase 4: Community Programs (Medium Risk)

- Create API routes (2 files)
- Remove `generateStaticParams` from detail page
- Convert to ISR (2 pages)

**Risk:** Medium  
**Files:** 4 (2 API + 2 pages)

---

### Phase 5: Therapists (Higher Risk)

**Why last:** Core user journey, high traffic

- Create therapists list API
- Convert therapist pages to ISR (2 pages)

**Risk:** Medium-High (booking flow dependency)  
**Files:** 3 (1 API + 2 pages)

---

### Phase 6: Job Postings (Low Risk)

- Create job postings API
- Convert `/join-us` page to ISR

**Risk:** Low  
**Files:** 2 (1 API + 1 page)

---

## Expected Results

### Build Time Improvement

| Metric | Before | After (Est.) |
|--------|--------|--------------|
| Build time | 80+ seconds | 30-40 seconds |
| Database queries at build | ~30+ | 0 |
| Static page generation | 30+ pages | 0 (on-demand) |

### Runtime Performance

| Metric | Before | After |
|--------|--------|-------|
| Blog page load (cached) | - | Instant (cache hit) |
| Therapists page load (cached) | - | Instant (cache hit) |
| Database queries per page | 1+ | 0 (if cached) |
| Server load | High (every request) | Low (cache serves) |

### Content Freshness

| Content | Max Staleness | Acceptable? |
|---------|---------------|-------------|
| Blog | 60s | ✓ Yes |
| Therapists | 60s | ✓ Yes |
| Programs/Workshops | 300s (5min) | ✓ Yes |
| FAQ | 300s | ✓ Yes |
| Job Postings | 300s | ✓ Yes |

---

## Edge Cases & Considerations

### 1. First Request After Deploy

**Scenario:** New deploy, no cached pages

**Behavior:** First visitor waits for page generation (~200ms)

**Mitigation:** Acceptable for low-traffic periods. Could add post-deploy cache warming if needed.

---

### 2. Content Updates Not Appearing

**Scenario:** Admin updates content, but users see old version for up to 300s

**Behavior:** ISR cache serves stale content until revalidation

**Mitigation:**
- Document cache behavior for admins
- Consider On-Demand Revalidation for critical updates (future enhancement)
- 60-300s staleness is acceptable for content types identified

---

### 3. Database Unavailable During Build

**Scenario:** Database connection fails (already handled in current code)

**Behavior:** Build completes successfully, pages generate on-demand

**Status:** ✓ Already handled - all `generateStaticParams` have try/catch

---

### 4. New Items Added (e.g., New Blog Post)

**Scenario:** Admin creates new blog post with slug `/blog/new-post`

**Behavior with SSG:** Requires rebuild to appear  
**Behavior with ISR + No SSG:** Accessible immediately, generates on first request

**Benefit:** ISR is better UX - new content appears without deploy

---

## Verification Plan

### Build Time Measurement

```bash
# Before optimization
time bun run build

# After each phase
time bun run build
```

### Functionality Testing

**Per phase:**
1. Visit page in browser
2. Verify content renders correctly
3. Check browser DevTools Network tab for fetch timing
4. Refresh page - should be instant (cache hit)
5. Wait for revalidate period + refresh - should show updated content

### Regression Testing

**Critical paths to verify:**
- Therapist booking flow (must not break)
- Admin content editing (must still work)
- SEO metadata generation (must be preserved)

---

## Rollback Plan

If issues arise in production:

1. **Revert PR** - Use GitHub UI to revert merge commit
2. **Deploy main** - CI/CD auto-deploys reverted code
3. **Estimated rollback time:** ~5 minutes

**Low risk due to:**
- Phased implementation with PR per phase
- Each phase tested independently
- No schema changes
- No breaking API changes

---

## Success Criteria

### Must Have
- ✅ Build time < 50 seconds (down from 80+)
- ✅ All pages render correctly
- ✅ No regression in booking flow
- ✅ Admin editing works normally

### Nice to Have
- ✅ Build time < 40 seconds
- ✅ Page load performance improved (cache hits)
- ✅ Reduced database load (fewer queries)

---

## Future Enhancements (Out of Scope)

1. **On-Demand Revalidation** - Allow admins to manually clear cache after updates
2. **Cache Warming** - Pre-warm cache for popular pages after deploy
3. **Progressive Revalidation** - Stale-while-revalidate pattern
4. **Edge Caching** - CDN-level caching for static assets

---

## References

- [Next.js ISR Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)
- [Next.js generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
- [Team Page ISR Implementation](../../../src/app/(public)/team/page.tsx) - Existing reference

---

## Approval

**Ready for implementation:** Yes  
**Phased approach:** 6 phases  
**Parallel execution:** Yes (API routes can be created in parallel)
