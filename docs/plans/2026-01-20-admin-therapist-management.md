# Admin Therapist Management Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build admin interface to fully manage therapists - create, edit, soft delete, and control publishing.

**Architecture:** Admin controls profile, session types, booking settings. Therapists manage only their availability. New Specialization entity with managed list. UploadThing for photo storage with WebP optimization.

**Tech Stack:** Next.js 16, TypeORM, Zod, react-hook-form, UploadThing, Tailwind CSS v4

---

## Task 1: Create Specialization Entity

**Files:**
- Create: `frontend/src/entities/Specialization.ts`
- Modify: `frontend/src/entities/index.ts`
- Modify: `frontend/src/lib/db.ts`

**Step 1: Create the entity file**

```typescript
// frontend/src/entities/Specialization.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from "typeorm";

@Entity("specializations")
export class Specialization {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ unique: true })
    name!: string;

    @Column({ default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;
}
```

**Step 2: Export from index.ts**

Add to `frontend/src/entities/index.ts`:
```typescript
export { Specialization } from "./Specialization";
```

**Step 3: Add to DataSource entities**

In `frontend/src/lib/db.ts`, add import and include in entities array:
```typescript
import { Specialization } from "@/entities/Specialization";
// In entities array:
entities: [User, Therapist, TherapistAvailability, BlockedDate, SessionType, Booking, Session, Account, VerificationToken, Specialization],
```

**Step 4: Verify build**

Run: `cd frontend && bun run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add frontend/src/entities/Specialization.ts frontend/src/entities/index.ts frontend/src/lib/db.ts
git commit -m "feat: add Specialization entity"
```

---

## Task 2: Update Therapist Entity

**Files:**
- Modify: `frontend/src/entities/Therapist.ts`

**Step 1: Add new fields to Therapist entity**

Add these columns after existing fields in `frontend/src/entities/Therapist.ts`:

```typescript
@Column({ type: "simple-array", nullable: true })
specializationIds!: string[] | null;

@Column({ type: "datetime", nullable: true })
deletedAt!: Date | null;
```

**Step 2: Verify build**

Run: `cd frontend && bun run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add frontend/src/entities/Therapist.ts
git commit -m "feat: add specializationIds and deletedAt to Therapist entity"
```

---

## Task 3: Add Validation Schemas

**Files:**
- Modify: `frontend/src/lib/validation.ts`

**Step 1: Add specialization and therapist schemas**

Add to `frontend/src/lib/validation.ts`:

```typescript
// Specialization schemas
export const createSpecializationSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50),
});

export const updateSpecializationSchema = createSpecializationSchema.partial();

export type CreateSpecializationInput = z.infer<typeof createSpecializationSchema>;

// Therapist schemas
export const createTherapistSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    title: z.string().min(2, "Title must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    bio: z.string().min(50, "Bio must be at least 50 characters"),
    photoUrl: z.string().url("Invalid photo URL"),
    specializationIds: z.array(z.string().uuid()).min(1, "Select at least one specialization"),
    temporaryPassword: z.string().min(8, "Password must be at least 8 characters"),
    sessionTypes: z.array(z.object({
        name: z.string().min(2),
        duration: z.number().min(15).max(180),
        meetingType: z.enum(["in_person", "video", "phone"]),
        price: z.number().optional(),
        color: z.string().default("#00A99D"),
    })).min(1, "Add at least one session type"),
    availability: z.array(z.object({
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
        endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    })).optional(),
    defaultSessionDuration: z.number().default(60),
    bufferTime: z.number().default(15),
    advanceBookingDays: z.number().default(30),
    minBookingNotice: z.number().default(24),
});

export const updateTherapistSchema = createTherapistSchema.omit({
    temporaryPassword: true,
    sessionTypes: true,
    availability: true
}).partial();

export type CreateTherapistInput = z.infer<typeof createTherapistSchema>;
export type UpdateTherapistInput = z.infer<typeof updateTherapistSchema>;
```

**Step 2: Verify build**

Run: `cd frontend && bun run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add frontend/src/lib/validation.ts
git commit -m "feat: add validation schemas for specializations and therapists"
```

---

## Task 4: Specializations API - List & Create

**Files:**
- Create: `frontend/src/app/api/admin/specializations/route.ts`

**Step 1: Create the API route**

```typescript
// frontend/src/app/api/admin/specializations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AppDataSource } from "@/lib/db";
import { Specialization } from "@/entities/Specialization";
import { createSpecializationSchema } from "@/lib/validation";

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const ds = await getDataSource();
        const repo = ds.getRepository(Specialization);
        const specializations = await repo.find({
            where: { isActive: true },
            order: { name: "ASC" },
        });

        return NextResponse.json({ success: true, specializations });
    } catch (error) {
        console.error("Error fetching specializations:", error);
        return NextResponse.json({ error: "Failed to fetch specializations" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const validated = createSpecializationSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json({ error: validated.error.errors }, { status: 400 });
        }

        const ds = await getDataSource();
        const repo = ds.getRepository(Specialization);

        // Check for duplicate
        const existing = await repo.findOne({ where: { name: validated.data.name } });
        if (existing) {
            return NextResponse.json({ error: "Specialization already exists" }, { status: 409 });
        }

        const specialization = repo.create(validated.data);
        await repo.save(specialization);

        return NextResponse.json({ success: true, specialization }, { status: 201 });
    } catch (error) {
        console.error("Error creating specialization:", error);
        return NextResponse.json({ error: "Failed to create specialization" }, { status: 500 });
    }
}
```

