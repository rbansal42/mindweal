# Quick Start - Testing Database Setup

## On Your Testing Server

### Option 1: Automated Setup (Recommended)

```bash
# 1. Navigate to the testing scripts directory
cd scripts/testing

# 2. Run the automated setup
./setup-testing-env.sh

# 3. Follow the prompts
#    - Enter MySQL root password when prompted
#    - Confirm database recreation if it already exists

# 4. After SQL setup completes, create user accounts
#    Make sure your app is running first!
export BETTER_AUTH_URL=http://localhost:4242
node create-test-users.js
```

### Option 2: Manual Setup

```bash
# 1. Run SQL script
mysql -u root -p < scripts/testing/setup-testing-database.sql

# 2. Create users via your app's signup page
#    OR run the Node.js script as shown above
```

## Test Credentials

All users have password: **Test123!**

| Role      | Email                   | Notes              |
|-----------|-------------------------|--------------------|
| Admin     | admin@mindweal.in       | Full access        |
| Reception | reception@mindweal.in   | Create clients     |
| Therapist | dr.sharma@mindweal.in   | Clinical psych     |
| Therapist | dr.verma@mindweal.in    | Family therapy     |
| Therapist | dr.singh@mindweal.in    | Child psych        |
| Client    | client1@example.com     | Active             |
| Client    | client2@example.com     | Active             |
| Client    | client3@example.com     | Active             |
| Client    | banned@example.com      | **BANNED**         |
| Client    | unverified@example.com  | Email not verified |

## Verify Setup

```bash
# Check users were created
mysql -u root -p mindweal -e "SELECT role, COUNT(*) as count FROM users GROUP BY role;"

# Expected output:
# +-----------+-------+
# | role      | count |
# +-----------+-------+
# | admin     |     1 |
# | client    |     5 |
# | reception |     1 |
# | therapist |     3 |
# +-----------+-------+
```

## Test the Admin Panel

1. Login as **admin@mindweal.in** / **Test123!**
2. Navigate to **/admin/users**
3. You should see all 10 users
4. **banned@example.com** should show as "Inactive"
5. Try creating a new user
6. Try editing an existing user
7. Try banning/unbanning a user

## Test Reception Access

1. Login as **reception@mindweal.in** / **Test123!**
2. Navigate to **/admin/users**
3. Button should say "Create Client" (not "Create User")
4. You should only be able to edit client users

## Need Help?

See [TESTING_DATABASE_SETUP.md](./TESTING_DATABASE_SETUP.md) for detailed documentation.
