# Blog Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans OR superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Implement a mixed-purpose blog with admin panel integration for MindWeal

**Architecture:** New BlogPost entity with TypeORM, admin CRUD pages (client components), public pages (server components), categories + tags, full SEO control, featured posts

**Tech Stack:** TypeORM, Next.js 16 App Router, Tiptap, UploadThing, Zod validation, react-hook-form

---

## Phase 1: Backend Foundation (Database & API)

### Task 1.1: Create BlogPost Entity

**Files:**
- Create: `src/entities/BlogPost.ts`
- Modify: `src/lib/db.ts` (add entity to DataSource)

**Step 1: Create BlogPost entity file**

```typescript
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { TeamMember } from "./TeamMember";

@Entity("blog_posts")
export class BlogPost {
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

    @Column({ type: "varchar", length: 255 })
    title!: string;

    @Column({ type: "text", nullable: true })
    excerpt!: string | null;

    @Column({ type: "text" })
    content!: string;

    @Column({ type: "varchar", length: 500, nullable: true })
    coverImage!: string | null;

    @Column({
        type: "enum",
        enum: ["wellness-tips", "practice-news", "professional-insights", "resources"],
    })
    category!: "wellness-tips" | "practice-news" | "professional-insights" | "resources";

    @Column({ type: "json", nullable: true })
    tags!: string[] | null;

    @Column({ default: false })
    isFeatured!: boolean;

    @Column({ type: "int", nullable: true })
    featuredOrder!: number | null;

    @Column({ type: "uuid", nullable: true })
    authorId!: string | null;

    @ManyToOne(() => TeamMember, { nullable: true })
    @JoinColumn({ name: "authorId" })
    author!: TeamMember | null;

    @Column({ type: "varchar", length: 255, nullable: true })
    authorName!: string | null;

    @Column({ type: "varchar", length: 255, nullable: true })
    metaTitle!: string | null;

    @Column({ type: "text", nullable: true })
    metaDescription!: string | null;

    @Column({ type: "datetime", nullable: true })
    publishedAt!: Date | null;
}
```

**Step 2: Register entity in DataSource**

File: `src/lib/db.ts`

Find the entities array and add BlogPost:

```typescript
import { BlogPost } from "@/entities/BlogPost";

// In AppDataSource configuration:
entities: [
    // ... existing entities
    BlogPost,
],
```

**Step 3: Verify entity syntax**

Run: `bun run build`
Expected: No TypeScript errors related to BlogPost

**Step 4: Commit**

```bash
git add src/entities/BlogPost.ts src/lib/db.ts
git commit -m "feat: add BlogPost entity"
```

---

### Task 1.2: Create Database Migration

**Files:**
- Create: `migrations/TIMESTAMP-CreateBlogPosts.ts`

**Step 1: Generate migration file**

Run: `bun run migration:create migrations/CreateBlogPosts`
Expected: Creates file `migrations/TIMESTAMP-CreateBlogPosts.ts`

**Step 2: Write migration up method**

```typescript
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class CreateBlogPosts1234567890123 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "blog_posts",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        length: "36",
                        isPrimary: true,
                        generationStrategy: "uuid",
                    },
                    {
                        name: "slug",
                        type: "varchar",
                        length: "255",
                        isUnique: true,
                    },
                    {
                        name: "status",
                        type: "enum",
                        enum: ["draft", "published"],
                        default: "'draft'",
                    },
                    {
                        name: "isActive",
                        type: "boolean",
                        default: true,
                    },
                    {
                        name: "createdAt",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updatedAt",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                        onUpdate: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "title",
                        type: "varchar",
                        length: "255",
                    },
                    {
                        name: "excerpt",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "content",
                        type: "text",
                    },
                    {
                        name: "coverImage",
                        type: "varchar",
                        length: "500",
                        isNullable: true,
                    },
                    {
                        name: "category",
                        type: "enum",
                        enum: ["wellness-tips", "practice-news", "professional-insights", "resources"],
                    },
                    {
                        name: "tags",
                        type: "json",
                        isNullable: true,
                    },
                    {
                        name: "isFeatured",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "featuredOrder",
                        type: "int",
                        isNullable: true,
                    },
                    {
                        name: "authorId",
                        type: "varchar",
                        length: "36",
                        isNullable: true,
                    },
                    {
                        name: "authorName",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "metaTitle",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "metaDescription",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "publishedAt",
                        type: "datetime",
                        isNullable: true,
                    },
                ],
            }),
            true
        );

        // Add indexes
        await queryRunner.createIndex(
            "blog_posts",
            new TableIndex({
                name: "IDX_BLOG_POSTS_SLUG",
                columnNames: ["slug"],
            })
        );

        await queryRunner.createIndex(
            "blog_posts",
            new TableIndex({
                name: "IDX_BLOG_POSTS_STATUS",
                columnNames: ["status"],
            })
        );

        await queryRunner.createIndex(
            "blog_posts",
            new TableIndex({
                name: "IDX_BLOG_POSTS_CATEGORY",
                columnNames: ["category"],
            })
        );

        await queryRunner.createIndex(
            "blog_posts",
            new TableIndex({
                name: "IDX_BLOG_POSTS_PUBLISHED_AT",
                columnNames: ["publishedAt"],
            })
        );

        await queryRunner.createIndex(
            "blog_posts",
            new TableIndex({
                name: "IDX_BLOG_POSTS_IS_FEATURED",
                columnNames: ["isFeatured"],
            })
        );

        // Add foreign key to team_members
        await queryRunner.createForeignKey(
            "blog_posts",
            new TableForeignKey({
                columnNames: ["authorId"],
                referencedColumnNames: ["id"],
                referencedTableName: "team_members",
                onDelete: "SET NULL",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("blog_posts");
    }
}
```