**Step 2: Verify build**

Run: `cd frontend && bun run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add frontend/src/app/api/admin/specializations/route.ts
git commit -m "feat: add GET and POST for specializations API"
```

---

## Task 5: Specializations API - Update & Delete

**Files:**
- Create: `frontend/src/app/api/admin/specializations/[id]/route.ts`

**Step 1: Create the dynamic route**

```typescript
// frontend/src/app/api/admin/specializations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AppDataSource } from "@/lib/db";
import { Specialization } from "@/entities/Specialization";
import { Therapist } from "@/entities/Therapist";
import { updateSpecializationSchema } from "@/lib/validation";
import { IsNull, Like } from "typeorm";

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const validated = updateSpecializationSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json({ error: validated.error.errors }, { status: 400 });
        }

        const ds = await getDataSource();
        const repo = ds.getRepository(Specialization);

        const specialization = await repo.findOne({ where: { id } });
        if (!specialization) {
            return NextResponse.json({ error: "Specialization not found" }, { status: 404 });
        }

        // Check for duplicate name if updating
        if (validated.data.name && validated.data.name !== specialization.name) {
            const existing = await repo.findOne({ where: { name: validated.data.name } });
            if (existing) {
                return NextResponse.json({ error: "Specialization name already exists" }, { status: 409 });
            }
        }

        Object.assign(specialization, validated.data);
        await repo.save(specialization);

        return NextResponse.json({ success: true, specialization });
    } catch (error) {
        console.error("Error updating specialization:", error);
        return NextResponse.json({ error: "Failed to update specialization" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const ds = await getDataSource();
        const specRepo = ds.getRepository(Specialization);
        const therapistRepo = ds.getRepository(Therapist);

        const specialization = await specRepo.findOne({ where: { id } });
        if (!specialization) {
            return NextResponse.json({ error: "Specialization not found" }, { status: 404 });
        }

        // Check if in use by any active therapist
        const therapists = await therapistRepo.find({ where: { deletedAt: IsNull() } });
        const inUse = therapists.some(t => t.specializationIds?.includes(id));

        if (inUse) {
            return NextResponse.json({
                error: "Cannot delete specialization that is in use by therapists"
            }, { status: 409 });
        }

        await specRepo.remove(specialization);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting specialization:", error);
        return NextResponse.json({ error: "Failed to delete specialization" }, { status: 500 });
    }
}
```

**Step 2: Verify build**

Run: `cd frontend && bun run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add frontend/src/app/api/admin/specializations/[id]/route.ts
git commit -m "feat: add PUT and DELETE for specializations API"
```

---

## Task 6: Specializations Management Page

**Files:**
- Create: `frontend/src/app/admin/settings/specializations/page.tsx`

**Step 1: Create the page**

```typescript
// frontend/src/app/admin/settings/specializations/page.tsx
import { Metadata } from "next";
import { AppDataSource } from "@/lib/db";
import { Specialization } from "@/entities/Specialization";
import SpecializationsManager from "./SpecializationsManager";

export const metadata: Metadata = {
    title: "Manage Specializations | Admin | Mindweal by Pihu Suri",
};

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

async function getSpecializations() {
    const ds = await getDataSource();
    const repo = ds.getRepository(Specialization);
    return repo.find({ where: { isActive: true }, order: { name: "ASC" } });
}

export default async function SpecializationsPage() {
    const specializations = await getSpecializations();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Manage Specializations</h1>
                <p className="text-gray-600 mt-1">
                    Add, edit, or remove specializations that can be assigned to therapists.
                </p>
            </div>

            <SpecializationsManager initialSpecializations={specializations} />
        </div>
    );
}
```

**Step 2: Verify build**

Run: `cd frontend && bun run build`
Expected: Build fails (SpecializationsManager not found yet - expected)

**Step 3: Continue to next task**

---

## Task 7: Specializations Manager Component

**Files:**
- Create: `frontend/src/app/admin/settings/specializations/SpecializationsManager.tsx`

**Step 1: Create the client component**

