# Remove Strapi Integration - Replace with Admin Panel

## Overview

Remove Strapi CMS integration and replace with database-backed admin panel for content management.

## Current State

- Strapi backend exists with 5 content types but is **not actively used**
- Frontend pages show placeholder/hardcoded data with "will be replaced with Strapi data" comments
- Local TypeORM database already handles operational data (Users, Bookings, Therapists, etc.)

## Design Decisions

| Decision | Choice |
|----------|--------|
| Content storage | MySQL database via TypeORM entities |
| Status workflow | Draft/Published + isActive toggle |
| Image uploads | Uploadthing |
| Rich text editor | Tiptap (WYSIWYG) |
| Delete behavior | Soft delete (sets isActive: false) |

## Database Entities

Add to `src/entities/`:

### Program.ts
```typescript
@Entity("programs")
export class Program {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column("text")
  description: string; // HTML from Tiptap

  @Column()
  duration: string;

  @Column({ nullable: true })
  coverImage: string; // Uploadthing URL

  @Column("json", { nullable: true })
  benefits: string[]; // Array of benefit strings

  @Column({ type: "enum", enum: ["draft", "published"], default: "draft" })
  status: "draft" | "published";

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Workshop.ts
```typescript
@Entity("workshops")
export class Workshop {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column("text")
  description: string;

  @Column()
  date: Date;

  @Column()
  duration: string;

  @Column({ default: 20 })
  capacity: number;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ type: "enum", enum: ["draft", "published"], default: "draft" })
  status: "draft" | "published";

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### CommunityProgram.ts
```typescript
@Entity("community_programs")
export class CommunityProgram {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column("text")
  description: string;

  @Column()
  schedule: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ type: "enum", enum: ["draft", "published"], default: "draft" })
  status: "draft" | "published";

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### JobPosting.ts
```typescript
@Entity("job_postings")
export class JobPosting {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  department: string;

  @Column("text")
  description: string;

  @Column("text", { nullable: true })
  requirements: string;

  @Column()
  location: string;

  @Column({ type: "enum", enum: ["full-time", "part-time", "contract"], default: "full-time" })
  type: "full-time" | "part-time" | "contract";

  @Column({ type: "enum", enum: ["draft", "published"], default: "draft" })
  status: "draft" | "published";

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## Admin Panel Routes

```
src/app/(portals)/admin/
├── programs/
│   ├── page.tsx              # List all programs
│   ├── new/page.tsx          # Create program
│   └── [id]/edit/page.tsx    # Edit program
├── workshops/
│   ├── page.tsx
│   ├── new/page.tsx
│   └── [id]/edit/page.tsx
├── community-programs/
│   ├── page.tsx
│   ├── new/page.tsx
│   └── [id]/edit/page.tsx
└── job-postings/
    ├── page.tsx
    ├── new/page.tsx
    └── [id]/edit/page.tsx
```

### List Page Features
- Table with title, status, isActive, last updated
- Quick isActive toggle
- Edit/Delete actions
- Filter by status (All/Draft/Published)
- "New" button

### Form Page Features
- Title field (auto-generates slug)
- Tiptap rich text editor
- Uploadthing image uploader
- Type-specific fields
- Status dropdown
- isActive toggle
- Save/Cancel buttons

## API Routes

### Admin APIs (protected, admin role required)

```
src/app/api/admin/
├── programs/
│   ├── route.ts              # GET (list), POST (create)
│   └── [id]/route.ts         # GET, PUT, DELETE (soft)
├── workshops/
│   ├── route.ts
│   └── [id]/route.ts
├── community-programs/
│   ├── route.ts
│   └── [id]/route.ts
└── job-postings/
    ├── route.ts
    └── [id]/route.ts
```

### Public APIs (for completeness, but server components query DB directly)

```
src/app/api/
├── programs/
│   ├── route.ts              # GET published, active
│   └── [slug]/route.ts
├── workshops/...
├── community-programs/...
└── job-postings/...
```

## Public Pages Updates

Update these pages to query database directly (server components):

| Page | Action |
|------|--------|
| `/services/programs/page.tsx` | Query Program entity |
| `/services/programs/[slug]/page.tsx` | Query by slug |
| `/services/workshops/page.tsx` | Query Workshop entity |
| `/services/workshops/[slug]/page.tsx` | Query by slug |
| `/community/page.tsx` | Query CommunityProgram entity |
| `/join-us/page.tsx` | Query JobPosting entity |

Query filter: `status = 'published' AND isActive = true`

## Shared Components

### Rich Text Editor
```
src/components/admin/RichTextEditor.tsx
```
- Tiptap with StarterKit
- Bold, italic, headings, lists, links
- Returns HTML string

### Image Uploader
```
src/components/admin/ImageUploader.tsx
```
- Uploadthing UploadDropzone
- Preview current image
- Remove button
- Returns URL string

### Content Form
```
src/components/admin/ContentForm.tsx
```
- Reusable form wrapper
- Status dropdown
- isActive toggle
- Save/Cancel actions

### Content Table
```
src/components/admin/ContentTable.tsx
```
- Reusable list table
- Status badges
- isActive toggle
- Edit/Delete actions

## New Dependencies

```json
{
  "@tiptap/react": "^2.x",
  "@tiptap/starter-kit": "^2.x",
  "@tiptap/extension-link": "^2.x",
  "uploadthing": "^7.x",
  "@uploadthing/react": "^7.x",
  "slugify": "^1.x",
  "@tailwindcss/typography": "^0.5.x"
}
```

## Cleanup (After Implementation)

### Delete
- `/backend/` folder (entire Strapi)
- `src/lib/strapi.ts`

### Update
- `src/config.ts` - Remove strapi section
- `.env.local` - Remove STRAPI_URL, STRAPI_API_TOKEN
- `CLAUDE.md` - Remove Strapi references

## Implementation Tasks

### Phase 1: Foundation
1. Add new dependencies (Tiptap, Uploadthing, slugify, typography)
2. Create 4 TypeORM entities
3. Update db.ts to include new entities
4. Configure Uploadthing

### Phase 2: Shared Components
5. Create RichTextEditor component
6. Create ImageUploader component
7. Create ContentTable component
8. Create ContentForm component

### Phase 3: Admin Panel - Programs
9. Programs list page
10. Programs new page
11. Programs edit page
12. Programs API routes

### Phase 4: Admin Panel - Workshops
13. Workshops list page
14. Workshops new page
15. Workshops edit page
16. Workshops API routes

### Phase 5: Admin Panel - Community Programs
17. Community Programs list page
18. Community Programs new page
19. Community Programs edit page
20. Community Programs API routes

### Phase 6: Admin Panel - Job Postings
21. Job Postings list page
22. Job Postings new page
23. Job Postings edit page
24. Job Postings API routes

### Phase 7: Public Pages
25. Update /services/programs pages
26. Update /services/workshops pages
27. Update /community page
28. Update /join-us page

### Phase 8: Cleanup
29. Remove Strapi backend folder
30. Remove src/lib/strapi.ts
31. Update config.ts
32. Update CLAUDE.md
