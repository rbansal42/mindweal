# Blog Feature Design

**Date:** 2026-02-01  
**Goal:** Add a mixed-purpose blog section to MindWeal with full admin panel integration  
**Architecture:** New BlogPost entity, admin CRUD pages, public listing/detail pages  
**Tech Stack:** TypeORM, Next.js App Router, Tiptap, UploadThing, Zod validation

---

## Overview

Add a blog feature to support three primary content types:
- **Educational content** - Mental health tips, wellness guides, coping strategies
- **Thought leadership** - Professional articles establishing expertise
- **Practice updates** - News, announcements, new services

**Key Requirements:**
- Admin-only authoring (can attribute to team members)
- Categories + flexible tags for organization
- Full SEO control (custom meta title/description)
- Featured posts with manual ordering
- Auto-related posts by category
- Consistent with existing content patterns (Program, Workshop, etc.)

---

## 1. Database Schema

### BlogPost Entity (`src/entities/BlogPost.ts`)

```typescript
@Entity("blog_posts")
export class BlogPost {
  // Core fields (standard pattern)
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  slug!: string;

  @Column({ type: "enum", enum: ["draft", "published"], default: "draft" })
  status!: "draft" | "published";

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Content fields
  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text", nullable: true })
  excerpt!: string | null;

  @Column({ type: "text" })
  content!: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  coverImage!: string | null;

  // Organization
  @Column({ 
    type: "enum", 
    enum: ["wellness-tips", "practice-news", "professional-insights", "resources"] 
  })
  category!: "wellness-tips" | "practice-news" | "professional-insights" | "resources";

  @Column({ type: "json", nullable: true })
  tags!: string[] | null;

  // Featured/Ordering
  @Column({ default: false })
  isFeatured!: boolean;

  @Column({ type: "int", nullable: true })
  featuredOrder!: number | null;

  // Attribution
  @Column({ type: "uuid", nullable: true })
  authorId!: string | null;

  @ManyToOne(() => TeamMember, { nullable: true })
  @JoinColumn({ name: "authorId" })
  author!: TeamMember | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  authorName!: string | null;

  // SEO
  @Column({ type: "varchar", length: 255, nullable: true })
  metaTitle!: string | null;

  @Column({ type: "text", nullable: true })
  metaDescription!: string | null;

  // Publishing
  @Column({ type: "datetime", nullable: true })
  publishedAt!: Date | null;
}
```

**Table Name:** `blog_posts`

**Indexes:**
- Primary key on `id`
- Unique index on `slug`
- Index on `status`
- Index on `category`
- Index on `publishedAt`
- Index on `isFeatured`

---

## 2. Admin Panel Integration

### Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/admin/blog` | `page.tsx` (client) | List all posts with filters |
| `/admin/blog/new` | `page.tsx` (client) | Create new post form |
| `/admin/blog/[id]/edit` | `page.tsx` (client) | Edit existing post form |

### List Page (`/admin/blog/page.tsx`)

**Features:**
- Status filter (all/draft/published)
- Category filter dropdown
- Search by title
- Table columns: Title, Category, Author, Status, Published Date, Actions
- Actions: Edit, Toggle Active, Delete (soft)

**Uses:** `ContentTable` component

### Form Pages (`BlogForm.tsx`)

**Component Props:**
```typescript
interface BlogFormProps {
  initialData?: BlogPost;
  mode: "create" | "edit";
}
```

**Form Fields:**

| Section | Fields |
|---------|--------|
| **Basic Info** | Title, Slug (auto-generated, editable), Category dropdown |
| **Content** | Rich text editor (Tiptap), Excerpt textarea |
| **Media** | Cover image uploader (UploadThing) |
| **Organization** | Tags input (comma-separated), Category dropdown |
| **Attribution** | Author dropdown (TeamMembers) + fallback text field |
| **SEO** | Meta title (max 60), Meta description (max 160) |
| **Featured** | Featured toggle, Featured order (number input, shown when featured=true) |
| **Status** | Draft/Published toggle |

**Uses:** 
- `ContentForm` wrapper component
- `RichTextEditor` component
- `ImageUploader` component
- `react-hook-form` + `zodResolver`

### API Routes

