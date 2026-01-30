# Database Setup Script Design

> **Created:** 2026-01-20

## Overview

A TypeORM-based database setup script that creates all tables and seeds initial data for the Mindweal application.

## Design Decisions

1. **Format:** TypeORM sync (auto-generates tables from entities)
2. **Seed data:** Admin user + default specializations
3. **Admin credentials:** Hardcoded defaults (admin@mindweal.in / Admin123!)

## Implementation

### File: `frontend/scripts/setup-db.ts`

**What it does:**
1. Loads environment variables from `.env.local`
2. Connects to MySQL using configured credentials
3. Uses TypeORM `synchronize: true` to create all 10 tables from entities
4. Seeds admin user (if not exists)
5. Seeds 10 default specializations (if not exists)
6. Reports success/failure with table summary

### Tables Created

| Table | Entity | Description |
|-------|--------|-------------|
| `users` | User | All user accounts |
| `sessions` | Session | Auth sessions (Better Auth) |
| `accounts` | Account | OAuth provider accounts |
| `verification_tokens` | VerificationToken | Email verification & password reset |
| `therapists` | Therapist | Therapist profiles |
| `therapist_availability` | TherapistAvailability | Weekly recurring availability |
| `blocked_dates` | BlockedDate | One-time blocked dates/times |
| `session_types` | SessionType | Session types per therapist |
| `bookings` | Booking | Appointments |
| `specializations` | Specialization | Therapist specializations |

### Seed Data

**Admin User:**
- Email: `admin@mindweal.in`
- Password: `Admin123!`
- Role: `admin`

**Specializations:**
- Anxiety
- Depression
- Trauma & PTSD
- Relationship Issues
- Stress Management
- Grief & Loss
- Self-Esteem
- Life Transitions
- Work-Life Balance
- Family Therapy

## Usage

```bash
# From frontend directory
cd frontend

# Ensure MySQL is running
docker-compose up -d

# Run setup (uses DATABASE_* env vars from .env.local)
bun run db:setup

# Or override host for local testing
DATABASE_HOST=127.0.0.1 bun run db:setup
```

## Output Example

```
🚀 Starting database setup...

📡 Connecting to MySQL at 127.0.0.1:3307...
✅ Connected to database
✅ Tables synchronized

👤 Seeding admin user...
   ✅ Admin user created: admin@mindweal.in
   📧 Email: admin@mindweal.in
   🔑 Password: Admin123!

🏷️  Seeding specializations...
   ✅ Specializations: 10 created, 0 already existed

📊 Tables created:
   • accounts
   • blocked_dates
   • bookings
   • session_types
   • sessions
   • specializations
   • therapist_availability
   • therapists
   • users
   • verification_tokens

✅ Database setup complete!

You can now start the application with: bun run dev
```