```typescript
// frontend/src/app/admin/settings/specializations/SpecializationsManager.tsx
"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Loader2 } from "lucide-react";

interface Specialization {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
}

interface Props {
    initialSpecializations: Specialization[];
}

export default function SpecializationsManager({ initialSpecializations }: Props) {
    const [specializations, setSpecializations] = useState(initialSpecializations);
    const [newName, setNewName] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAdd = async () => {
        if (!newName.trim()) return;
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/admin/specializations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName.trim() }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to add");

            setSpecializations([...specializations, data.specialization].sort((a, b) =>
                a.name.localeCompare(b.name)
            ));
            setNewName("");
            setIsAdding(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (id: string) => {
        if (!editingName.trim()) return;
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/admin/specializations/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editingName.trim() }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update");

            setSpecializations(specializations.map(s =>
                s.id === id ? { ...s, name: editingName.trim() } : s
            ).sort((a, b) => a.name.localeCompare(b.name)));
            setEditingId(null);
            setEditingName("");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this specialization?")) return;
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/admin/specializations/${id}`, {
                method: "DELETE",
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to delete");

            setSpecializations(specializations.filter(s => s.id !== id));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card p-6">
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                {specializations.map((spec) => (
                    <div key={spec.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        {editingId === spec.id ? (
                            <div className="flex items-center gap-2 flex-1">
                                <input
                                    type="text"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    className="flex-1 px-3 py-1.5 border rounded-lg text-sm"
                                    autoFocus
                                />
                                <button
                                    onClick={() => handleUpdate(spec.id)}
                                    disabled={isLoading}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => { setEditingId(null); setEditingName(""); }}
                                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <span className="font-medium">{spec.name}</span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => { setEditingId(spec.id); setEditingName(spec.name); }}
                                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(spec.id)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}

                {specializations.length === 0 && !isAdding && (
                    <p className="text-gray-500 text-center py-8">
                        No specializations yet. Add your first one below.
                    </p>
                )}
            </div>

            <div className="mt-4 pt-4 border-t">
                {isAdding ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="e.g., Anxiety, Depression, Trauma"
                            className="flex-1 px-3 py-2 border rounded-lg"
                            autoFocus
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        />
                        <button
                            onClick={handleAdd}
                            disabled={isLoading || !newName.trim()}
                            className="btn btn-primary px-4 py-2"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
                        </button>
                        <button
                            onClick={() => { setIsAdding(false); setNewName(""); }}
                            className="btn btn-outline px-4 py-2"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 text-[var(--primary-teal)] hover:underline"
                    >
                        <Plus className="w-4 h-4" />
                        Add Specialization
                    </button>
                )}
            </div>
        </div>
    );
}
```

**Step 2: Verify build**

Run: `cd frontend && bun run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add frontend/src/app/admin/settings/specializations/
git commit -m "feat: add specializations management page and component"
```

---

## Task 8: Update Admin Sidebar

**Files:**
- Modify: `frontend/src/app/admin/AdminSidebar.tsx`

**Step 1: Add Settings link to sidebar**

Find the `navItems` array and add:

```typescript
{ href: "/admin/settings/specializations", icon: Settings, label: "Settings", roles: ["admin"] },
```

Also add the import at the top:
```typescript
import { Settings } from "lucide-react";
```

**Step 2: Verify build**

Run: `cd frontend && bun run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add frontend/src/app/admin/AdminSidebar.tsx
git commit -m "feat: add settings link to admin sidebar"
```

---

## Task 9: Setup UploadThing

**Files:**
- Create: `frontend/src/lib/uploadthing.ts`
- Create: `frontend/src/app/api/uploadthing/core.ts`
- Create: `frontend/src/app/api/uploadthing/route.ts`
- Modify: `frontend/.env.example`
- Modify: `frontend/package.json` (via bun add)

**Step 1: Install dependencies**

Run: `cd frontend && bun add uploadthing @uploadthing/react`

**Step 2: Create UploadThing core config**

```typescript
// frontend/src/app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
    therapistPhoto: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(async ({ req }) => {
            const session = await auth.api.getSession({ headers: req.headers });
            if (!session) throw new Error("Unauthorized");

            const userRole = (session.user as any).role;
            if (userRole !== "admin") throw new Error("Forbidden");

            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Upload complete for userId:", metadata.userId);
            console.log("File URL:", file.url);
            return { url: file.url };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
```

**Step 3: Create route handler**

```typescript
// frontend/src/app/api/uploadthing/route.ts
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

export const { GET, POST } = createRouteHandler({
    router: ourFileRouter,
});
```

**Step 4: Create client utilities**

```typescript
// frontend/src/lib/uploadthing.ts
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();
```

**Step 5: Update .env.example**

Add to `frontend/.env.example`:
```env
# UploadThing (Image uploads)
UPLOADTHING_TOKEN=
```

**Step 6: Verify build**

Run: `cd frontend && bun run build`
Expected: Build succeeds

**Step 7: Commit**

```bash
git add frontend/src/lib/uploadthing.ts frontend/src/app/api/uploadthing/ frontend/.env.example frontend/package.json frontend/bun.lockb
git commit -m "feat: setup UploadThing for image uploads"
```

---

## Task 10: Admin Therapists API - List

**Files:**
- Create: `frontend/src/app/api/admin/therapists/route.ts`

**Step 1: Create the list and create API**

```typescript
// frontend/src/app/api/admin/therapists/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AppDataSource } from "@/lib/db";
import { Therapist } from "@/entities/Therapist";
import { User } from "@/entities/User";
import { SessionType } from "@/entities/SessionType";
import { TherapistAvailability } from "@/entities/TherapistAvailability";
import { Specialization } from "@/entities/Specialization";
import { createTherapistSchema } from "@/lib/validation";
import { IsNull } from "typeorm";
import bcrypt from "bcryptjs";

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== "admin" && userRole !== "reception") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const ds = await getDataSource();
        const therapistRepo = ds.getRepository(Therapist);
        const sessionTypeRepo = ds.getRepository(SessionType);
        const specRepo = ds.getRepository(Specialization);

        const therapists = await therapistRepo.find({
            where: { deletedAt: IsNull() },
            order: { name: "ASC" },
        });

        // Enrich with session types and specialization names
        const enrichedTherapists = await Promise.all(therapists.map(async (t) => {
            const sessionTypes = await sessionTypeRepo.find({
                where: { therapistId: t.id, isActive: true }
            });

            let specializations: Specialization[] = [];
            if (t.specializationIds?.length) {
                specializations = await specRepo.findByIds(t.specializationIds);
            }

            return {
                ...t,
                sessionTypes,
                specializations,
            };
        }));

        return NextResponse.json({ success: true, therapists: enrichedTherapists });
    } catch (error) {
        console.error("Error fetching therapists:", error);
        return NextResponse.json({ error: "Failed to fetch therapists" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const validated = createTherapistSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json({ error: validated.error.errors }, { status: 400 });
        }

        const ds = await getDataSource();
        const therapistRepo = ds.getRepository(Therapist);
        const userRepo = ds.getRepository(User);
        const sessionTypeRepo = ds.getRepository(SessionType);
        const availabilityRepo = ds.getRepository(TherapistAvailability);

        // Check email uniqueness
        const existingUser = await userRepo.findOne({ where: { email: validated.data.email } });
        if (existingUser) {
            return NextResponse.json({ error: "Email already in use" }, { status: 409 });
        }

        // Generate unique slug
        let slug = generateSlug(validated.data.name);
        const existingSlug = await therapistRepo.findOne({ where: { slug } });
        if (existingSlug) {
            slug = `${slug}-${Date.now()}`;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validated.data.temporaryPassword, 10);

        // Create user
        const user = userRepo.create({
            email: validated.data.email,
            name: validated.data.name,
            emailVerified: new Date(),
            role: "therapist",
        });
        await userRepo.save(user);

        // Create therapist
        const therapist = therapistRepo.create({
            userId: user.id,
            slug,
            name: validated.data.name,
            title: validated.data.title,
            email: validated.data.email,
            phone: validated.data.phone,
            bio: validated.data.bio,
            photoUrl: validated.data.photoUrl,
            specializationIds: validated.data.specializationIds,
            defaultSessionDuration: validated.data.defaultSessionDuration,
            bufferTime: validated.data.bufferTime,
            advanceBookingDays: validated.data.advanceBookingDays,
            minBookingNotice: validated.data.minBookingNotice,
            isActive: false, // Draft by default
        });
        await therapistRepo.save(therapist);

        // Create session types
        for (const st of validated.data.sessionTypes) {
            const sessionType = sessionTypeRepo.create({
                therapistId: therapist.id,
                ...st,
                isActive: true,
            });
            await sessionTypeRepo.save(sessionType);
        }

        // Create availability if provided
        if (validated.data.availability?.length) {
            for (const av of validated.data.availability) {
                const availability = availabilityRepo.create({
                    therapistId: therapist.id,
                    ...av,
                    isActive: true,
                });
                await availabilityRepo.save(availability);
            }
        }

        // TODO: Send welcome email with credentials

        return NextResponse.json({
            success: true,
            therapist: { ...therapist, user: { id: user.id, email: user.email } }
        }, { status: 201 });
    } catch (error) {
        console.error("Error creating therapist:", error);
        return NextResponse.json({ error: "Failed to create therapist" }, { status: 500 });
    }
}
```

**Step 2: Verify build**

Run: `cd frontend && bun run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add frontend/src/app/api/admin/therapists/route.ts
git commit -m "feat: add admin therapists list and create API"
```

---

## Task 11: Admin Therapists API - Detail, Update, Delete

**Files:**
- Create: `frontend/src/app/api/admin/therapists/[id]/route.ts`

**Step 1: Create the dynamic route**

```typescript
// frontend/src/app/api/admin/therapists/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AppDataSource } from "@/lib/db";
import { Therapist } from "@/entities/Therapist";
import { SessionType } from "@/entities/SessionType";
import { TherapistAvailability } from "@/entities/TherapistAvailability";
import { Booking } from "@/entities/Booking";
import { Specialization } from "@/entities/Specialization";
import { updateTherapistSchema } from "@/lib/validation";
import { IsNull, MoreThanOrEqual } from "typeorm";

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== "admin" && userRole !== "reception") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const ds = await getDataSource();
        const therapistRepo = ds.getRepository(Therapist);
        const sessionTypeRepo = ds.getRepository(SessionType);
        const availabilityRepo = ds.getRepository(TherapistAvailability);
        const bookingRepo = ds.getRepository(Booking);
        const specRepo = ds.getRepository(Specialization);

        const therapist = await therapistRepo.findOne({ where: { id, deletedAt: IsNull() } });
        if (!therapist) {
            return NextResponse.json({ error: "Therapist not found" }, { status: 404 });
        }

        const sessionTypes = await sessionTypeRepo.find({
            where: { therapistId: id },
            order: { name: "ASC" }
        });

        const availability = await availabilityRepo.find({
            where: { therapistId: id },
            order: { dayOfWeek: "ASC", startTime: "ASC" }
        });

        const upcomingBookings = await bookingRepo.find({
            where: {
                therapistId: id,
                status: "confirmed",
                startDatetime: MoreThanOrEqual(new Date())
            },
            order: { startDatetime: "ASC" },
            take: 10
        });

        const totalBookings = await bookingRepo.count({ where: { therapistId: id } });
        const completedBookings = await bookingRepo.count({ where: { therapistId: id, status: "completed" } });

        let specializations: Specialization[] = [];
        if (therapist.specializationIds?.length) {
            specializations = await specRepo.findByIds(therapist.specializationIds);
        }

        return NextResponse.json({
            success: true,
            therapist: {
                ...therapist,
                sessionTypes,
                availability,
                specializations,
                stats: {
                    totalBookings,
                    completedBookings,
                    upcomingCount: upcomingBookings.length,
                },
                upcomingBookings,
            }
        });
    } catch (error) {
        console.error("Error fetching therapist:", error);
        return NextResponse.json({ error: "Failed to fetch therapist" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const validated = updateTherapistSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json({ error: validated.error.errors }, { status: 400 });
        }

        const ds = await getDataSource();
        const therapistRepo = ds.getRepository(Therapist);

        const therapist = await therapistRepo.findOne({ where: { id, deletedAt: IsNull() } });
        if (!therapist) {
            return NextResponse.json({ error: "Therapist not found" }, { status: 404 });
        }

        Object.assign(therapist, validated.data);
        await therapistRepo.save(therapist);

        return NextResponse.json({ success: true, therapist });
    } catch (error) {
        console.error("Error updating therapist:", error);
        return NextResponse.json({ error: "Failed to update therapist" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const ds = await getDataSource();
        const therapistRepo = ds.getRepository(Therapist);

        const therapist = await therapistRepo.findOne({ where: { id, deletedAt: IsNull() } });
        if (!therapist) {
            return NextResponse.json({ error: "Therapist not found" }, { status: 404 });
        }

        // Soft delete
        therapist.deletedAt = new Date();
        therapist.isActive = false;
        await therapistRepo.save(therapist);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting therapist:", error);
        return NextResponse.json({ error: "Failed to delete therapist" }, { status: 500 });
    }
}
```

**Step 2: Verify build**

Run: `cd frontend && bun run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add frontend/src/app/api/admin/therapists/[id]/route.ts
git commit -m "feat: add admin therapist detail, update, and soft delete API"
```

---

## Task 12: Admin Therapists API - Publish/Unpublish/Restore

**Files:**
- Create: `frontend/src/app/api/admin/therapists/[id]/publish/route.ts`
- Create: `frontend/src/app/api/admin/therapists/[id]/unpublish/route.ts`
- Create: `frontend/src/app/api/admin/therapists/[id]/restore/route.ts`
- Create: `frontend/src/app/api/admin/therapists/archived/route.ts`

**Step 1: Create publish route**

```typescript
// frontend/src/app/api/admin/therapists/[id]/publish/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AppDataSource } from "@/lib/db";
import { Therapist } from "@/entities/Therapist";
import { IsNull } from "typeorm";

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const ds = await getDataSource();
        const therapistRepo = ds.getRepository(Therapist);

        const therapist = await therapistRepo.findOne({ where: { id, deletedAt: IsNull() } });
        if (!therapist) {
            return NextResponse.json({ error: "Therapist not found" }, { status: 404 });
        }

        therapist.isActive = true;
        await therapistRepo.save(therapist);

        return NextResponse.json({ success: true, therapist });
    } catch (error) {
        console.error("Error publishing therapist:", error);
        return NextResponse.json({ error: "Failed to publish therapist" }, { status: 500 });
    }
}
```

**Step 2: Create unpublish route**

```typescript
// frontend/src/app/api/admin/therapists/[id]/unpublish/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AppDataSource } from "@/lib/db";
import { Therapist } from "@/entities/Therapist";
import { IsNull } from "typeorm";

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const ds = await getDataSource();
        const therapistRepo = ds.getRepository(Therapist);

        const therapist = await therapistRepo.findOne({ where: { id, deletedAt: IsNull() } });
        if (!therapist) {
            return NextResponse.json({ error: "Therapist not found" }, { status: 404 });
        }

        therapist.isActive = false;
        await therapistRepo.save(therapist);

        return NextResponse.json({ success: true, therapist });
    } catch (error) {
        console.error("Error unpublishing therapist:", error);
        return NextResponse.json({ error: "Failed to unpublish therapist" }, { status: 500 });
    }
}
```

**Step 3: Create restore route**

```typescript
// frontend/src/app/api/admin/therapists/[id]/restore/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AppDataSource } from "@/lib/db";
import { Therapist } from "@/entities/Therapist";
import { Not, IsNull } from "typeorm";

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const ds = await getDataSource();
        const therapistRepo = ds.getRepository(Therapist);

        const therapist = await therapistRepo.findOne({ where: { id, deletedAt: Not(IsNull()) } });
        if (!therapist) {
            return NextResponse.json({ error: "Archived therapist not found" }, { status: 404 });
        }

        therapist.deletedAt = null;
        await therapistRepo.save(therapist);

        return NextResponse.json({ success: true, therapist });
    } catch (error) {
        console.error("Error restoring therapist:", error);
        return NextResponse.json({ error: "Failed to restore therapist" }, { status: 500 });
    }
}
```

**Step 4: Create archived list route**

```typescript
// frontend/src/app/api/admin/therapists/archived/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AppDataSource } from "@/lib/db";
import { Therapist } from "@/entities/Therapist";
import { Not, IsNull } from "typeorm";

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const ds = await getDataSource();
        const therapistRepo = ds.getRepository(Therapist);

        const therapists = await therapistRepo.find({
            where: { deletedAt: Not(IsNull()) },
            order: { deletedAt: "DESC" },
        });

        return NextResponse.json({ success: true, therapists });
    } catch (error) {
        console.error("Error fetching archived therapists:", error);
        return NextResponse.json({ error: "Failed to fetch archived therapists" }, { status: 500 });
    }
}
```

**Step 5: Verify build**

Run: `cd frontend && bun run build`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add frontend/src/app/api/admin/therapists/
git commit -m "feat: add publish, unpublish, restore, and archived APIs"
```

