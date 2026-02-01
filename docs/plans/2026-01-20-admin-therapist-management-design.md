# Admin Therapist Management Design

## Overview

Build an admin interface to fully manage therapists - create, edit, delete (soft), and control their visibility on the public site. Therapists manage only their own availability; admin controls everything else.

## Permission Model

| Actor | Can Manage |
|-------|------------|
| Admin | Profile info, session types, booking settings, account status, publishing |
| Therapist | Weekly availability, blocked dates, view bookings, mark sessions complete |

## Decisions Made

- **Data source:** MySQL only (no Strapi for therapists)
- **Therapist onboarding:** Admin sets up everything upfront (profile, session types, availability)
- **Publishing:** Draft by default, admin publishes when ready
- **Specializations:** Managed list (admin controls master list, picks per therapist)
- **Photo storage:** UploadThing with WebP optimization
- **Delete behavior:** Soft delete with restore capability

---

## New Admin Pages

### `/admin/therapists` (Enhanced)
List all therapists with:
- Filter by status (Draft/Published/All)
- Search by name
- Quick stats per therapist
- Link to detail page

### `/admin/therapists/new`
Multi-step form to create therapist:

**Step 1 - Profile Info:**
- Name (required)
- Title (required)
- Email (required, unique)
- Phone (required)
- Bio (required, rich text)
- Photo (required, file upload → WebP via UploadThing)
- Specializations (required, multi-select from managed list)

**Step 2 - Account Setup:**
- Temporary password (admin-set)
- Creates User record with `role: "therapist"`
- Links User to Therapist via `userId`

**Step 3 - Session Types:**
- Add one or more session types
- Each has: Name, Duration, Meeting type, Price, Color
- At least one required before publishing

**Step 4 - Weekly Availability:**
- Set recurring schedule
- Day of week + start/end time
- Multiple slots per day allowed
- Can skip (therapist sets later)

**On Submit:**
1. Create Therapist (`isActive: false`)
2. Create User with therapist role
3. Create SessionType records
4. Create TherapistAvailability records
5. Send welcome email with credentials

### `/admin/therapists/[id]`
View therapist detail with sections:

**Header:**
- Photo, Name, Title
- Status badge (Draft/Published)
- Actions: Edit, Publish/Unpublish, Delete

**Sections:**
- Profile: Bio, Email, Phone, Specializations
- Session Types: Table with edit/delete, add button
- Availability: Read-only weekly schedule
- Bookings: Recent list, link to full view
- Stats: Total, Completed, Upcoming

### `/admin/therapists/[id]/edit`
Edit form with same fields as create (pre-populated).

### `/admin/therapists/archived`
List soft-deleted therapists with restore option.

### `/admin/settings/specializations`
Manage master specialization list:
- Add new (name only)
- Edit existing
- Delete (fails if in use by any therapist)

---

## Database Changes

### Updated Therapist Entity

Add fields:
```typescript
@Column({ type: "simple-array", nullable: true })
specializationIds: string[];  // Array of Specialization UUIDs

@Column({ nullable: true })
deletedAt: Date | null;  // Soft delete timestamp
```

### New Specialization Entity

```typescript
@Entity("specializations")
export class Specialization {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
```

### Soft Delete Behavior

- `deletedAt: null` → Active
- `deletedAt: Date` → Soft deleted
- All queries filter `WHERE deletedAt IS NULL`
- Admin can view archived and restore

---

## API Endpoints

### Therapist APIs

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/therapists` | List all (excludes soft-deleted) |
| GET | `/api/admin/therapists/archived` | List soft-deleted |
| POST | `/api/admin/therapists` | Create therapist |
| GET | `/api/admin/therapists/[id]` | Get details |
| PUT | `/api/admin/therapists/[id]` | Update therapist |
| POST | `/api/admin/therapists/[id]/publish` | Set isActive = true |
| POST | `/api/admin/therapists/[id]/unpublish` | Set isActive = false |
| DELETE | `/api/admin/therapists/[id]` | Soft delete |
| POST | `/api/admin/therapists/[id]/restore` | Restore |

### Specialization APIs

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/specializations` | List all |
| POST | `/api/admin/specializations` | Create |
| PUT | `/api/admin/specializations/[id]` | Update |
| DELETE | `/api/admin/specializations/[id]` | Delete (fails if in use) |

### Upload API

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/uploadthing` | UploadThing route handler |

---

## Therapist Portal Changes

| Page | Change |
|------|--------|
| `/therapist/settings` | Make profile read-only, remove session type editing. Show "Contact admin to update" note. |
| `/therapist/availability` | Keep as-is |
| `/therapist/bookings` | Keep as-is |
| `/therapist/schedule` | Keep as-is |

---

## Files to Create

```
frontend/src/
├── entities/
│   └── Specialization.ts
├── app/
│   ├── admin/
│   │   ├── therapists/
│   │   │   ├── new/
│   │   │   │   ├── page.tsx
│   │   │   │   └── CreateTherapistForm.tsx
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── edit/
│   │   │   │       ├── page.tsx
│   │   │   │       └── EditTherapistForm.tsx
│   │   │   └── archived/
│   │   │       └── page.tsx
│   │   └── settings/
│   │       └── specializations/
│   │           └── page.tsx
│   └── api/
│       ├── admin/
│       │   ├── therapists/
│       │   │   ├── route.ts
│       │   │   ├── archived/route.ts
│       │   │   └── [id]/
│       │   │       ├── route.ts
│       │   │       ├── publish/route.ts
│       │   │       ├── unpublish/route.ts
│       │   │       └── restore/route.ts
│       │   └── specializations/
│       │       ├── route.ts
│       │       └── [id]/route.ts
│       └── uploadthing/
│           ├── core.ts
│           └── route.ts
└── lib/
    └── uploadthing.ts
```

## Files to Modify

| File | Change |
|------|--------|
| `entities/Therapist.ts` | Add `specializationIds`, `deletedAt` |
| `app/admin/therapists/page.tsx` | Enhance list with filters |
| `app/therapist/settings/*` | Make profile read-only |
| `.env.example` | Add UploadThing variables |

---

## Dependencies

```bash
bun add uploadthing @uploadthing/react
```

Note: UploadThing handles image optimization including WebP conversion.

---

## Environment Variables

Add to `.env.example`:

```env
# UploadThing (Image uploads)
UPLOADTHING_TOKEN=
```

---

## Email Template

New template needed: `TherapistWelcome.tsx`
- Subject: "Welcome to Mindweal by Pihu Suri"
- Contains: Login URL, temporary password, next steps
