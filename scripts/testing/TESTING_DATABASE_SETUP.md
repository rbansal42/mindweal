# Mindweal Testing Database Setup Guide

This guide explains how to set up a complete testing database with schema and seed data for the Mindweal mental health clinic application.

## Files Included

1. **setup-testing-database.sql** - Complete database schema and seed data
2. **create-test-users.js** - Node.js script to create users with proper password hashes
3. **setup-testing-env.sh** - Automated setup script (recommended)

## Quick Setup (Recommended)

```bash
# 1. Make the setup script executable
chmod +x setup-testing-env.sh

# 2. Run the setup script
./setup-testing-env.sh
```

This will:
- Drop and recreate the database
- Create all tables with proper schema
- Insert seed data
- Display next steps for user creation

## Manual Setup

### Step 1: Database Schema and Seed Data

```bash
# Connect to MySQL and run the SQL script
mysql -h your-db-host -u root -p < setup-testing-database.sql

# Or if using Docker:
docker exec -i your-mysql-container mysql -u root -p < setup-testing-database.sql
```

### Step 2: Create Users with Proper Password Hashes

The SQL script creates user records, but passwords need to be set properly via Better Auth.

**Option A: Use the Node.js script (requires running app)**

```bash
# Make sure your app is running on the test server
export BETTER_AUTH_URL=http://your-test-server:4242

# Run the user creation script
node create-test-users.js
```

**Option B: Use Better Auth CLI/API manually**

Use your application's signup endpoint or Better Auth admin API to create each user.

## Test Users Created

| Role       | Email                    | Password  | Phone             | Notes              |
|------------|--------------------------|-----------|-------------------|--------------------|
| admin      | admin@mindweal.in        | Test123!  | +91 98765 43210   | Full admin access  |
| reception  | reception@mindweal.in    | Test123!  | +91 98765 43211   | Can create clients |
| therapist  | dr.sharma@mindweal.in    | Test123!  | +91 98765 43212   | Clinical psych     |
| therapist  | dr.verma@mindweal.in     | Test123!  | +91 98765 43213   | Family therapy     |
| therapist  | dr.singh@mindweal.in     | Test123!  | +91 98765 43214   | Child psych        |
| client     | client1@example.com      | Test123!  | +91 98765 43215   | Active client      |
| client     | client2@example.com      | Test123!  | +91 98765 43216   | Active client      |
| client     | client3@example.com      | Test123!  | +91 98765 43217   | Active client      |
| client     | banned@example.com       | Test123!  | +91 98765 43218   | **BANNED USER**    |
| client     | unverified@example.com   | Test123!  | +91 98765 43219   | Email not verified |

## Test Data Included

### Therapists
- **Dr. Priya Sharma** - Clinical psychologist (Anxiety, Depression, Stress)
- **Dr. Rajesh Verma** - Family therapist (Relationships, Couples, Family)
- **Dr. Anjali Singh** - Child psychologist (Child, Adolescent, Parenting)

### Session Types
- Individual Therapy (60 min) - ₹2,500
- Initial Consultation (45 min) - ₹1,500
- Couples Therapy (90 min) - ₹4,000
- Family Therapy (90 min) - ₹4,500
- Child Therapy (45 min) - ₹2,000
- Teen Counseling (60 min) - ₹2,500

### Therapist Availability
- Dr. Sharma: Mon-Fri, 9 AM - 5 PM
- Dr. Verma: Mon-Sat, 10 AM - 6 PM (Sat until 2 PM)
- Dr. Singh: Tue-Sat, 11 AM - 7 PM

### Sample Bookings
- 4 upcoming bookings with different therapists and statuses
- Mix of client and guest bookings
- Includes meeting links

### Other Data
- Specializations (6 categories)
- FAQs (4 common questions)
- Programs (2 therapy programs)
- Workshops (1 upcoming workshop)

## Database Schema