---

## Remaining Tasks (Summary)

The plan continues with these tasks (to be detailed in next section):

- **Task 13:** Create Therapist Form Component (multi-step)
- **Task 14:** Create Therapist Page (`/admin/therapists/new`)
- **Task 15:** Therapist Detail Page (`/admin/therapists/[id]`)
- **Task 16:** Edit Therapist Page (`/admin/therapists/[id]/edit`)
- **Task 17:** Archived Therapists Page
- **Task 18:** Update Admin Therapists List Page
- **Task 19:** Update Therapist Portal Settings (read-only profile)
- **Task 20:** Update Public Therapist Pages (show specializations)
- **Task 21:** Create Therapist Welcome Email Template
- **Task 22:** Final build verification and cleanup

---

## Task 13: Create Therapist Form Component

**Files:**
- Create: `frontend/src/app/admin/therapists/new/CreateTherapistForm.tsx`

**Step 1: Create the multi-step form component**

This is a large file. Create it with these sections:
- Step 1: Profile Info (name, title, email, phone, bio, photo upload, specializations)
- Step 2: Session Types (add multiple with name, duration, meeting type, price)
- Step 3: Weekly Availability (day selector with time ranges)
- Step 4: Review & Create

Key patterns:
- Use react-hook-form with zodResolver
- Use useUploadThing for photo upload
- Multi-step wizard with progress indicator
- Fetch specializations on mount
- Submit to `/api/admin/therapists`

