# Clients Management Feature - Design Document

**Date:** 2026-02-01  
**Feature:** Admin Panel Clients Management with Tiered Access  
**Status:** Approved

---

## 1. Overview

### Goal
Create a dedicated Clients management section in the admin panel with role-based access control, allowing admins and reception staff to manage all clients, while therapists can view and manage only their own clients.

### Current State
- Clients are users with `role: "client"` in the User entity
- Bookings link clients to therapists via `clientId` and `therapistId`
- The existing `/admin/users` page shows all users including clients
- No dedicated client-specific features (emergency contacts, consent tracking, session history view)

### Proposed Changes
- New ClientProfile entity for client-specific data
- Dedicated `/admin/clients` routes with filtered access
- Update `/admin/users` to exclude clients
- Role-based data access in API routes

---

## 2. Access Control

### Tiered Access Matrix

| Role | Access Level | Scope |
|------|-------------|-------|
| Admin | Full | All clients, past and present |
| Reception | Full | All clients, past and present |
| Therapist | Limited | Only clients who have ever booked with them |
| Client | None | N/A (future: own profile view in client portal) |

### Definition: "Therapist's Clients"
A client belongs to a therapist if there exists **any booking** (regardless of status) where:
- `booking.therapistId = therapist.id`
- `booking.clientId = user.id` (for registered clients)
- OR `booking.clientEmail = user.email` (for guest bookings that later registered)

This includes all booking statuses: pending, confirmed, cancelled, completed, no_show.

---

## 3. Data Model

### New Entity: ClientProfile

```typescript
@Entity("client_profiles")
export class ClientProfile {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  userId!: string;  // 1:1 relationship with User

  // Emergency Contact Information
  @Column({ type: "varchar", length: 100, nullable: true })
  emergencyContactName!: string | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  emergencyContactPhone!: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  emergencyContactRelationship!: string | null;

  // Consent Tracking
  @Column({ default: false })
  consentFormSigned!: boolean;

  // Future: General client notes (not session-specific)
  // @Column({ type: "text", nullable: true })
  // notes!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
```

### Migration Strategy

**Migration Name:** `CreateClientProfiles`

**Steps:**
1. Create `client_profiles` table
2. Add index on `userId` for fast lookups
3. Backfill profiles for existing users with `role = "client"`
4. Add foreign key constraint to User.id

**Backfill Query:**
```sql
INSERT INTO client_profiles (id, userId, consentFormSigned, createdAt, updatedAt)
SELECT UUID(), id, false, NOW(), NOW()
FROM users
WHERE role = 'client';
```

### Future: Session Notes

**Not in initial implementation** - marked for future scope:

1. **Per-session notes:** Add `sessionNotes` field to Booking entity
2. **General client notes:** Add `notes` field to ClientProfile entity
3. **Notes UI:** Display in client detail page and booking detail pages
4. **Access control:** Only therapist who conducted session + admin can edit session notes

---

## 4. Routes Architecture

### Page Routes

| Route | Purpose | Access |
|-------|---------|--------|
| `/admin/clients` | List all accessible clients | Admin, Reception, Therapist |
| `/admin/clients/[id]` | Client detail with session history | Admin, Reception, Therapist (own clients) |
| `/admin/clients/[id]/edit` | Edit client profile (emergency contact, consent) | Admin, Reception, Therapist (own clients) |

### API Routes

| Route | Method | Purpose | Access |
|-------|--------|---------|--------|
| `/api/admin/clients` | GET | List clients with filtering | Role-based |
| `/api/admin/clients` | POST | Create client profile (auto on user creation) | Admin, Reception |
| `/api/admin/clients/[id]` | GET | Get client with profile + session history | Role-based |
| `/api/admin/clients/[id]` | PUT | Update client profile | Admin, Reception, Therapist (own clients) |

### Navigation Update