All Better Auth tables are included:
- `users` - User accounts with admin plugin columns (banned, banReason, banExpires)
- `sessions` - Active sessions
- `accounts` - OAuth and credential accounts
- `verification_tokens` - Email verification and password reset

Application tables:
- `therapists` - Therapist profiles
- `session_types` - Therapy session types
- `therapist_availability` - Weekly schedules
- `blocked_dates` - One-time blocks
- `bookings` - Appointments
- `programs` - Therapy programs
- `workshops` - Workshops/events
- `community_programs` - Community initiatives
- `faqs` - FAQ entries
- `job_postings` - Career opportunities
- `team_members` - Team bios
- `specializations` - Therapy specializations

## Testing the Setup

### 1. Verify Database
```sql
USE mindweal;

-- Check user count
SELECT role, COUNT(*) as count FROM users GROUP BY role;

-- Check therapists
SELECT name, email FROM users WHERE role = 'therapist';

-- Check bookings
SELECT COUNT(*) as booking_count FROM bookings;

-- Check banned user
SELECT email, banned, banReason FROM users WHERE banned = 1;
```

### 2. Test Admin Login
```bash
# Login as admin
curl -X POST http://your-server:4242/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@mindweal.in", "password": "Test123!"}'
```

### 3. Test User Management
- Login as admin@mindweal.in
- Navigate to /admin/users
- Verify you see all 10 users
- Check that banned@example.com shows as "Inactive"
- Try editing a user
- Try creating a new user

### 4. Test Role Restrictions
- Login as reception@mindweal.in
- Navigate to /admin/users
- Verify "Create Client" button (not "Create User")
- Verify you can only edit client users

### 5. Test Therapist Booking
- Navigate to /therapists
- Select Dr. Priya Sharma
- Verify session types appear
- Check availability calendar

## Troubleshooting

### Password Hashes Not Working
The SQL script includes placeholder password hashes. You MUST create users via Better Auth to get proper hashes:

1. Delete user accounts from `accounts` table
2. Run the Node.js user creation script, OR
3. Manually sign up each test user via the app

### Foreign Key Errors
Make sure to run the SQL script in order - it temporarily disables foreign key checks during seed data insertion.

### Missing Columns
If you get "Unknown column" errors, the schema may not match your TypeORM entities. Update the SQL script to match your entity definitions.

### Better Auth API Errors
The Node.js script requires:
- App to be running
- Admin API endpoints to be accessible
- Proper authentication (you may need to modify the script to include auth headers)

## Security Notes

**IMPORTANT:** This is for TESTING ONLY!

- All users have the same password: `Test123!`
- Passwords are not secure
- Data is fake/placeholder
- Do NOT use this setup in production
- Do NOT expose test database to public internet

## Customization

### Changing Test Passwords
Edit the `create-test-users.js` file and update the `password` field for each user.

### Adding More Test Data
Edit `setup-testing-database.sql` and add INSERT statements in the "SEED DATA" section.

### Modifying Schema
If your entities have changed:
1. Update the CREATE TABLE statements in the SQL file
2. Regenerate the schema from TypeORM if possible

## Environment Variables

For the Node.js script:
```bash
export BETTER_AUTH_URL=http://localhost:4242  # Your app URL
```

For the database:
```bash
export DB_HOST=localhost
export DB_PORT=3307
export DB_USER=root
export DB_PASSWORD=your-root-password
export DB_NAME=mindweal
```

## Next Steps

After setup is complete:

1. ✓ Database schema created
2. ✓ Seed data inserted
3. ⚠ Create user accounts (run create-test-users.js or manually sign up)
4. ⚠ Test admin user management features
5. ⚠ Test booking system
6. ⚠ Test therapist portals

## Support

If you encounter issues:
1. Check MySQL error logs
2. Verify database connection settings
3. Ensure Better Auth is properly configured
4. Check that all required environment variables are set

For Better Auth password hash issues, you can generate them manually:
```javascript
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('Test123!', 10);
console.log(hash);
```