**Step 3: Run migration**

Run: `bun run migration:run`
Expected: Migration executes successfully

**Step 4: Verify table created**

Connect to MySQL and verify:
```sql
SHOW TABLES LIKE 'blog_posts';
DESCRIBE blog_posts;
```

**Step 5: Commit**

```bash
git add migrations/
git commit -m "feat: add blog_posts table migration"
```

---

### Task 1.3: Create Validation Schemas

**Files:**
- Modify: `src/lib/validation.ts`

**Step 1: Add blog post validation schemas**

Add to `src/lib/validation.ts`:

```typescript
// Blog Post Validation
export const createBlogPostSchema = z.object({
    title: z.string().min(1, "Title is required").max(255, "Title too long"),
    slug: z.string().min(1).max(255).optional(),
    category: z.enum(["wellness-tips", "practice-news", "professional-insights", "resources"]),
    content: z.string().min(1, "Content is required"),
    excerpt: z.string().max(500, "Excerpt too long").optional().nullable(),
    coverImage: z.string().url("Invalid image URL").optional().nullable(),
    tags: z.array(z.string().max(30, "Tag too long")).max(10, "Maximum 10 tags").optional().nullable(),
    authorId: z.string().uuid().optional().nullable(),
    authorName: z.string().max(255).optional().nullable(),
    metaTitle: z.string().max(60, "Meta title should be under 60 characters").optional().nullable(),
    metaDescription: z.string().max(160, "Meta description should be under 160 characters").optional().nullable(),
    isFeatured: z.boolean().default(false),
    featuredOrder: z.number().int().positive().optional().nullable(),
    status: z.enum(["draft", "published"]).default("draft"),
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;
```

**Step 2: Verify TypeScript compilation**

Run: `bun run build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/validation.ts
git commit -m "feat: add blog post validation schemas"
```

---

### Task 1.4: Create Admin API - List & Create

**Files:**
- Create: `src/app/api/(admin)/admin/blog/route.ts`

**Step 1: Create API route file**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/db";
import { BlogPost } from "@/entities/BlogPost";
import { createBlogPostSchema } from "@/lib/validation";
import type { AuthSession } from "@/types/auth";
import slugify from "slugify";

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        }) as AuthSession | null;

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const category = searchParams.get("category");

        const ds = await getDataSource();
        const repo = ds.getRepository(BlogPost);

        const where: any = {};
        if (status) where.status = status;
        if (category) where.category = category;

        const posts = await repo.find({
            where,
            relations: ["author"],
            order: { createdAt: "DESC" },
        });

        return NextResponse.json({ success: true, data: posts });
    } catch (error) {
        console.error("Error fetching blog posts:", error);
        return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        }) as AuthSession | null;

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const validated = createBlogPostSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validated.error.flatten() },
                { status: 400 }
            );
        }

        const ds = await getDataSource();
        const repo = ds.getRepository(BlogPost);

        // Generate slug from title if not provided
        let slug = validated.data.slug || slugify(validated.data.title, { lower: true, strict: true });

        // Ensure slug uniqueness
        let counter = 1;
        let uniqueSlug = slug;
        while (await repo.findOne({ where: { slug: uniqueSlug } })) {
            uniqueSlug = `${slug}-${counter}`;
            counter++;
        }

        const post = repo.create({
            ...validated.data,
            slug: uniqueSlug,
            publishedAt: validated.data.status === "published" ? new Date() : null,
        });

        await repo.save(post);

        return NextResponse.json({ success: true, data: post }, { status: 201 });
    } catch (error) {
        console.error("Error creating blog post:", error);
        return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 });
    }
}
```

**Step 2: Verify API compiles**

Run: `bun run build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/api/\(admin\)/admin/blog/route.ts
git commit -m "feat: add blog admin API list and create endpoints"
```

---

### Task 1.5: Create Admin API - Get, Update, Delete

**Files:**
- Create: `src/app/api/(admin)/admin/blog/[id]/route.ts`

**Step 1: Create API route file**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/db";
import { BlogPost } from "@/entities/BlogPost";
import { updateBlogPostSchema } from "@/lib/validation";
import type { AuthSession } from "@/types/auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        }) as AuthSession | null;

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const ds = await getDataSource();
        const repo = ds.getRepository(BlogPost);

        const post = await repo.findOne({
            where: { id },
            relations: ["author"],
        });

        if (!post) {
            return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: post });
    } catch (error) {
        console.error("Error fetching blog post:", error);
        return NextResponse.json({ error: "Failed to fetch blog post" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        }) as AuthSession | null;

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const validated = updateBlogPostSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validated.error.flatten() },
                { status: 400 }
            );
        }

        const ds = await getDataSource();
        const repo = ds.getRepository(BlogPost);

        const post = await repo.findOne({ where: { id } });

        if (!post) {
            return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
        }

        // Set publishedAt if transitioning to published for first time
        if (validated.data.status === "published" && !post.publishedAt) {
            validated.data.publishedAt = new Date();
        }

        Object.assign(post, validated.data);
        await repo.save(post);

        return NextResponse.json({ success: true, data: post });
    } catch (error) {
        console.error("Error updating blog post:", error);
        return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        }) as AuthSession | null;

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const ds = await getDataSource();
        const repo = ds.getRepository(BlogPost);

        const post = await repo.findOne({ where: { id } });

        if (!post) {
            return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
        }

        // Soft delete
        post.isActive = false;
        await repo.save(post);

        return NextResponse.json({ success: true, message: "Blog post deleted" });
    } catch (error) {
        console.error("Error deleting blog post:", error);
        return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
    }
}
```