**AdminSidebar.tsx** - Add menu item:
```typescript
{
  label: "Clients",
  href: "/admin/clients",
  icon: UsersIcon, // Or a dedicated icon
  roles: ["admin", "reception", "therapist"]
}
```

---

## 5. API Implementation Details

### GET /api/admin/clients - List Clients

**Query Parameters:**
- `search`: string (search name, email, phone)
- `therapistId`: string (filter by therapist - admin/reception only)
- `hasUpcoming`: boolean (has upcoming bookings)
- `lastSessionStart`: ISO date (last session after this date)
- `lastSessionEnd`: ISO date (last session before this date)
- `consentSigned`: boolean (consent form status)
- `page`: number (pagination)
- `limit`: number (default 50)

**Access Control Logic:**
```typescript
const session = await getServerSession() as AuthSession | null;

if (session.user.role === "therapist") {
  // Find therapist record
  const therapist = await ds.getRepository(Therapist).findOne({
    where: [
      { userId: session.user.id },
      { id: session.user.therapistId! }
    ]
  });
  
  if (!therapist) {
    return NextResponse.json({ error: "Therapist profile not found" }, { status: 404 });
  }
  
  // Get distinct client IDs from bookings
  const bookings = await ds.getRepository(Booking).find({
    where: { therapistId: therapist.id },
    select: ["clientId"]
  });
  
  const clientIds = [...new Set(bookings.map(b => b.clientId).filter(Boolean))];
  
  // Fetch clients with profiles
  const clients = await ds.getRepository(User).find({
    where: { id: In(clientIds), role: "client" },
    relations: ["clientProfile"]
  });
} else if (["admin", "reception"].includes(session.user.role)) {
  // Get all clients
  const clients = await ds.getRepository(User).find({
    where: { role: "client" },
    relations: ["clientProfile"]
  });
}

// Apply filters (search, date range, consent status, etc.)
// Apply pagination
// Return with booking stats
```

**Response Format:**
```typescript
{
  success: true,
  data: {
    clients: [
      {
        id: "uuid",
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        createdAt: "2025-01-15T10:00:00Z",
        profile: {
          emergencyContactName: "Jane Doe",
          emergencyContactPhone: "+0987654321",
          emergencyContactRelationship: "Spouse",
          consentFormSigned: true
        },
        stats: {
          totalSessions: 12,
          lastSessionDate: "2026-01-28T14:00:00Z",
          nextSessionDate: "2026-02-05T14:00:00Z",
          primaryTherapist: { id: "uuid", name: "Dr. Smith" }
        }
      }
    ],
    pagination: {
      total: 150,
      page: 1,
      limit: 50,
      pages: 3
    }
  }
}
```

### GET /api/admin/clients/[id] - Get Client Detail

**Access Control:**
- Admin/Reception: Can access any client
- Therapist: Can only access clients they have bookings with

**Response includes:**
- User data (name, email, phone, timezone, etc.)
- ClientProfile data (emergency contact, consent)
- Session history (all bookings for this client)
- Statistics (total sessions, by status, by therapist)

**Session History Query:**
```typescript
const bookings = await ds.getRepository(Booking).find({
  where: { clientId: id },
  relations: ["therapist", "sessionType"],
  order: { startDatetime: "DESC" }
});
```

For therapists, additionally filter to only show their own sessions:
```typescript
const bookings = await ds.getRepository(Booking).find({
  where: { 
    clientId: id,
    therapistId: therapist.id  // Only show this therapist's sessions
  },
  relations: ["therapist", "sessionType"],
  order: { startDatetime: "DESC" }
});
```

### PUT /api/admin/clients/[id] - Update Client Profile

**Access Control:**
- Admin/Reception: Can update any client
- Therapist: Can only update clients they have bookings with

**Validation Schema:**
```typescript
updateClientProfileSchema = z.object({
  emergencyContactName: z.string().min(1).max(100).nullable(),
  emergencyContactPhone: z.string().regex(/^\+?[0-9\s\-()]+$/).nullable(),
  emergencyContactRelationship: z.string().max(50).nullable(),
  consentFormSigned: z.boolean()
});
```