**`/api/admin/blog/route.ts`:**
```typescript
GET  - List posts (optional ?status=draft&category=wellness-tips)
POST - Create post (auto-generate slug, validate)
```

**`/api/admin/blog/[id]/route.ts`:**
```typescript
GET    - Fetch single post
PUT    - Update post (handle publishedAt on first publish)
DELETE - Soft delete (set isActive=false)
```

**Auth/Security:**
- Session check with `auth.api.getSession()`
- Role check: `session.user.role === "admin"`
- Zod validation on create/update

---

## 3. Public Blog Pages

### Routes

| Route | Type | Purpose |
|-------|------|---------|
| `/blog` | Server Component | Blog homepage |
| `/blog/[slug]` | Server Component | Post detail page |
| `/blog/category/[category]` | Server Component | Category filtered list |

### Blog Homepage (`/blog/page.tsx`)

**Layout:**
1. **Hero section** - Title: "Blog", Description about mental health content
2. **Featured posts section** (if any):
   - Query: `isFeatured=true, status=published, isActive=true`
   - Order: `featuredOrder ASC`
   - Display: Card grid with cover image, title, excerpt, category badge
3. **Recent posts section**:
   - Query: `status=published, isActive=true`
   - Order: `publishedAt DESC`
   - Display: Grid with cover, title, excerpt, author, date, category
4. **Category filters** (optional client component):
   - Chips for each category
   - Client-side filtering or link to category pages

**Metadata:**
```typescript
title: "Blog | MindWeal by Pihu Suri"
description: "Mental health insights, wellness tips, and practice updates"
```

### Post Detail Page (`/blog/[slug]/page.tsx`)

**Layout:**
1. Cover image (full-width hero)
2. Post header:
   - Title
   - Author (photo + name if TeamMember linked, else authorName)
   - Publish date
   - Category badge
3. Content (sanitized HTML)
4. Related posts section:
   - Query: same category, published, active, exclude current
   - Limit: 3 posts
   - Order: `publishedAt DESC`

**SEO (`generateMetadata`):**
```typescript
title: post.metaTitle || post.title
description: post.metaDescription || post.excerpt || stripHtml(post.content, 160)
openGraph: { images: [post.coverImage] }
```

**Static Generation:**
```typescript
export async function generateStaticParams() {
  // Return slugs for all published posts
}
```

### Category Page (`/blog/category/[category]/page.tsx`)

**Layout:**
1. Category header (name + icon/color per category)
2. Filtered post grid (same as homepage recent posts)

**Query:** `category={category}, status=published, isActive=true`

**Metadata:**
```typescript
title: "{CategoryLabel} | Blog | MindWeal by Pihu Suri"
```

---

## 4. Validation Schema

**Location:** `/src/lib/validation.ts`

```typescript
export const createBlogPostSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).optional(), // Auto-generated if not provided
  category: z.enum(["wellness-tips", "practice-news", "professional-insights", "resources"]),
  content: z.string().min(1),
  excerpt: z.string().max(500).optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  tags: z.array(z.string().max(30)).max(10).optional().nullable(),
  authorId: z.string().uuid().optional().nullable(),
  authorName: z.string().max(255).optional().nullable(),
  metaTitle: z.string().max(60).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  isFeatured: z.boolean().default(false),
  featuredOrder: z.number().int().positive().optional().nullable(),
  status: z.enum(["draft", "published"]).default("draft"),
});

export const updateBlogPostSchema = createBlogPostSchema.partial();
export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;
```

---

## 5. Data Flow & Business Logic

### Slug Generation
- Auto-generate from title using `/src/lib/slug.ts` (`slugify` library)
- Allow manual override in admin form
- Ensure uniqueness: check for existing slug, append number if duplicate

### Published At Handling
```typescript
if (status === "published" && !existingPost.publishedAt) {
  publishedAt = new Date();
}
// Keep original publishedAt if already published before
```

### Related Posts Query
```typescript
const related = await repo.find({
  where: { 
    category: currentPost.category,
    status: "published",
    isActive: true,
    id: Not(currentPost.id)
  },
  order: { publishedAt: "DESC" },
  take: 3
});
```