**Step 2: Verify API compiles**

Run: `bun run build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/api/\(admin\)/admin/blog/[id]/route.ts
git commit -m "feat: add blog admin API get, update, delete endpoints"
```

---

## Phase 2: Admin Panel UI

### Task 2.1: Create Blog List Page

**Files:**
- Create: `src/app/(portals)/admin/blog/page.tsx`

**Step 1: Create admin blog list page**

```typescript
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ContentTable } from "@/components/admin/ContentTable";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    category: string;
    status: "draft" | "published";
    isActive: boolean;
    publishedAt: string | null;
    authorName: string | null;
    author?: { name: string } | null;
}

export default function BlogListPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    useEffect(() => {
        fetchPosts();
    }, [statusFilter, categoryFilter]);

    async function fetchPosts() {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter !== "all") params.set("status", statusFilter);
            if (categoryFilter !== "all") params.set("category", categoryFilter);

            const res = await fetch(`/api/admin/blog?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setPosts(data.data);
            }
        } catch (error) {
            console.error("Error fetching blog posts:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleToggleActive(id: string) {
        const post = posts.find((p) => p.id === id);
        if (!post) return;

        try {
            const res = await fetch(`/api/admin/blog/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !post.isActive }),
            });

            if (res.ok) {
                fetchPosts();
            }
        } catch (error) {
            console.error("Error toggling blog post:", error);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this blog post?")) return;

        try {
            const res = await fetch(`/api/admin/blog/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                fetchPosts();
            }
        } catch (error) {
            console.error("Error deleting blog post:", error);
        }
    }

    const categoryLabels: Record<string, string> = {
        "wellness-tips": "Wellness Tips",
        "practice-news": "Practice News",
        "professional-insights": "Professional Insights",
        "resources": "Resources",
    };

    const columns = [
        { key: "title", label: "Title" },
        {
            key: "category",
            label: "Category",
            render: (post: BlogPost) => categoryLabels[post.category] || post.category,
        },
        {
            key: "author",
            label: "Author",
            render: (post: BlogPost) => post.author?.name || post.authorName || "—",
        },
        {
            key: "status",
            label: "Status",
            render: (post: BlogPost) => (
                <span
                    className={`px-2 py-1 text-xs rounded-full ${
                        post.status === "published"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                    }`}
                >
                    {post.status}
                </span>
            ),
        },
        {
            key: "publishedAt",
            label: "Published",
            render: (post: BlogPost) =>
                post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString()
                    : "—",
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="portal-title">Blog Posts</h1>
                    <p className="text-gray-600 text-sm mt-1">
                        Manage blog posts, articles, and updates
                    </p>
                </div>
                <Link href="/admin/blog/new" className="btn btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    New Post
                </Link>
            </div>

            <div className="flex gap-4 items-center">
                <div>
                    <label className="text-sm text-gray-600 mr-2">Status:</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    >
                        <option value="all">All</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                </div>

                <div>
                    <label className="text-sm text-gray-600 mr-2">Category:</label>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    >
                        <option value="all">All Categories</option>
                        <option value="wellness-tips">Wellness Tips</option>
                        <option value="practice-news">Practice News</option>
                        <option value="professional-insights">Professional Insights</option>
                        <option value="resources">Resources</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : (
                <ContentTable
                    data={posts}
                    columns={columns}
                    editPath="/admin/blog"
                    onToggleActive={handleToggleActive}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}
```

**Step 2: Verify page compiles**

Run: `bun run build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/\(portals\)/admin/blog/page.tsx
git commit -m "feat: add blog admin list page"
```

---

### Task 2.2: Create Blog Form Component

**Files:**
- Create: `src/app/(portals)/admin/blog/BlogForm.tsx`

**Step 1: Create blog form component**

```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ContentForm } from "@/components/admin/ContentForm";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { createBlogPostSchema } from "@/lib/validation";

type FormData = z.infer<typeof createBlogPostSchema>;

interface BlogFormProps {
    initialData?: any;
    mode: "create" | "edit";
}

export default function BlogForm({ initialData, mode }: BlogFormProps) {
    const router = useRouter();
    const [content, setContent] = useState(initialData?.content || "");
    const [submitting, setSubmitting] = useState(false);
    const [teamMembers, setTeamMembers] = useState<any[]>([]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(createBlogPostSchema),
        defaultValues: initialData || {
            status: "draft",
            isFeatured: false,
        },
    });

    const isFeatured = watch("isFeatured");

    useEffect(() => {
        fetchTeamMembers();
    }, []);

    async function fetchTeamMembers() {
        try {
            const res = await fetch("/api/admin/team-members");
            const data = await res.json();
            if (data.success) {
                setTeamMembers(data.data);
            }
        } catch (error) {
            console.error("Error fetching team members:", error);
        }
    }

    async function onSubmit(data: FormData) {
        setSubmitting(true);
        try {
            const payload = { ...data, content };

            const url =
                mode === "create"
                    ? "/api/admin/blog"
                    : `/api/admin/blog/${initialData.id}`;
            const method = mode === "create" ? "POST" : "PUT";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (!res.ok) {
                alert(result.error || "Failed to save blog post");
                return;
            }

            router.push("/admin/blog");
            router.refresh();
        } catch (error) {
            console.error("Error saving blog post:", error);
            alert("Failed to save blog post");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <ContentForm
            onSubmit={handleSubmit(onSubmit)}
            submitting={submitting}
            submitLabel={mode === "create" ? "Create Post" : "Update Post"}
            statusRegister={register("status")}
        >
            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                </label>
                <input
                    type="text"
                    {...register("title")}
                    className="input w-full"
                    placeholder="Enter blog post title"
                />
                {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
            </div>

            {/* Slug */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug
                </label>
                <input
                    type="text"
                    {...register("slug")}
                    className="input w-full"
                    placeholder="auto-generated-from-title"
                />
                <p className="text-gray-500 text-xs mt-1">
                    Leave blank to auto-generate from title
                </p>
                {errors.slug && (
                    <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
                )}
            </div>

            {/* Category */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                </label>
                <select {...register("category")} className="input w-full">
                    <option value="">Select category</option>
                    <option value="wellness-tips">Wellness Tips</option>
                    <option value="practice-news">Practice News</option>
                    <option value="professional-insights">Professional Insights</option>
                    <option value="resources">Resources</option>
                </select>
                {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                )}
            </div>

            {/* Excerpt */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Excerpt
                </label>
                <textarea
                    {...register("excerpt")}
                    rows={3}
                    className="input w-full"
                    placeholder="Short summary for listings and SEO"
                    maxLength={500}
                />
                {errors.excerpt && (
                    <p className="text-red-500 text-sm mt-1">{errors.excerpt.message}</p>
                )}
            </div>

            {/* Content */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content *
                </label>
                <RichTextEditor content={content} onChange={setContent} />
            </div>

            {/* Cover Image */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cover Image
                </label>
                <ImageUploader
                    value={watch("coverImage") || ""}
                    onChange={(url) => setValue("coverImage", url)}
                />
            </div>

            {/* Tags */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                </label>
                <input
                    type="text"
                    {...register("tags")}
                    className="input w-full"
                    placeholder="anxiety, mindfulness, self-care (comma-separated)"
                />
                <p className="text-gray-500 text-xs mt-1">
                    Enter tags separated by commas (max 10)
                </p>
                {errors.tags && (
                    <p className="text-red-500 text-sm mt-1">{errors.tags.message}</p>
                )}
            </div>

            {/* Author */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Author (Team Member)
                    </label>
                    <select {...register("authorId")} className="input w-full">
                        <option value="">None</option>
                        {teamMembers.map((member) => (
                            <option key={member.id} value={member.id}>
                                {member.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Or Author Name (Text)
                    </label>
                    <input
                        type="text"
                        {...register("authorName")}
                        className="input w-full"
                        placeholder="John Doe"
                    />
                </div>
            </div>

            {/* SEO Section */}
            <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3">SEO Settings</h3>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Meta Title
                        </label>
                        <input
                            type="text"
                            {...register("metaTitle")}
                            className="input w-full"
                            placeholder="Custom SEO title (max 60 chars)"
                            maxLength={60}
                        />
                        {errors.metaTitle && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.metaTitle.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Meta Description
                        </label>
                        <textarea
                            {...register("metaDescription")}
                            rows={2}
                            className="input w-full"
                            placeholder="Custom SEO description (max 160 chars)"
                            maxLength={160}
                        />
                        {errors.metaDescription && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.metaDescription.message}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Featured Section */}
            <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3">Featured Post</h3>

                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            {...register("isFeatured")}
                            className="rounded"
                        />
                        <span className="text-sm">Featured Post</span>
                    </label>

                    {isFeatured && (
                        <div>
                            <input
                                type="number"
                                {...register("featuredOrder", { valueAsNumber: true })}
                                className="input w-24"
                                placeholder="Order"
                                min="1"
                            />
                        </div>
                    )}
                </div>
            </div>
        </ContentForm>
    );
}
```

**Step 2: Handle tags parsing**

Note: The form currently accepts comma-separated string, need to parse before submit. Update the onSubmit:

```typescript
async function onSubmit(data: FormData) {
    setSubmitting(true);
    try {
        // Parse tags if string
        let tags = data.tags;
        if (typeof tags === "string") {
            tags = tags.split(",").map((t) => t.trim()).filter(Boolean);
        }

        const payload = { ...data, content, tags };
        // ... rest of submit logic
    }
}
```

**Step 3: Verify form compiles**

Run: `bun run build`
Expected: No errors

**Step 4: Commit**

```bash
git add src/app/\(portals\)/admin/blog/BlogForm.tsx
git commit -m "feat: add blog form component"
```

---

### Task 2.3: Create New Blog Post Page

**Files:**
- Create: `src/app/(portals)/admin/blog/new/page.tsx`

**Step 1: Create new post page**

```typescript
import { Metadata } from "next";
import BlogForm from "../BlogForm";

export const metadata: Metadata = {
    title: "New Blog Post | Admin | Mindweal by Pihu Suri",
};

export default function NewBlogPostPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="portal-title">Create Blog Post</h1>
                <p className="text-gray-600 text-sm mt-1">
                    Write and publish a new blog post
                </p>
            </div>

            <BlogForm mode="create" />
        </div>
    );
}
```

**Step 2: Verify page compiles**

Run: `bun run build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/\(portals\)/admin/blog/new/page.tsx
git commit -m "feat: add new blog post page"
```

---

### Task 2.4: Create Edit Blog Post Page

**Files:**
- Create: `src/app/(portals)/admin/blog/[id]/edit/page.tsx`

**Step 1: Create edit post page**

```typescript
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDataSource } from "@/lib/db";
import { BlogPost } from "@/entities/BlogPost";
import BlogForm from "../../BlogForm";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getBlogPost(id: string) {
    const ds = await getDataSource();
    const repo = ds.getRepository(BlogPost);

    const post = await repo.findOne({
        where: { id },
        relations: ["author"],
    });

    return post;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    return {
        title: "Edit Blog Post | Admin | Mindweal by Pihu Suri",
    };
}

export default async function EditBlogPostPage({ params }: PageProps) {
    const { id } = await params;
    const post = await getBlogPost(id);

    if (!post) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="portal-title">Edit Blog Post</h1>
                <p className="text-gray-600 text-sm mt-1">
                    Update blog post content and settings
                </p>
            </div>

            <BlogForm mode="edit" initialData={post} />
        </div>
    );
}
```

**Step 2: Verify page compiles**

Run: `bun run build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/\(portals\)/admin/blog/[id]/edit/page.tsx
git commit -m "feat: add edit blog post page"
```

---

## Phase 3: Public Blog Pages

### Task 3.1: Create Blog Homepage

**Files:**
- Create: `src/app/(public)/blog/page.tsx`

**Step 1: Create blog homepage**

```typescript
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calendar, User } from "lucide-react";
import { getDataSource } from "@/lib/db";
import { BlogPost } from "@/entities/BlogPost";
import { sanitizeHtml } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Blog | MindWeal by Pihu Suri",
    description:
        "Mental health insights, wellness tips, and practice updates from MindWeal",
};

async function getFeaturedPosts() {
    const ds = await getDataSource();
    const repo = ds.getRepository(BlogPost);

    return repo.find({
        where: { status: "published", isActive: true, isFeatured: true },
        relations: ["author"],
        order: { featuredOrder: "ASC", publishedAt: "DESC" },
    });
}

async function getRecentPosts() {
    const ds = await getDataSource();
    const repo = ds.getRepository(BlogPost);

    return repo.find({
        where: { status: "published", isActive: true },
        relations: ["author"],
        order: { publishedAt: "DESC" },
        take: 12,
    });
}

const CATEGORY_LABELS: Record<string, string> = {
    "wellness-tips": "Wellness Tips",
    "practice-news": "Practice News",
    "professional-insights": "Professional Insights",
    "resources": "Resources",
};

const CATEGORY_COLORS: Record<string, string> = {
    "wellness-tips": "bg-teal-100 text-teal-800",
    "practice-news": "bg-green-100 text-green-800",
    "professional-insights": "bg-violet-100 text-violet-800",
    "resources": "bg-blue-100 text-blue-800",
};

export default async function BlogHomePage() {
    const featuredPosts = await getFeaturedPosts();
    const recentPosts = await getRecentPosts();

    // Convert to plain objects
    const plainFeatured = featuredPosts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        category: post.category,
        publishedAt: post.publishedAt?.toISOString(),
        authorName: post.author?.name || post.authorName,
    }));

    const plainRecent = recentPosts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        category: post.category,
        publishedAt: post.publishedAt?.toISOString(),
        authorName: post.author?.name || post.authorName,
    }));

    return (
        <>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-white via-[#f0fdf9] to-[#f5f3ff] py-16 md:py-24">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold">
                            MindWeal <span className="text-gradient-primary">Blog</span>
                        </h1>
                        <p className="mt-4 text-lg text-gray-600">
                            Mental health insights, wellness tips, and updates from our team
                            of mental health professionals.
                        </p>
                    </div>
                </div>
            </section>

            {/* Featured Posts */}
            {plainFeatured.length > 0 && (
                <section className="section bg-white">
                    <div className="container-custom">
                        <h2 className="text-2xl font-bold mb-8">Featured Posts</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {plainFeatured.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/blog/${post.slug}`}
                                    className="card group hover:shadow-lg transition-shadow"
                                >
                                    {post.coverImage ? (
                                        <div className="aspect-video overflow-hidden">
                                            <Image
                                                src={post.coverImage}
                                                alt={post.title}
                                                width={400}
                                                height={225}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            />
                                        </div>
                                    ) : (
                                        <div className="aspect-video bg-gradient-to-br from-[var(--primary-teal)]/20 to-[var(--secondary-green)]/20" />
                                    )}
                                    <div className="p-6">
                                        <span
                                            className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                                                CATEGORY_COLORS[post.category]
                                            }`}
                                        >
                                            {CATEGORY_LABELS[post.category]}
                                        </span>
                                        <h3 className="text-xl font-semibold mt-3 group-hover:text-[var(--primary-teal)] transition-colors">
                                            {post.title}
                                        </h3>
                                        {post.excerpt && (
                                            <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                                                {post.excerpt}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                                            {post.authorName && (
                                                <div className="flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    {post.authorName}
                                                </div>
                                            )}
                                            {post.publishedAt && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(post.publishedAt).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Recent Posts */}
            <section className="section section-alt">
                <div className="container-custom">
                    <h2 className="text-2xl font-bold mb-8">Recent Posts</h2>
                    {plainRecent.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No blog posts yet. Check back soon!
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {plainRecent.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/blog/${post.slug}`}
                                    className="card group hover:shadow-lg transition-shadow"
                                >
                                    {post.coverImage ? (
                                        <div className="aspect-video overflow-hidden">
                                            <Image
                                                src={post.coverImage}
                                                alt={post.title}
                                                width={400}
                                                height={225}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            />
                                        </div>
                                    ) : (
                                        <div className="aspect-video bg-gradient-to-br from-[var(--primary-teal)]/20 to-[var(--secondary-green)]/20" />
                                    )}
                                    <div className="p-6">
                                        <span
                                            className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                                                CATEGORY_COLORS[post.category]
                                            }`}
                                        >
                                            {CATEGORY_LABELS[post.category]}
                                        </span>
                                        <h3 className="text-xl font-semibold mt-3 group-hover:text-[var(--primary-teal)] transition-colors">
                                            {post.title}
                                        </h3>
                                        {post.excerpt && (
                                            <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                                                {post.excerpt}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                                            {post.authorName && (
                                                <div className="flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    {post.authorName}
                                                </div>
                                            )}
                                            {post.publishedAt && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(post.publishedAt).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
```

**Step 2: Verify page compiles**

Run: `bun run build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/\(public\)/blog/page.tsx
git commit -m "feat: add blog homepage with featured and recent posts"
```

---

### Task 3.2: Create Blog Post Detail Page

**Files:**
- Create: `src/app/(public)/blog/[slug]/page.tsx`

**Step 1: Create post detail page**

```typescript
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { Not } from "typeorm";
import { getDataSource } from "@/lib/db";
import { BlogPost } from "@/entities/BlogPost";
import { sanitizeHtml } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ slug: string }>;
}

async function getBlogPost(slug: string) {
    const ds = await getDataSource();
    const repo = ds.getRepository(BlogPost);

    const post = await repo.findOne({
        where: { slug, status: "published", isActive: true },
        relations: ["author"],
    });

    return post;
}

async function getRelatedPosts(category: string, excludeId: string) {
    const ds = await getDataSource();
    const repo = ds.getRepository(BlogPost);

    return repo.find({
        where: {
            category,
            status: "published",
            isActive: true,
            id: Not(excludeId),
        },
        order: { publishedAt: "DESC" },
        take: 3,
    });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = await getBlogPost(slug);

    if (!post) {
        return {
            title: "Post Not Found | MindWeal by Pihu Suri",
        };
    }

    const stripHtml = (html: string, maxLength: number) => {
        const text = html.replace(/<[^>]*>/g, "");
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    };

    return {
        title: post.metaTitle || `${post.title} | Blog | MindWeal by Pihu Suri`,
        description:
            post.metaDescription ||
            post.excerpt ||
            stripHtml(post.content, 160),
        openGraph: post.coverImage
            ? {
                  images: [post.coverImage],
              }
            : undefined,
    };
}

const CATEGORY_LABELS: Record<string, string> = {
    "wellness-tips": "Wellness Tips",
    "practice-news": "Practice News",
    "professional-insights": "Professional Insights",
    "resources": "Resources",
};

const CATEGORY_COLORS: Record<string, string> = {
    "wellness-tips": "bg-teal-100 text-teal-800",
    "practice-news": "bg-green-100 text-green-800",
    "professional-insights": "bg-violet-100 text-violet-800",
    "resources": "bg-blue-100 text-blue-800",
};

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params;
    const post = await getBlogPost(slug);

    if (!post) {
        notFound();
    }

    const relatedPosts = await getRelatedPosts(post.category, post.id);

    const plainRelated = relatedPosts.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        coverImage: p.coverImage,
        category: p.category,
    }));

    return (
        <>
            {/* Cover Image */}
            {post.coverImage && (
                <div className="w-full h-[400px] relative">
                    <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            )}

            {/* Post Content */}
            <article className="section bg-white">
                <div className="container-custom max-w-4xl">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-[var(--primary-teal)] mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Blog
                    </Link>

                    <span
                        className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                            CATEGORY_COLORS[post.category]
                        }`}
                    >
                        {CATEGORY_LABELS[post.category]}
                    </span>

                    <h1 className="text-4xl md:text-5xl font-bold mt-4">{post.title}</h1>

                    <div className="flex items-center gap-6 mt-6 text-gray-600">
                        {(post.author || post.authorName) && (
                            <div className="flex items-center gap-2">
                                {post.author?.photoUrl ? (
                                    <Image
                                        src={post.author.photoUrl}
                                        alt={post.author.name}
                                        width={40}
                                        height={40}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <User className="w-5 h-5" />
                                )}
                                <span>{post.author?.name || post.authorName}</span>
                            </div>
                        )}
                        {post.publishedAt && (
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                <span>
                                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>
                        )}
                    </div>

                    {post.excerpt && (
                        <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                            {post.excerpt}
                        </p>
                    )}

                    <div
                        className="prose prose-lg prose-teal max-w-none mt-8"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
                    />

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="mt-12 pt-8 border-t">
                            <h3 className="text-sm font-semibold text-gray-500 mb-3">
                                TAGS
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </article>

            {/* Related Posts */}
            {plainRelated.length > 0 && (
                <section className="section section-alt">
                    <div className="container-custom">
                        <h2 className="text-2xl font-bold mb-8">Related Posts</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {plainRelated.map((related) => (
                                <Link
                                    key={related.id}
                                    href={`/blog/${related.slug}`}
                                    className="card group hover:shadow-lg transition-shadow"
                                >
                                    {related.coverImage ? (
                                        <div className="aspect-video overflow-hidden">
                                            <Image
                                                src={related.coverImage}
                                                alt={related.title}
                                                width={400}
                                                height={225}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            />
                                        </div>
                                    ) : (
                                        <div className="aspect-video bg-gradient-to-br from-[var(--primary-teal)]/20 to-[var(--secondary-green)]/20" />
                                    )}
                                    <div className="p-6">
                                        <span
                                            className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                                                CATEGORY_COLORS[related.category]
                                            }`}
                                        >
                                            {CATEGORY_LABELS[related.category]}
                                        </span>
                                        <h3 className="text-lg font-semibold mt-3 group-hover:text-[var(--primary-teal)] transition-colors">
                                            {related.title}
                                        </h3>
                                        {related.excerpt && (
                                            <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                                                {related.excerpt}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
```

**Step 2: Verify page compiles**

Run: `bun run build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/\(public\)/blog/[slug]/page.tsx
git commit -m "feat: add blog post detail page with related posts"
```

---

### Task 3.3: Create Category Filter Page

**Files:**
- Create: `src/app/(public)/blog/category/[category]/page.tsx`

**Step 1: Create category page**

```typescript
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { getDataSource } from "@/lib/db";
import { BlogPost } from "@/entities/BlogPost";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ category: string }>;
}

const VALID_CATEGORIES = [
    "wellness-tips",
    "practice-news",
    "professional-insights",
    "resources",
];

const CATEGORY_LABELS: Record<string, string> = {
    "wellness-tips": "Wellness Tips",
    "practice-news": "Practice News",
    "professional-insights": "Professional Insights",
    "resources": "Resources",
};

const CATEGORY_COLORS: Record<string, string> = {
    "wellness-tips": "bg-teal-100 text-teal-800",
    "practice-news": "bg-green-100 text-green-800",
    "professional-insights": "bg-violet-100 text-violet-800",
    "resources": "bg-blue-100 text-blue-800",
};

async function getCategoryPosts(category: string) {
    const ds = await getDataSource();
    const repo = ds.getRepository(BlogPost);

    return repo.find({
        where: { category, status: "published", isActive: true },
        relations: ["author"],
        order: { publishedAt: "DESC" },
    });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { category } = await params;

    if (!VALID_CATEGORIES.includes(category)) {
        return {
            title: "Category Not Found | MindWeal by Pihu Suri",
        };
    }

    return {
        title: `${CATEGORY_LABELS[category]} | Blog | MindWeal by Pihu Suri`,
    };
}

export default async function CategoryPage({ params }: PageProps) {
    const { category } = await params;

    if (!VALID_CATEGORIES.includes(category)) {
        notFound();
    }

    const posts = await getCategoryPosts(category);

    const plainPosts = posts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        category: post.category,
        publishedAt: post.publishedAt?.toISOString(),
        authorName: post.author?.name || post.authorName,
    }));

    return (
        <>
            <section className="bg-gradient-to-br from-white via-[#f0fdf9] to-[#f5f3ff] py-16">
                <div className="container-custom">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-[var(--primary-teal)] mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Blog
                    </Link>
                    <h1 className="text-4xl font-bold">
                        <span className="text-gradient-primary">
                            {CATEGORY_LABELS[category]}
                        </span>
                    </h1>
                </div>
            </section>

            <section className="section bg-white">
                <div className="container-custom">
                    {plainPosts.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No posts in this category yet.
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {plainPosts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/blog/${post.slug}`}
                                    className="card group hover:shadow-lg transition-shadow"
                                >
                                    {post.coverImage ? (
                                        <div className="aspect-video overflow-hidden">
                                            <Image
                                                src={post.coverImage}
                                                alt={post.title}
                                                width={400}
                                                height={225}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            />
                                        </div>
                                    ) : (
                                        <div className="aspect-video bg-gradient-to-br from-[var(--primary-teal)]/20 to-[var(--secondary-green)]/20" />
                                    )}
                                    <div className="p-6">
                                        <span
                                            className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                                                CATEGORY_COLORS[post.category]
                                            }`}
                                        >
                                            {CATEGORY_LABELS[post.category]}
                                        </span>
                                        <h3 className="text-xl font-semibold mt-3 group-hover:text-[var(--primary-teal)] transition-colors">
                                            {post.title}
                                        </h3>
                                        {post.excerpt && (
                                            <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                                                {post.excerpt}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                                            {post.authorName && (
                                                <div className="flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    {post.authorName}
                                                </div>
                                            )}
                                            {post.publishedAt && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(
                                                        post.publishedAt
                                                    ).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
```

**Step 2: Verify page compiles**

Run: `bun run build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/\(public\)/blog/category/[category]/page.tsx
git commit -m "feat: add blog category filter page"
```

---

## Phase 4: Final Integration & Testing

### Task 4.1: Run Full Build Verification

**Step 1: Run build**

Run: `bun run build`
Expected: Build succeeds with no errors

**Step 2: Verify all routes**

Check build output for new routes:
- `/admin/blog`
- `/admin/blog/new`
- `/admin/blog/[id]/edit`
- `/blog`
- `/blog/[slug]`
- `/blog/category/[category]`

Expected: All routes compile successfully

**Step 3: Commit if any fixes needed**

```bash
git add .
git commit -m "fix: build issues in blog feature"
```

---

### Task 4.2: Test Database Migration

**Step 1: Check migration status**

Run: `bun run migration:run`
Expected: Migration already ran, or runs successfully

**Step 2: Verify table structure**

Connect to MySQL:
```sql
SHOW TABLES LIKE 'blog_posts';
DESCRIBE blog_posts;
SHOW INDEXES FROM blog_posts;
```

Expected: Table exists with all columns and indexes

---

### Task 4.3: Manual Testing Checklist

**Admin Panel:**
- [ ] Navigate to /admin/blog
- [ ] Create draft blog post
- [ ] Add cover image via UploadThing
- [ ] Use rich text editor (formatting, links)
- [ ] Add tags (comma-separated)
- [ ] Select team member as author
- [ ] Save as draft
- [ ] Edit post
- [ ] Mark as featured with order
- [ ] Publish post (verify publishedAt set)
- [ ] Filter by status
- [ ] Filter by category
- [ ] Toggle isActive
- [ ] Soft delete post

**Public Pages:**
- [ ] Visit /blog homepage
- [ ] Verify featured posts show (if any)
- [ ] Verify recent posts show
- [ ] Click post to view detail
- [ ] Verify content renders correctly
- [ ] Verify author and date display
- [ ] Verify related posts show
- [ ] Visit category page
- [ ] Verify category filtering works

**SEO:**
- [ ] View page source for blog post
- [ ] Verify meta title present
- [ ] Verify meta description present
- [ ] Verify Open Graph image (if cover image set)

---

## Summary

**Total Tasks:** 16 tasks across 4 phases

**Estimated Time:** 
- Phase 1 (Backend): ~45 minutes
- Phase 2 (Admin UI): ~60 minutes
- Phase 3 (Public Pages): ~45 minutes
- Phase 4 (Testing): ~30 minutes
- **Total: ~3 hours**

**Key Files Created:**
- Entity: `BlogPost.ts`
- Migration: `CreateBlogPosts.ts`
- API: `admin/blog/route.ts`, `admin/blog/[id]/route.ts`
- Admin: `admin/blog/page.tsx`, `BlogForm.tsx`, `new/page.tsx`, `[id]/edit/page.tsx`
- Public: `blog/page.tsx`, `blog/[slug]/page.tsx`, `blog/category/[category]/page.tsx`
- Validation: Updated `validation.ts`

**Dependencies Used:**
- Existing: TypeORM, Next.js, Zod, react-hook-form, Tiptap, UploadThing, slugify
- Components: ContentForm, ContentTable, RichTextEditor, ImageUploader

**Patterns Followed:**
- Dual status (draft/published + isActive)
- Entity serialization for Client Components
- Admin-only CRUD with auth checks
- Public visibility: published + active only
- Slug auto-generation with uniqueness
- HTML sanitization on public pages
- SEO metadata with fallbacks