**Logic:**
1. Check if ClientProfile exists for user
2. If not, create it (lazy initialization)
3. Update fields
4. Return updated profile

---

## 6. UI Components

### ClientsPage - Main List View

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ Clients                        [+ Create Client]    │
│ Manage client records and session history           │
├─────────────────────────────────────────────────────┤
│ [Total: 150] [Active: 120] [Consent: 100]          │
├─────────────────────────────────────────────────────┤
│ Search: [________________]  Filters: [Advanced ▼]   │
│                                                      │
│ ┌──Filters Panel (collapsible)──────────────────┐  │
│ │ Therapist: [Dropdown - admin/reception only]  │  │
│ │ Last Session: [Date Range Picker]             │  │
│ │ Status: ☐ Has upcoming  ☐ No recent activity  │  │
│ │ Consent: ☐ Signed  ☐ Unsigned                 │  │
│ │ [Apply Filters] [Reset]                       │  │
│ └───────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│ Name      Email      Phone     Sessions  Last       │
│                                          Session    │
├─────────────────────────────────────────────────────┤
│ John Doe  john@...  +123...   12        Jan 28 ✓   │
│ Jane S... jane@...  +098...   8         Jan 15 ✓   │
│ ...                                                  │
└─────────────────────────────────────────────────────┘
```

**Table Columns:**
- Name (link to detail page)
- Email
- Phone
- Total Sessions (count)
- Last Session (date, with consent badge)
- Next Session (date or "None scheduled")
- Primary Therapist (for admin/reception view)
- Actions (View, Edit buttons)

**Stats Cards:**
- Total Clients
- Active Clients (had session in last 30 days)
- Consent Signed (count/percentage)

**Empty State:**
```
┌─────────────────────────────────────┐
│         [Icon]                      │
│    No clients found                 │
│  Try adjusting your filters         │
└─────────────────────────────────────┘
```

### ClientDetailPage - Individual Client View

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ ← Back to Clients                                    │
├─────────────────────────────────────────────────────┤
│ John Doe                           [Edit Profile]    │
│ john@example.com • +1234567890                      │
│ Client since Jan 15, 2025         [✓ Consent]       │
├─────────────────────────────────────────────────────┤
│ ┌─Emergency Contact────────────────────────────┐   │
│ │ Jane Doe (Spouse)                             │   │
│ │ +0987654321                                   │   │
│ └───────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│ ┌─Session Statistics───────────────────────────┐   │
│ │ Total: 12  |  Completed: 10  |  Cancelled: 2 │   │
│ │ Last: Jan 28  |  Next: Feb 05                │   │
│ └───────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│ Session History                                      │
├─────────────────────────────────────────────────────┤
│ Date      Therapist   Type        Duration  Status  │
├─────────────────────────────────────────────────────┤
│ Feb 05    Dr. Smith   Individual  60 min    Pending │
│ Jan 28    Dr. Smith   Individual  60 min    Complete│
│ Jan 14    Dr. Jones   Couples     90 min    Complete│
│ ...                                                  │
└─────────────────────────────────────────────────────┘
```

**Session History Columns:**
- Date & Time (formatted with timezone)
- Therapist Name
- Session Type
- Duration
- Meeting Type (Video/In-Person/Phone icon)
- Status (badge with color)

**For Therapists:**
- Only show sessions with this therapist
- Add note: "Showing only your sessions with this client"

