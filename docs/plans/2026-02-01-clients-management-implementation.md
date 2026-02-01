# Clients Management Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a dedicated Clients management section in the admin panel with role-based access control.

**Architecture:** 
- New ClientProfile entity for client-specific data (emergency contact, consent)
- Role-based API routes that filter clients based on therapist relationships
- Dedicated UI pages for listing, viewing, and editing clients
- Update existing Users page to exclude clients

**Tech Stack:**
- TypeORM (entity, migrations)
- Next.js 16 App Router (pages, API routes)
- Zod (validation schemas)
- React Hook Form (forms)
- Tailwind CSS v4 (styling)

---

## Phase 1: Database & Entity Setup

### Task 1.1: Create ClientProfile Entity

**Files:**
- Create: `src/entities/ClientProfile.ts`

**Step 1: Create ClientProfile entity**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("client_profiles")
export class ClientProfile {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  userId!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  emergencyContactName!: string | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  emergencyContactPhone!: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  emergencyContactRelationship!: string | null;

  @Column({ default: false })
  consentFormSigned!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
```

**Step 2: Verify TypeScript compiles**

Run: `bun run build`
Expected: Build succeeds with no errors

**Step 3: Commit**

```bash
git add src/entities/ClientProfile.ts
git commit -m "feat: add ClientProfile entity"
```

---

### Task 1.2: Create Migration

**Files:**
- Create: `migrations/CreateClientProfiles.ts`

**Step 1: Generate migration file**

Run: `bun run migration:create migrations/CreateClientProfiles`
Expected: New migration file created in migrations/

**Step 2: Write migration up method**

```typescript
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class CreateClientProfiles1738425600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create client_profiles table
    await queryRunner.createTable(
      new Table({
        name: "client_profiles",
        columns: [
          {
            name: "id",
            type: "char",
            length: "36",
            isPrimary: true,
          },
          {
            name: "userId",
            type: "char",
            length: "36",
            isUnique: true,
          },
          {
            name: "emergencyContactName",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "emergencyContactPhone",
            type: "varchar",
            length: "20",
            isNullable: true,
          },
          {
            name: "emergencyContactRelationship",
            type: "varchar",
            length: "50",
            isNullable: true,
          },
          {
            name: "consentFormSigned",
            type: "boolean",
            default: false,
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
        ],
      }),
      true
    );

    // Create index on userId
    await queryRunner.createIndex(
      "client_profiles",
      new TableIndex({
        name: "IDX_client_profiles_userId",
        columnNames: ["userId"],
      })
    );

    // Create foreign key to users table
    await queryRunner.createForeignKey(
      "client_profiles",
      new TableForeignKey({
        columnNames: ["userId"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );

    // Backfill profiles for existing clients
    await queryRunner.query(`
      INSERT INTO client_profiles (id, userId, consentFormSigned, createdAt, updatedAt)
      SELECT UUID(), id, false, NOW(), NOW()
      FROM users
      WHERE role = 'client'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("client_profiles");
  }
}
```

**Step 3: Commit**

```bash
git add migrations/CreateClientProfiles*.ts
git commit -m "feat: add migration for client_profiles table"
```

---

### Task 1.3: Run Migration

**Files:**
- No file changes

**Step 1: Run migration**

Run: `bun run migration:run`
Expected: Migration runs successfully, client_profiles table created

**Step 2: Verify in database**

Run: `docker exec -it mindweal-mysql mysql -u root -p -e "USE mindweal; DESCRIBE client_profiles;"`
Expected: Table structure matches entity definition

**Step 3: Verify backfill**

Run: `docker exec -it mindweal-mysql mysql -u root -p -e "USE mindweal; SELECT COUNT(*) FROM client_profiles;"`
Expected: Count matches number of users with role='client'

---

## Phase 2: API Routes

### Task 2.1: Add Validation Schemas

**Files:**
- Modify: `src/lib/validation.ts`

**Step 1: Add updateClientProfileSchema**

Add to existing file:

```typescript
// Client Profile validation
export const updateClientProfileSchema = z.object({
  emergencyContactName: z.string().min(1).max(100).nullable(),
  emergencyContactPhone: z
    .string()
    .regex(/^\+?[0-9\s\-()]+$/, "Invalid phone number format")
    .nullable(),
  emergencyContactRelationship: z.string().max(50).nullable(),
  consentFormSigned: z.boolean(),
});

export type UpdateClientProfileInput = z.infer<typeof updateClientProfileSchema>;
```

**Step 2: Verify TypeScript compiles**

Run: `bun run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/lib/validation.ts
git commit -m "feat: add client profile validation schemas"
```

---

### Task 2.2: Create GET /api/admin/clients Route

**Files:**
- Create: `src/app/api/(admin)/admin/clients/route.ts`

**Step 1: Create route handler**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-middleware";
import { getDataSource } from "@/lib/db";
import { User } from "@/entities/User";
import { ClientProfile } from "@/entities/ClientProfile";
import { Therapist } from "@/entities/Therapist";
import { Booking } from "@/entities/Booking";
import type { AuthSession } from "@/types/auth";
import { In } from "typeorm";

export async function GET(request: NextRequest) {
  try {
    // 1. Auth check
    const session = (await getServerSession()) as AuthSession | null;
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Role check
    if (!["admin", "reception", "therapist"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ds = await getDataSource();

    // 3. Get clients based on role
    let clients: User[];

    if (session.user.role === "therapist") {
      // Find therapist record
      const therapist = await ds.getRepository(Therapist).findOne({
        where: [{ userId: session.user.id }, { id: session.user.therapistId! }],
      });

      if (!therapist) {
        return NextResponse.json(
          { error: "Therapist profile not found" },
          { status: 404 }
        );
      }

      // Get distinct client IDs from bookings
      const bookings = await ds.getRepository(Booking).find({
        where: { therapistId: therapist.id },
        select: ["clientId"],
      });

      const clientIds = [
        ...new Set(bookings.map((b) => b.clientId).filter(Boolean)),
      ] as string[];

      if (clientIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: { clients: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } },
        });
      }

      // Fetch clients with profiles
      clients = await ds.getRepository(User).find({
        where: { id: In(clientIds), role: "client" },
        relations: ["clientProfile"],
        order: { createdAt: "DESC" },
      });
    } else {
      // Admin and reception see all clients
      clients = await ds.getRepository(User).find({
        where: { role: "client" },
        relations: ["clientProfile"],
        order: { createdAt: "DESC" },
      });
    }

    // 4. Get booking stats for each client
    const clientsWithStats = await Promise.all(
      clients.map(async (client) => {
        const bookings = await ds.getRepository(Booking).find({
          where: { clientId: client.id },
          relations: ["therapist"],
          order: { startDatetime: "DESC" },
        });

        const totalSessions = bookings.length;
        const lastSessionDate = bookings[0]?.startDatetime || null;
        const nextSession = bookings.find(
          (b) => b.status === "confirmed" && new Date(b.startDatetime) > new Date()
        );

        // Calculate primary therapist (most bookings with)
        const therapistCounts = new Map<string, number>();
        bookings.forEach((b) => {
          const count = therapistCounts.get(b.therapistId) || 0;
          therapistCounts.set(b.therapistId, count + 1);
        });

        let primaryTherapist = null;
        if (therapistCounts.size > 0) {
          const [therapistId] = Array.from(therapistCounts.entries()).sort(
            (a, b) => b[1] - a[1]
          )[0];
          const therapist = await ds.getRepository(Therapist).findOne({
            where: { id: therapistId },
            select: ["id", "name"],
          });
          primaryTherapist = therapist ? { id: therapist.id, name: therapist.name } : null;
        }

        return {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          createdAt: client.createdAt,
          profile: {
            emergencyContactName: client.clientProfile?.emergencyContactName || null,
            emergencyContactPhone: client.clientProfile?.emergencyContactPhone || null,
            emergencyContactRelationship:
              client.clientProfile?.emergencyContactRelationship || null,
            consentFormSigned: client.clientProfile?.consentFormSigned || false,
          },
          stats: {
            totalSessions,
            lastSessionDate,
            nextSessionDate: nextSession?.startDatetime || null,
            primaryTherapist,
          },
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        clients: clientsWithStats,
        pagination: {
          total: clientsWithStats.length,
          page: 1,
          limit: 50,
          pages: Math.ceil(clientsWithStats.length / 50),
        },
      },
    });
  } catch (error) {
    console.error("Get clients error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

**Step 2: Verify TypeScript compiles**

Run: `bun run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/api/\(admin\)/admin/clients/route.ts
git commit -m "feat: add GET /api/admin/clients route"
```

---

### Task 2.3: Create GET /api/admin/clients/[id] Route

**Files:**
- Create: `src/app/api/(admin)/admin/clients/[id]/route.ts`

**Step 1: Create route handler**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-middleware";
import { getDataSource } from "@/lib/db";
import { User } from "@/entities/User";
import { ClientProfile } from "@/entities/ClientProfile";
import { Therapist } from "@/entities/Therapist";
import { Booking } from "@/entities/Booking";
import type { AuthSession } from "@/types/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Auth check
    const session = (await getServerSession()) as AuthSession | null;
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Role check
    if (!["admin", "reception", "therapist"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ds = await getDataSource();

    // 3. Get client
    const client = await ds.getRepository(User).findOne({
      where: { id, role: "client" },
      relations: ["clientProfile"],
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // 4. For therapists, verify they have bookings with this client
    if (session.user.role === "therapist") {
      const therapist = await ds.getRepository(Therapist).findOne({
        where: [{ userId: session.user.id }, { id: session.user.therapistId! }],
      });

      if (!therapist) {
        return NextResponse.json(
          { error: "Therapist profile not found" },
          { status: 404 }
        );
      }

      const hasBooking = await ds.getRepository(Booking).findOne({
        where: {
          therapistId: therapist.id,
          clientId: id,
        },
      });

      if (!hasBooking) {
        return NextResponse.json(
          { error: "You don't have access to this client" },
          { status: 403 }
        );
      }

      // Get only this therapist's sessions
      const bookings = await ds.getRepository(Booking).find({
        where: { clientId: id, therapistId: therapist.id },
        relations: ["therapist", "sessionType"],
        order: { startDatetime: "DESC" },
      });

      return NextResponse.json({
        success: true,
        data: {
          client: {
            id: client.id,
            name: client.name,
            email: client.email,
            phone: client.phone,
            timezone: client.timezone,
            createdAt: client.createdAt,
          },
          profile: client.clientProfile || {
            emergencyContactName: null,
            emergencyContactPhone: null,
            emergencyContactRelationship: null,
            consentFormSigned: false,
          },
          sessionHistory: bookings.map((b) => ({
            id: b.id,
            bookingReference: b.bookingReference,
            startDatetime: b.startDatetime,
            endDatetime: b.endDatetime,
            status: b.status,
            meetingType: b.meetingType,
            therapist: { id: b.therapist.id, name: b.therapist.name },
            sessionType: b.sessionType
              ? { id: b.sessionType.id, name: b.sessionType.name, duration: b.sessionType.duration }
              : null,
          })),
          stats: {
            totalSessions: bookings.length,
            completed: bookings.filter((b) => b.status === "completed").length,
            cancelled: bookings.filter((b) => b.status === "cancelled").length,
            noShow: bookings.filter((b) => b.status === "no_show").length,
          },
        },
      });
    }

    // 5. Admin/reception see all sessions
    const bookings = await ds.getRepository(Booking).find({
      where: { clientId: id },
      relations: ["therapist", "sessionType"],
      order: { startDatetime: "DESC" },
    });

    return NextResponse.json({
      success: true,
      data: {
        client: {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          timezone: client.timezone,
          createdAt: client.createdAt,
        },
        profile: client.clientProfile || {
          emergencyContactName: null,
          emergencyContactPhone: null,
          emergencyContactRelationship: null,
          consentFormSigned: false,
        },
        sessionHistory: bookings.map((b) => ({
          id: b.id,
          bookingReference: b.bookingReference,
          startDatetime: b.startDatetime,
          endDatetime: b.endDatetime,
          status: b.status,
          meetingType: b.meetingType,
          therapist: { id: b.therapist.id, name: b.therapist.name },
          sessionType: b.sessionType
            ? { id: b.sessionType.id, name: b.sessionType.name, duration: b.sessionType.duration }
            : null,
        })),
        stats: {
          totalSessions: bookings.length,
          completed: bookings.filter((b) => b.status === "completed").length,
          cancelled: bookings.filter((b) => b.status === "cancelled").length,
          noShow: bookings.filter((b) => b.status === "no_show").length,
        },
      },
    });
  } catch (error) {
    console.error("Get client detail error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

**Step 2: Verify TypeScript compiles**

Run: `bun run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/api/\(admin\)/admin/clients/\[id\]/route.ts
git commit -m "feat: add GET /api/admin/clients/[id] route"
```

---

### Task 2.4: Create PUT /api/admin/clients/[id] Route

**Files:**
- Modify: `src/app/api/(admin)/admin/clients/[id]/route.ts`

**Step 1: Add PUT handler to existing file**

Add to the same file as GET:

```typescript
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Auth check
    const session = (await getServerSession()) as AuthSession | null;
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Role check
    if (!["admin", "reception", "therapist"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ds = await getDataSource();

    // 3. Verify client exists
    const client = await ds.getRepository(User).findOne({
      where: { id, role: "client" },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // 4. For therapists, verify access
    if (session.user.role === "therapist") {
      const therapist = await ds.getRepository(Therapist).findOne({
        where: [{ userId: session.user.id }, { id: session.user.therapistId! }],
      });

      if (!therapist) {
        return NextResponse.json(
          { error: "Therapist profile not found" },
          { status: 404 }
        );
      }

      const hasBooking = await ds.getRepository(Booking).findOne({
        where: {
          therapistId: therapist.id,
          clientId: id,
        },
      });

      if (!hasBooking) {
        return NextResponse.json(
          { error: "You don't have access to this client" },
          { status: 403 }
        );
      }
    }

    // 5. Validate input
    const body = await request.json();
    const validated = updateClientProfileSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    // 6. Get or create profile
    let profile = await ds.getRepository(ClientProfile).findOne({
      where: { userId: id },
    });

    if (!profile) {
      // Lazy initialization
      profile = ds.getRepository(ClientProfile).create({
        userId: id,
        ...validated.data,
      });
    } else {
      // Update existing
      Object.assign(profile, validated.data);
    }

    await ds.getRepository(ClientProfile).save(profile);

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          emergencyContactName: profile.emergencyContactName,
          emergencyContactPhone: profile.emergencyContactPhone,
          emergencyContactRelationship: profile.emergencyContactRelationship,
          consentFormSigned: profile.consentFormSigned,
        },
      },
    });
  } catch (error) {
    console.error("Update client profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

**Step 2: Add import for validation schema**

Add at top of file:

```typescript
import { updateClientProfileSchema } from "@/lib/validation";
```

**Step 3: Verify TypeScript compiles**

Run: `bun run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/app/api/\(admin\)/admin/clients/\[id\]/route.ts
git commit -m "feat: add PUT /api/admin/clients/[id] route"
```

---

## Phase 3: Client List Page

### Task 3.1: Create Clients List Page

**Files:**
- Create: `src/app/(portals)/admin/clients/page.tsx`

**Step 1: Create page component**

```typescript
import { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { getServerSession } from "@/lib/auth-middleware";
import { getDataSource } from "@/lib/db";
import { User } from "@/entities/User";
import { Therapist } from "@/entities/Therapist";
import { Booking } from "@/entities/Booking";
import type { AuthSession } from "@/types/auth";
import { In } from "typeorm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Clients | Admin | Mindweal by Pihu Suri",
  description: "Manage client records and session history",
};

async function getClients(session: AuthSession) {
  const ds = await getDataSource();

  let clients: User[];

  if (session.user.role === "therapist") {
    const therapist = await ds.getRepository(Therapist).findOne({
      where: [{ userId: session.user.id }, { id: session.user.therapistId! }],
    });

    if (!therapist) {
      return [];
    }

    const bookings = await ds.getRepository(Booking).find({
      where: { therapistId: therapist.id },
      select: ["clientId"],
    });

    const clientIds = [
      ...new Set(bookings.map((b) => b.clientId).filter(Boolean)),
    ] as string[];

    if (clientIds.length === 0) {
      return [];
    }

    clients = await ds.getRepository(User).find({
      where: { id: In(clientIds), role: "client" },
      relations: ["clientProfile"],
      order: { createdAt: "DESC" },
    });
  } else {
    clients = await ds.getRepository(User).find({
      where: { role: "client" },
      relations: ["clientProfile"],
      order: { createdAt: "DESC" },
    });
  }

  // Get booking stats for each client
  const clientsWithStats = await Promise.all(
    clients.map(async (client) => {
      const bookings = await ds.getRepository(Booking).find({
        where: { clientId: client.id },
        order: { startDatetime: "DESC" },
      });

      const totalSessions = bookings.length;
      const lastSessionDate = bookings[0]?.startDatetime || null;
      const nextSession = bookings.find(
        (b) => b.status === "confirmed" && new Date(b.startDatetime) > new Date()
      );

      return {
        ...client,
        stats: {
          totalSessions,
          lastSessionDate,
          nextSessionDate: nextSession?.startDatetime || null,
        },
      };
    })
  );

  return clientsWithStats;
}

export default async function ClientsPage() {
  const session = (await getServerSession()) as AuthSession | null;

  if (!session) {
    return null;
  }

  const clients = await getClients(session);

  const stats = {
    total: clients.length,
    consentSigned: clients.filter((c) => c.clientProfile?.consentFormSigned).length,
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="portal-title">Clients</h1>
          <p className="text-gray-600 text-sm">
            Manage client records and session history
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div className="portal-card p-3">
          <div className="text-xs text-gray-600">Total Clients</div>
          <div className="text-2xl font-semibold text-primary">{stats.total}</div>
        </div>
        <div className="portal-card p-3">
          <div className="text-xs text-gray-600">Consent Signed</div>
          <div className="text-2xl font-semibold text-green-600">
            {stats.consentSigned}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="portal-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th className="text-center">Sessions</th>
                <th>Last Session</th>
                <th>Next Session</th>
                <th className="text-center">Consent</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    No clients found
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id}>
                    <td className="font-medium">{client.name}</td>
                    <td className="text-sm text-gray-600">{client.email}</td>
                    <td className="text-sm text-gray-600">
                      {client.phone || "—"}
                    </td>
                    <td className="text-center">{client.stats.totalSessions}</td>
                    <td className="text-sm">
                      {client.stats.lastSessionDate
                        ? format(new Date(client.stats.lastSessionDate), "MMM d, yyyy")
                        : "—"}
                    </td>
                    <td className="text-sm">
                      {client.stats.nextSessionDate
                        ? format(new Date(client.stats.nextSessionDate), "MMM d, yyyy")
                        : "None scheduled"}
                    </td>
                    <td className="text-center">
                      {client.clientProfile?.consentFormSigned ? (
                        <span className="portal-badge portal-badge-success">✓</span>
                      ) : (
                        <span className="portal-badge portal-badge-warning">—</span>
                      )}
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="portal-btn portal-btn-outline text-xs"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `bun run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/\(portals\)/admin/clients/page.tsx
git commit -m "feat: add clients list page"
```

---

### Task 3.2: Update AdminSidebar Navigation

**Files:**
- Modify: `src/app/(portals)/admin/AdminSidebar.tsx`

**Step 1: Read current file to find insertion point**

Run: Read the file to see navigation structure
Expected: Find navigation links array

**Step 2: Add Clients menu item**

Add after "Bookings" item:

```typescript
{
  label: "Clients",
  href: "/admin/clients",
  icon: Users,
  roles: ["admin", "reception", "therapist"],
},
```

**Step 3: Ensure Users icon is imported**

Add to imports if needed:

```typescript
import { Users } from "lucide-react";
```

**Step 4: Verify TypeScript compiles**

Run: `bun run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/app/\(portals\)/admin/AdminSidebar.tsx
git commit -m "feat: add Clients to admin sidebar navigation"
```

---

## Phase 4: Client Detail & Edit Pages

### Task 4.1: Create Client Detail Page

**Files:**
- Create: `src/app/(portals)/admin/clients/[id]/page.tsx`

**Step 1: Create detail page component**

```typescript
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getServerSession } from "@/lib/auth-middleware";
import { getDataSource } from "@/lib/db";
import { User } from "@/entities/User";
import { Therapist } from "@/entities/Therapist";
import { Booking } from "@/entities/Booking";
import type { AuthSession } from "@/types/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  return {
    title: "Client Details | Admin | Mindweal by Pihu Suri",
  };
}

async function getClientData(id: string, session: AuthSession) {
  const ds = await getDataSource();

  const client = await ds.getRepository(User).findOne({
    where: { id, role: "client" },
    relations: ["clientProfile"],
  });

  if (!client) {
    return null;
  }

  // For therapists, verify access
  if (session.user.role === "therapist") {
    const therapist = await ds.getRepository(Therapist).findOne({
      where: [{ userId: session.user.id }, { id: session.user.therapistId! }],
    });

    if (!therapist) {
      return null;
    }

    const hasBooking = await ds.getRepository(Booking).findOne({
      where: {
        therapistId: therapist.id,
        clientId: id,
      },
    });

    if (!hasBooking) {
      return null;
    }

    // Get only this therapist's sessions
    const bookings = await ds.getRepository(Booking).find({
      where: { clientId: id, therapistId: therapist.id },
      relations: ["therapist", "sessionType"],
      order: { startDatetime: "DESC" },
    });

    return { client, bookings, isTherapist: true };
  }

  // Admin/reception see all sessions
  const bookings = await ds.getRepository(Booking).find({
    where: { clientId: id },
    relations: ["therapist", "sessionType"],
    order: { startDatetime: "DESC" },
  });

  return { client, bookings, isTherapist: false };
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = (await getServerSession()) as AuthSession | null;

  if (!session) {
    return null;
  }

  const data = await getClientData(id, session);

  if (!data) {
    notFound();
  }

  const { client, bookings, isTherapist } = data;

  const stats = {
    total: bookings.length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    noShow: bookings.filter((b) => b.status === "no_show").length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return "portal-badge portal-badge-success";
      case "completed":
        return "portal-badge portal-badge-success";
      case "pending":
        return "portal-badge portal-badge-warning";
      case "cancelled":
        return "portal-badge";
      case "no_show":
        return "portal-badge";
      default:
        return "portal-badge";
    }
  };

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return "📹";
      case "in_person":
        return "🏢";
      case "phone":
        return "📞";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/admin/clients"
            className="text-sm text-gray-600 hover:text-primary mb-2 inline-block"
          >
            ← Back to Clients
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="portal-title">{client.name}</h1>
            {client.clientProfile?.consentFormSigned && (
              <span className="portal-badge portal-badge-success">
                ✓ Consent Signed
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm">
            {client.email} • {client.phone || "No phone"}
          </p>
          <p className="text-gray-500 text-xs">
            Client since {format(new Date(client.createdAt), "MMMM d, yyyy")}
          </p>
        </div>
        <Link
          href={`/admin/clients/${id}/edit`}
          className="portal-btn portal-btn-primary"
        >
          Edit Profile
        </Link>
      </div>

      {/* Emergency Contact */}
      <div className="portal-card p-4">
        <h2 className="font-semibold mb-2">Emergency Contact</h2>
        {client.clientProfile?.emergencyContactName ? (
          <div className="text-sm space-y-1">
            <p>
              <span className="font-medium">
                {client.clientProfile.emergencyContactName}
              </span>
              {client.clientProfile.emergencyContactRelationship && (
                <span className="text-gray-600">
                  {" "}
                  ({client.clientProfile.emergencyContactRelationship})
                </span>
              )}
            </p>
            {client.clientProfile.emergencyContactPhone && (
              <p className="text-gray-600">
                {client.clientProfile.emergencyContactPhone}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No emergency contact on file</p>
        )}
      </div>

      {/* Session Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="portal-card p-3">
          <div className="text-xs text-gray-600">Total Sessions</div>
          <div className="text-2xl font-semibold text-primary">{stats.total}</div>
        </div>
        <div className="portal-card p-3">
          <div className="text-xs text-gray-600">Completed</div>
          <div className="text-2xl font-semibold text-green-600">
            {stats.completed}
          </div>
        </div>
        <div className="portal-card p-3">
          <div className="text-xs text-gray-600">Cancelled</div>
          <div className="text-2xl font-semibold text-gray-600">
            {stats.cancelled}
          </div>
        </div>
        <div className="portal-card p-3">
          <div className="text-xs text-gray-600">No Show</div>
          <div className="text-2xl font-semibold text-gray-600">
            {stats.noShow}
          </div>
        </div>
      </div>

      {/* Session History */}
      <div className="portal-card overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold">Session History</h2>
          {isTherapist && (
            <p className="text-xs text-gray-500 mt-1">
              Showing only your sessions with this client
            </p>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Therapist</th>
                <th>Session Type</th>
                <th className="text-center">Duration</th>
                <th className="text-center">Meeting</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No sessions recorded yet
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="text-sm">
                      {format(new Date(booking.startDatetime), "MMM d, yyyy 'at' h:mm a")}
                    </td>
                    <td>{booking.therapist.name}</td>
                    <td className="text-sm">
                      {booking.sessionType?.name || "—"}
                    </td>
                    <td className="text-center text-sm">
                      {booking.sessionType?.duration
                        ? `${booking.sessionType.duration} min`
                        : "—"}
                    </td>
                    <td className="text-center">{getMeetingTypeIcon(booking.meetingType)}</td>
                    <td>
                      <span className={getStatusBadge(booking.status)}>
                        {booking.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `bun run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/\(portals\)/admin/clients/\[id\]/page.tsx
git commit -m "feat: add client detail page"
```

---

### Task 4.2: Create Client Edit Page

**Files:**
- Create: `src/app/(portals)/admin/clients/[id]/edit/page.tsx`

**Step 1: Create edit page component**

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateClientProfileSchema, type UpdateClientProfileInput } from "@/lib/validation";

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateClientProfileInput>({
    resolver: zodResolver(updateClientProfileSchema),
  });

  useEffect(() => {
    async function fetchClient() {
      try {
        const res = await fetch(`/api/admin/clients/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch client");
        }
        const data = await res.json();
        setClientName(data.data.client.name);
        reset({
          emergencyContactName: data.data.profile.emergencyContactName,
          emergencyContactPhone: data.data.profile.emergencyContactPhone,
          emergencyContactRelationship: data.data.profile.emergencyContactRelationship,
          consentFormSigned: data.data.profile.consentFormSigned,
        });
      } catch (err) {
        setError("Failed to load client data");
        console.error("Fetch client error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchClient();
  }, [id, reset]);

  const onSubmit = async (data: UpdateClientProfileInput) => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      router.push(`/admin/clients/${id}`);
    } catch (err: any) {
      setError(err.message);
      console.error("Update profile error:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="portal-card p-8 text-center text-gray-500">
          Loading client data...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <Link
          href={`/admin/clients/${id}`}
          className="text-sm text-gray-600 hover:text-primary mb-2 inline-block"
        >
          ← Back to Client
        </Link>
        <h1 className="portal-title">Edit Client Profile - {clientName}</h1>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="portal-card p-4 bg-red-50 border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Emergency Contact */}
        <div className="portal-card p-4 space-y-4">
          <h2 className="font-semibold">Emergency Contact Information</h2>

          <div>
            <label htmlFor="emergencyContactName" className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              id="emergencyContactName"
              type="text"
              {...register("emergencyContactName")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Contact name"
            />
            {errors.emergencyContactName && (
              <p className="text-sm text-red-600 mt-1">
                {errors.emergencyContactName.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="emergencyContactPhone" className="block text-sm font-medium mb-1">
              Phone
            </label>
            <input
              id="emergencyContactPhone"
              type="text"
              {...register("emergencyContactPhone")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="+1234567890"
            />
            {errors.emergencyContactPhone && (
              <p className="text-sm text-red-600 mt-1">
                {errors.emergencyContactPhone.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="emergencyContactRelationship" className="block text-sm font-medium mb-1">
              Relationship
            </label>
            <input
              id="emergencyContactRelationship"
              type="text"
              {...register("emergencyContactRelationship")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Spouse, Parent, Sibling"
            />
            {errors.emergencyContactRelationship && (
              <p className="text-sm text-red-600 mt-1">
                {errors.emergencyContactRelationship.message}
              </p>
            )}
          </div>
        </div>

        {/* Consent */}
        <div className="portal-card p-4">
          <h2 className="font-semibold mb-4">Consent Status</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("consentFormSigned")}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="text-sm">Consent form signed and verified</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Link
            href={`/admin/clients/${id}`}
            className="portal-btn portal-btn-outline"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="portal-btn portal-btn-primary"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `bun run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/\(portals\)/admin/clients/\[id\]/edit/page.tsx
git commit -m "feat: add client edit page"
```

---

## Phase 5: Update Users Page

### Task 5.1: Update Users Page to Exclude Clients

**Files:**
- Modify: `src/app/(portals)/admin/users/page.tsx`

**Step 1: Read current file**

Identify the query that fetches users.

**Step 2: Update query to exclude clients**

Change:

```typescript
return ds.getRepository(User).find({ order: { createdAt: "DESC" } });
```

To:

```typescript
return ds.getRepository(User).find({ 
  where: { role: Not("client") },
  order: { createdAt: "DESC" } 
});
```

**Step 3: Add Not import from typeorm**

Add to imports:

```typescript
import { Not } from "typeorm";
```

**Step 4: Update stats calculation**

Ensure stats calculation also excludes clients (or remove client count from stats).

**Step 5: Verify TypeScript compiles**

Run: `bun run build`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add src/app/\(portals\)/admin/users/page.tsx
git commit -m "feat: exclude clients from users page"
```

---

### Task 5.2: Update Users API Route to Exclude Clients

**Files:**
- Modify: `src/app/api/(admin)/admin/users/route.ts`

**Step 1: Read current file**

Identify GET handler that returns user list.

**Step 2: Update query to exclude clients**

Change the User.find() query to include:

```typescript
where: { role: Not("client") }
```

**Step 3: Add Not import from typeorm**

```typescript
import { Not } from "typeorm";
```

**Step 4: Verify TypeScript compiles**

Run: `bun run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/app/api/\(admin\)/admin/users/route.ts
git commit -m "feat: exclude clients from users API route"
```

---

## Final Verification

### Task 6.1: Run Full Build

**Files:**
- No file changes

**Step 1: Run production build**

Run: `bun run build`
Expected: Build succeeds with no TypeScript errors

**Step 2: Check for console warnings**

Review build output for warnings
Expected: No critical warnings

---

### Task 6.2: Manual Testing Checklist

**Manual tests to perform:**

1. **Admin Login**
   - Navigate to `/admin/clients`
   - Verify clients list shows all clients
   - Click on a client to view details
   - Edit client profile
   - Verify Users page no longer shows clients

2. **Therapist Login**
   - Navigate to `/admin/clients`
   - Verify only clients with bookings appear
   - Try to access another therapist's client (should fail)

3. **Reception Login**
   - Navigate to `/admin/clients`
   - Verify clients list shows all clients
   - Edit client profile

4. **Data Integrity**
   - Verify emergency contact saves correctly
   - Verify consent checkbox toggles correctly
   - Verify session history displays correctly
   - Verify stats are accurate

---

**End of Implementation Plan**