### Featured Posts Query
```typescript
const featured = await repo.find({
  where: { 
    isFeatured: true,
    status: "published",
    isActive: true
  },
  order: { featuredOrder: "ASC", publishedAt: "DESC" },
});
```

### Entity Serialization
Convert TypeORM entities to plain objects before passing to Client Components:
```typescript
const plainPosts = posts.map(post => ({
  id: post.id,
  title: post.title,
  slug: post.slug,
  // ... other fields
}));
```

---

## 6. Categories Configuration

**Category Enum Values:**

| Value | Label | Description |
|-------|-------|-------------|
| `wellness-tips` | "Wellness Tips" | Mental health tips, coping strategies, self-care |
| `practice-news` | "Practice News" | Updates, announcements, new services |
| `professional-insights` | "Professional Insights" | Expert articles, research, thought leadership |
| `resources` | "Resources" | Guides, toolkits, educational materials |

**Category Metadata (in config or constants):**
```typescript
export const BLOG_CATEGORIES = {
  "wellness-tips": { 
    label: "Wellness Tips", 
    color: "var(--primary-teal)" 
  },
  "practice-news": { 
    label: "Practice News", 
    color: "var(--secondary-green)" 
  },
  "professional-insights": { 
    label: "Professional Insights", 
    color: "var(--secondary-violet)" 
  },
  "resources": { 
    label: "Resources", 
    color: "var(--accent-green)" 
  },
};
```

---

## 7. Error Handling & Security

### Security
- Admin routes: require `role === "admin"`
- Public routes: only show `status: "published" AND isActive: true`
- Sanitize HTML content with `/src/lib/sanitize.ts` before rendering
- Validate file uploads via UploadThing (existing configuration)

### Error Responses
- 401: Unauthorized (no session)
- 403: Forbidden (not admin)
- 404: Post not found
- 409: Slug conflict (duplicate slug)
- 500: Server error

### Validation Errors
Return Zod validation errors with field-level details:
```typescript
if (!validated.success) {
  return NextResponse.json(
    { error: "Validation failed", details: validated.error.flatten() },
    { status: 400 }
  );
}
```

---

## 8. Migration Considerations

**Create Migration:** `bun run migration:create migrations/CreateBlogPosts`

**Migration Tasks:**
1. Create `blog_posts` table with all columns
2. Add indexes (slug, status, category, publishedAt, isFeatured)
3. Add foreign key constraint to `team_members` (authorId)

**No Data Backfill:** This is a new feature (no existing data)

---

## 9. Implementation Phases

### Phase 1: Backend Foundation
- Create BlogPost entity
- Create database migration
- Create validation schemas
- Create API routes (admin CRUD)

### Phase 2: Admin Panel
- Create list page with filters
- Create form component (reusing existing components)
- Create new/edit pages
- Test CRUD operations

### Phase 3: Public Pages
- Create blog homepage
- Create post detail page
- Create category page
- Implement related posts
- Add SEO metadata

### Phase 4: Polish
- Add to main navigation
- Test entity serialization
- Run build verification
- Create sample blog posts for testing

---

## 10. Testing Checklist

**Admin Panel:**
- [ ] Create draft post
- [ ] Publish post (verify publishedAt set)
- [ ] Edit published post (verify publishedAt unchanged)
- [ ] Add/remove tags
- [ ] Upload cover image
- [ ] Set featured post with order
- [ ] Soft delete post
- [ ] Filter by status/category
- [ ] Search by title
- [ ] Slug auto-generation and uniqueness

**Public Pages:**
- [ ] Homepage shows featured + recent posts
- [ ] Featured posts ordered correctly
- [ ] Category filtering works
- [ ] Post detail displays all content
- [ ] Related posts show (same category)
- [ ] Author attribution displays correctly
- [ ] SEO metadata present
- [ ] Cover images display
- [ ] HTML sanitization working

**Security:**
- [ ] Non-admin cannot access admin routes
- [ ] Public only sees published + active posts
- [ ] XSS protection via sanitization

---

## 11. Open Questions

None - design is complete and validated.

---

## 12. Future Enhancements (Out of Scope)

- Comments system
- Post views/analytics
- Newsletter integration
- Social sharing
- Full-text search
- Tag management page
- Therapist authoring capability
- Post scheduling
- Post revisions/history