### ClientEditPage - Edit Profile Form

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ ← Back to Client                                     │
├─────────────────────────────────────────────────────┤
│ Edit Client Profile - John Doe                       │
├─────────────────────────────────────────────────────┤
│ Emergency Contact Information                        │
│                                                      │
│ Name: [Jane Doe________________]                    │
│                                                      │
│ Phone: [+0987654321___________]                     │
│                                                      │
│ Relationship: [Spouse__________]                    │
│                                                      │
├─────────────────────────────────────────────────────┤
│ Consent Status                                       │
│                                                      │
│ ☑ Consent form signed and verified                  │
│                                                      │
├─────────────────────────────────────────────────────┤
│                           [Cancel] [Save Changes]    │
└─────────────────────────────────────────────────────┘
```

**Form Validation:**
- Emergency contact phone must match format (regex)
- All fields optional (can clear emergency contact)
- Show success toast on save
- Return to detail page on success

---

## 7. Error Handling

### API Errors

| Scenario | Status | Response |
|----------|--------|----------|
| Not authenticated | 401 | `{ error: "Unauthorized" }` |
| Wrong role | 403 | `{ error: "Forbidden" }` |
| Therapist accessing other therapist's client | 403 | `{ error: "You don't have access to this client" }` |
| Client not found | 404 | `{ error: "Client not found" }` |
| Invalid phone format | 400 | `{ error: "Validation failed", details: {...} }` |
| ClientProfile creation fails | 500 | `{ error: "Failed to create client profile" }` |

### UI Error States

**Network Errors:**
- Show error toast: "Failed to load clients. Please try again."
- Display retry button

**Empty States:**
- No clients found: "No clients match your filters"
- No session history: "No sessions recorded yet"
- No emergency contact: "No emergency contact on file"

**Access Denied:**
- Redirect therapist to `/therapist` if accessing unauthorized client
- Show 403 page for admin routes

---

## 8. Performance Considerations

### Database Optimization

**Indexes:**
- `client_profiles.userId` (unique) - Fast profile lookups
- `bookings.clientId` - Fast session history queries
- `bookings.therapistId` - Fast therapist client list queries
- Composite index: `bookings(therapistId, clientId)` - For therapist access checks

**Query Optimization:**
- Use `relations` in TypeORM to avoid N+1 queries
- Fetch user + profile + booking stats in single query
- Paginate client list (default 50 per page)
- Cache primary therapist calculation (most bookings with)

### Frontend Optimization

**Data Fetching:**
- Server-side rendering for initial page load
- Client-side filtering for instant feedback
- Debounce search input (300ms)

**Rendering:**
- Use unique `key` prop for list items (user.id)
- Virtualize long session history lists (if >100 items)

---

## 9. Security Considerations

### Access Control Enforcement

**Every API route MUST:**
1. Check authentication (session exists)
2. Check role (admin/reception/therapist)
3. For therapists: Verify ownership via booking relationship
4. Validate all input with Zod schemas
5. Sanitize any HTML content (though none expected in this feature)

**Sample Ownership Check:**
```typescript
if (session.user.role === "therapist") {
  const therapist = await getTherapistByUserId(session.user.id);
  const hasBooking = await ds.getRepository(Booking).findOne({
    where: {
      therapistId: therapist.id,
      clientId: clientId
    }
  });
  
  if (!hasBooking) {
    return NextResponse.json(
      { error: "You don't have access to this client" },
      { status: 403 }
    );
  }
}
```

### Data Privacy

- Therapists can only see clients they've worked with
- Session history filtered by therapist role
- Emergency contact information visible to authorized users only
- No client data exposed in public routes

### Input Validation

- Phone numbers: Regex validation before storage
- Emergency contact fields: Max length enforcement
- Search queries: SQL injection prevention via TypeORM
- No file uploads in this feature (future: consent form PDFs)

---

## 10. Testing Strategy

### Unit Tests

**Entities:**
- ClientProfile entity can be created and saved
- Relationships between User and ClientProfile work correctly

**Validation:**
- updateClientProfileSchema validates correct data
- updateClientProfileSchema rejects invalid phone numbers
- updateClientProfileSchema allows nullable fields

### Integration Tests

**API Routes:**
- Admin can list all clients
- Reception can list all clients
- Therapist can only list their own clients
- Therapist cannot access another therapist's client
- Update client profile succeeds with valid data
- Update client profile fails with invalid data

**Database:**
- Migration creates table correctly
- Backfill creates profiles for existing clients
- Indexes are created for performance

### E2E Tests (Future)

- Admin can search and filter clients
- Therapist sees only their clients in list
- Edit profile form saves changes correctly
- Session history displays correctly

---

## 11. Implementation Phases

### Phase 1: Database & Entity Setup
- Create ClientProfile entity
- Create migration
- Run migration
- Backfill existing client profiles
- Verify with database query

### Phase 2: API Routes
- GET /api/admin/clients (list with filtering)
- GET /api/admin/clients/[id] (detail)
- PUT /api/admin/clients/[id] (update profile)
- Add validation schemas to lib/validation.ts

### Phase 3: Client List Page
- Create /admin/clients/page.tsx
- Build ClientsTable component
- Add search and filtering UI
- Add stats cards
- Update AdminSidebar navigation

### Phase 4: Client Detail & Edit Pages
- Create /admin/clients/[id]/page.tsx
- Create /admin/clients/[id]/edit/page.tsx
- Build session history table
- Build emergency contact card
- Build edit form

### Phase 5: Users Page Update
- Update /admin/users/page.tsx to exclude clients
- Update /admin/users API route to filter out clients
- Test that clients no longer appear in Users list

---

## 12. Future Enhancements (Out of Scope)

### Session Notes (High Priority)
- Add `sessionNotes` field to Booking entity
- Add `notes` field to ClientProfile entity
- Build notes UI in client detail page
- Add notes editor in booking detail
- Access control: Only session therapist + admin can edit

### Consent Form Upload
- Add `consentFormUrl` field to ClientProfile
- Integrate UploadThing for PDF uploads
- Display uploaded consent form
- Download/view functionality

### Client Portal Integration
- Allow clients to view their own profile
- Clients can update emergency contact
- Clients can view session history
- Clients can download consent form

### Advanced Analytics
- Client retention metrics
- Session completion rates
- Therapist-client relationship duration
- Revenue per client

### Bulk Operations
- Bulk export clients to CSV
- Bulk update consent status
- Bulk email to clients

---

## 13. Acceptance Criteria

**Phase 1-5 Complete When:**

✅ ClientProfile entity exists and migration is applied  
✅ Existing clients have profiles created automatically  
✅ Admin can view list of all clients with stats  
✅ Reception can view list of all clients with stats  
✅ Therapist can view only their own clients  
✅ Search and filters work correctly  
✅ Client detail page shows profile + session history  
✅ Emergency contact can be added/edited  
✅ Consent status can be toggled  
✅ Users page no longer shows clients  
✅ AdminSidebar has "Clients" menu item  
✅ All API routes have proper access control  
✅ Build succeeds with no TypeScript errors  
✅ No console errors in browser

---

## 14. Technical Debt & Known Limitations

### Current Limitations

1. **Guest Bookings:** Clients who booked as guests before registering may not show complete history
   - Mitigation: Match by email in addition to clientId
   
2. **Primary Therapist Calculation:** Currently calculated on-demand, could be expensive for clients with many sessions
   - Mitigation: Cache result, or calculate during backfill
   
3. **No Real-Time Updates:** Session history doesn't update live when new bookings are created
   - Mitigation: Refresh page or use polling (future: WebSocket)

4. **Pagination:** Fixed page size, no user preference
   - Future: Allow users to choose page size

### Technical Debt

- Consider adding a `clientBookings` relation to User entity for easier queries
- Consider materialized view for client statistics
- Consider adding full-text search for better search performance

---

## 15. Dependencies

**No new packages required** - all functionality can be built with existing stack:
- TypeORM (entity, migrations)
- Next.js (routing, API)
- Zod (validation)
- date-fns (date formatting)
- Existing UI components (portal-card, portal-table, etc.)

---

**End of Design Document**