**Step 2: Verify build**

Run: `cd frontend && bun run build`

**Step 3: Commit**

```bash
git add frontend/src/app/admin/therapists/new/CreateTherapistForm.tsx
git commit -m "feat: add create therapist multi-step form"
```

---

## Task 14: Create Therapist Page

**Files:**
- Create: `frontend/src/app/admin/therapists/new/page.tsx`

**Step 1: Create the page**

```typescript
// frontend/src/app/admin/therapists/new/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppDataSource } from "@/lib/db";
import { Specialization } from "@/entities/Specialization";
import CreateTherapistForm from "./CreateTherapistForm";

export const metadata: Metadata = {
    title: "Add Therapist | Admin | Mindweal by Pihu Suri",
};

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

async function getSpecializations() {
    const ds = await getDataSource();
    const repo = ds.getRepository(Specialization);
    return repo.find({ where: { isActive: true }, order: { name: "ASC" } });
}

export default async function NewTherapistPage() {
    const specializations = await getSpecializations();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/therapists"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Add New Therapist</h1>
                    <p className="text-gray-600">Create a new therapist profile and account</p>
                </div>
            </div>

            <CreateTherapistForm specializations={specializations} />
        </div>
    );
}
```

**Step 2: Verify build**

Run: `cd frontend && bun run build`

