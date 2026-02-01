#!/usr/bin/env node

/**
 * Create Test Users Script
 *
 * This script creates test users with proper password hashes using Better Auth.
 * Run AFTER the SQL setup script has been executed.
 *
 * Usage:
 *   node create-test-users.js
 *
 * Requirements:
 *   - Database must be set up (run setup-testing-database.sql first)
 *   - BETTER_AUTH_URL must be set to your API endpoint
 */

const testUsers = [
  {
    email: 'admin@mindweal.in',
    name: 'Admin User',
    password: 'Test123!',
    role: 'admin',
    phone: '+91 98765 43210'
  },
  {
    email: 'reception@mindweal.in',
    name: 'Reception Desk',
    password: 'Test123!',
    role: 'reception',
    phone: '+91 98765 43211'
  },
  {
    email: 'dr.sharma@mindweal.in',
    name: 'Dr. Priya Sharma',
    password: 'Test123!',
    role: 'therapist',
    phone: '+91 98765 43212'
  },
  {
    email: 'dr.verma@mindweal.in',
    name: 'Dr. Rajesh Verma',
    password: 'Test123!',
    role: 'therapist',
    phone: '+91 98765 43213'
  },
  {
    email: 'dr.singh@mindweal.in',
    name: 'Dr. Anjali Singh',
    password: 'Test123!',
    role: 'therapist',
    phone: '+91 98765 43214'
  },
  {
    email: 'client1@example.com',
    name: 'Rahul Bansal',
    password: 'Test123!',
    role: 'client',
    phone: '+91 98765 43215'
  },
  {
    email: 'client2@example.com',
    name: 'Priya Patel',
    password: 'Test123!',
    role: 'client',
    phone: '+91 98765 43216'
  },
  {
    email: 'client3@example.com',
    name: 'Amit Kumar',
    password: 'Test123!',
    role: 'client',
    phone: '+91 98765 43217'
  },
  {
    email: 'banned@example.com',
    name: 'Banned User',
    password: 'Test123!',
    role: 'client',
    phone: '+91 98765 43218'
  },
  {
    email: 'unverified@example.com',
    name: 'Unverified User',
    password: 'Test123!',
    role: 'client',
    phone: '+91 98765 43219'
  }
];

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || 'http://localhost:4242';

async function createUser(userData) {
  try {
    const response = await fetch(`${BETTER_AUTH_URL}/api/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create ${userData.email}: ${JSON.stringify(error)}`);
    }

    const result = await response.json();
    console.log(`✓ Created user: ${userData.email} (${userData.role})`);
    return result;
  } catch (error) {
    console.error(`✗ Error creating ${userData.email}:`, error.message);
    return null;
  }
}

async function banUser(userId, email) {
  try {
    const response = await fetch(`${BETTER_AUTH_URL}/api/auth/admin/ban-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        banReason: 'Violation of terms',
        banExpiresIn: 60 * 60 * 24 * 30 // 30 days
      })
    });

    if (!response.ok) {
      throw new Error('Failed to ban user');
    }

    console.log(`✓ Banned user: ${email}`);
  } catch (error) {
    console.error(`✗ Error banning user ${email}:`, error.message);
  }
}

async function main() {
  console.log('Creating test users...\n');
  console.log(`Using API endpoint: ${BETTER_AUTH_URL}\n`);

  // Note: This assumes you have an authenticated admin session
  // In production, you'd need to authenticate first

  const createdUsers = [];

  for (const userData of testUsers) {
    const result = await createUser(userData);
    if (result) {
      createdUsers.push({ ...userData, id: result.user?.id });
    }
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n✓ Created ${createdUsers.length}/${testUsers.length} users\n`);

  // Ban the test banned user
  const bannedUser = createdUsers.find(u => u.email === 'banned@example.com');
  if (bannedUser && bannedUser.id) {
    await banUser(bannedUser.id, bannedUser.email);
  }

  console.log('\nTest user creation complete!');
  console.log('\nTest Credentials:');
  console.log('=================');
  testUsers.forEach(user => {
    console.log(`${user.role.padEnd(12)} | ${user.email.padEnd(30)} | ${user.password}`);
  });
  console.log('\nNote: All users have password "Test123!"');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createUser, banUser, testUsers };