**Step 3: Commit**

```bash
git add frontend/src/app/admin/therapists/new/page.tsx
git commit -m "feat: add create therapist page"
```

---

## Task 15: Therapist Detail Page

**Files:**
- Create: `frontend/src/app/admin/therapists/[id]/page.tsx`
- Create: `frontend/src/app/admin/therapists/[id]/TherapistActions.tsx`

**Step 1: Create the detail page**

Shows therapist info with sections:
- Header: Photo, name, title, status badge, action buttons
- Profile section: Bio, email, phone, specializations
- Session Types table
- Weekly Availability (read-only)
- Recent Bookings
- Stats cards

**Step 2: Create TherapistActions component**

Client component for:
- Publish/Unpublish toggle
- Delete (with confirmation)
- Edit button

**Step 3: Verify build**

Run: `cd frontend && bun run build`

**Step 4: Commit**

```bash
git add frontend/src/app/admin/therapists/[id]/
git commit -m "feat: add therapist detail page with actions"
```

---

## Task 16: Edit Therapist Page

**Files:**
- Create: `frontend/src/app/admin/therapists/[id]/edit/page.tsx`
- Create: `frontend/src/app/admin/therapists/[id]/edit/EditTherapistForm.tsx`

**Step 1: Create the edit page and form**

Similar to create form but:
- Pre-populated with existing data
- No password field
- Session types managed separately (inline add/edit/delete)
- Does not include availability (therapist manages that)

**Step 2: Verify build**

Run: `cd frontend && bun run build`

**Step 3: Commit**

```bash
git add frontend/src/app/admin/therapists/[id]/edit/
git commit -m "feat: add edit therapist page and form"
```

---

## Task 17: Archived Therapists Page

**Files:**
- Create: `frontend/src/app/admin/therapists/archived/page.tsx`

**Step 1: Create the archived list page**

```typescript
// frontend/src/app/admin/therapists/archived/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { AppDataSource } from "@/lib/db";
import { Therapist } from "@/entities/Therapist";
import { Not, IsNull } from "typeorm";
import RestoreButton from "./RestoreButton";

export const metadata: Metadata = {
    title: "Archived Therapists | Admin | Mindweal by Pihu Suri",
};

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

async function getArchivedTherapists() {
    const ds = await getDataSource();
    const repo = ds.getRepository(Therapist);
    return repo.find({
        where: { deletedAt: Not(IsNull()) },
        order: { deletedAt: "DESC" },
    });
}

export default async function ArchivedTherapistsPage() {
    const therapists = await getArchivedTherapists();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/therapists"
                    className="p-2 hover:bg-gray-100 rounded-lg"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Archived Therapists</h1>
                    <p className="text-gray-600">Restore or permanently manage archived therapists</p>
                </div>
            </div>

            {therapists.length === 0 ? (
                <div className="card p-12 text-center">
                    <p className="text-gray-500">No archived therapists</p>
                </div>
            ) : (
                <div className="card divide-y">
                    {therapists.map((t) => (
                        <div key={t.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {t.photoUrl ? (
                                    <img src={t.photoUrl} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                        👤
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium">{t.name}</p>
                                    <p className="text-sm text-gray-500">{t.title}</p>
                                    <p className="text-xs text-gray-400">
                                        Archived {t.deletedAt?.toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <RestoreButton therapistId={t.id} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
```

**Step 2: Create RestoreButton component**

```typescript
// frontend/src/app/admin/therapists/archived/RestoreButton.tsx
"use client";

import { useState } from "react";
import { RotateCcw, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RestoreButton({ therapistId }: { therapistId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleRestore = async () => {
        if (!confirm("Restore this therapist?")) return;
        setIsLoading(true);

        try {
            const res = await fetch(`/api/admin/therapists/${therapistId}/restore`, {
                method: "POST",
            });
            if (res.ok) {
                router.refresh();
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleRestore}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[var(--primary-teal)] text-white rounded-lg hover:bg-[var(--primary-teal-dark)]"
        >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            Restore
        </button>
    );
}
```

**Step 3: Verify build**

Run: `cd frontend && bun run build`

**Step 4: Commit**

```bash
git add frontend/src/app/admin/therapists/archived/
git commit -m "feat: add archived therapists page with restore"
```

---

## Task 18: Update Admin Therapists List Page

**Files:**
- Modify: `frontend/src/app/admin/therapists/page.tsx`

**Step 1: Enhance the existing page**

Update to:
- Add "Add Therapist" button linking to `/admin/therapists/new`
- Add "View Archived" link
- Show status badge (Draft/Published)
- Show specializations as tags
- Link cards to detail page `/admin/therapists/[id]`

**Step 2: Verify build**

Run: `cd frontend && bun run build`

**Step 3: Commit**

```bash
git add frontend/src/app/admin/therapists/page.tsx
git commit -m "feat: enhance admin therapists list with status and links"
```

---

## Task 19: Update Therapist Portal Settings

**Files:**
- Modify: `frontend/src/app/therapist/settings/page.tsx`
- Modify: `frontend/src/app/therapist/settings/TherapistSettingsForm.tsx`

**Step 1: Update settings page**

Change to show read-only profile with note "Contact admin to update your profile information."

Keep editable:
- Nothing (all admin-controlled now)

Show read-only:
- Name, title, email, phone, bio, photo, specializations
- Session types (view only)
- Booking settings (view only)

**Step 2: Verify build**

Run: `cd frontend && bun run build`

**Step 3: Commit**

```bash
git add frontend/src/app/therapist/settings/
git commit -m "feat: make therapist settings read-only (admin-controlled)"
```

---

## Task 20: Update Public Therapist Pages

**Files:**
- Modify: `frontend/src/app/therapists/page.tsx`
- Modify: `frontend/src/app/therapists/[slug]/page.tsx`

**Step 1: Update list page to show specializations**

Fetch specializations for each therapist and display as tags.

**Step 2: Update detail page to show specializations**

Replace session type tags in hero with specialization tags.
Show session types in sidebar.

**Step 3: Verify build**

Run: `cd frontend && bun run build`

**Step 4: Commit**

```bash
git add frontend/src/app/therapists/
git commit -m "feat: show specializations on public therapist pages"
```

---

## Task 21: Create Therapist Welcome Email Template

**Files:**
- Create: `frontend/src/templates/TherapistWelcome.tsx`

**Step 1: Create the email template**

```typescript
// frontend/src/templates/TherapistWelcome.tsx
import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
} from "@react-email/components";

interface TherapistWelcomeProps {
    therapistName: string;
    email: string;
    temporaryPassword: string;
    loginUrl: string;
}

export default function TherapistWelcome({
    therapistName,
    email,
    temporaryPassword,
    loginUrl,
}: TherapistWelcomeProps) {
    return (
        <Html>
            <Head />
            <Preview>Welcome to Mindweal by Pihu Suri - Your account is ready</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Welcome to Mindweal</Heading>

                    <Text style={text}>Hi {therapistName},</Text>

                    <Text style={text}>
                        Your therapist account has been created. You can now log in to access your portal
                        and manage your availability.
                    </Text>

                    <Section style={codeBox}>
                        <Text style={codeLabel}>Your login credentials:</Text>
                        <Text style={codeText}>Email: {email}</Text>
                        <Text style={codeText}>Temporary Password: {temporaryPassword}</Text>
                    </Section>

                    <Text style={text}>
                        Please change your password after your first login.
                    </Text>

                    <Link href={loginUrl} style={button}>
                        Log In to Your Portal
                    </Link>

                    <Text style={footer}>
                        If you have any questions, please contact the admin team.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

const main = { backgroundColor: "#f6f9fc", fontFamily: "sans-serif" };
const container = { margin: "0 auto", padding: "40px 20px", maxWidth: "560px" };
const h1 = { color: "#00A99D", fontSize: "24px", fontWeight: "bold", margin: "0 0 20px" };
const text = { color: "#525f7f", fontSize: "16px", lineHeight: "24px", margin: "0 0 16px" };
const codeBox = { background: "#f4f4f4", borderRadius: "4px", padding: "16px", margin: "24px 0" };
const codeLabel = { color: "#525f7f", fontSize: "14px", margin: "0 0 8px" };
const codeText = { color: "#000", fontSize: "14px", fontFamily: "monospace", margin: "4px 0" };
const button = { background: "#00A99D", borderRadius: "4px", color: "#fff", display: "inline-block", fontSize: "16px", padding: "12px 24px", textDecoration: "none" };
const footer = { color: "#8898aa", fontSize: "14px", marginTop: "32px" };
```

**Step 2: Verify build**

Run: `cd frontend && bun run build`

**Step 3: Commit**

```bash
git add frontend/src/templates/TherapistWelcome.tsx
git commit -m "feat: add therapist welcome email template"
```

---

## Task 22: Final Build Verification

**Step 1: Run full build**

```bash
cd frontend && bun run build
```

Expected: Build succeeds with no errors

**Step 2: Run lint**

```bash
cd frontend && bun run lint
```

Expected: No lint errors

**Step 3: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup for admin therapist management"
```

---

## Summary

This implementation plan covers:

1. **Database:** New Specialization entity, updated Therapist with soft delete
2. **APIs:** Full CRUD for specializations and therapists, plus publish/unpublish/restore
3. **Admin Pages:** Create, view, edit, and archive therapists; manage specializations
4. **Therapist Portal:** Read-only profile (admin-controlled)
5. **Public Pages:** Display specializations
6. **Email:** Welcome template for new therapists
7. **Uploads:** UploadThing integration for photos

Total: 22 tasks with incremental commits.
