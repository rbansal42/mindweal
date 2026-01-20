/**
 * Database Setup Script
 *
 * Creates all tables using TypeORM sync and seeds initial data.
 *
 * Usage: bun run db:setup
 */

import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Import entities
import { User } from "../src/entities/User";
import { Therapist } from "../src/entities/Therapist";
import { TherapistAvailability } from "../src/entities/TherapistAvailability";
import { BlockedDate } from "../src/entities/BlockedDate";
import { SessionType } from "../src/entities/SessionType";
import { Booking } from "../src/entities/Booking";
import { Session } from "../src/entities/Session";
import { Account } from "../src/entities/Account";
import { VerificationToken } from "../src/entities/VerificationToken";
import { Specialization } from "../src/entities/Specialization";

// Database configuration
const databaseConfig = {
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT || "3307", 10),
    user: process.env.DATABASE_USER || "mindweal",
    password: process.env.DATABASE_PASSWORD || "mindweal_password",
    database: process.env.DATABASE_NAME || "mindweal",
};

// Default admin credentials
const ADMIN_EMAIL = "admin@mindweal.in";
const ADMIN_PASSWORD = "Admin123!";
const ADMIN_NAME = "Admin";

// Default specializations
const DEFAULT_SPECIALIZATIONS = [
    "Anxiety",
    "Depression",
    "Trauma & PTSD",
    "Relationship Issues",
    "Stress Management",
    "Grief & Loss",
    "Self-Esteem",
    "Life Transitions",
    "Work-Life Balance",
    "Family Therapy",
];

async function setupDatabase() {
    console.log("🚀 Starting database setup...\n");

    // Create DataSource with synchronize enabled
    const dataSource = new DataSource({
        type: "mysql",
        host: databaseConfig.host,
        port: databaseConfig.port,
        username: databaseConfig.user,
        password: databaseConfig.password,
        database: databaseConfig.database,
        synchronize: true, // Auto-create tables from entities
        logging: false,
        entities: [
            User,
            Therapist,
            TherapistAvailability,
            BlockedDate,
            SessionType,
            Booking,
            Session,
            Account,
            VerificationToken,
            Specialization,
        ],
    });

    try {
        // Connect and sync tables
        console.log(`📡 Connecting to MySQL at ${databaseConfig.host}:${databaseConfig.port}...`);
        await dataSource.initialize();
        console.log("✅ Connected to database");
        console.log("✅ Tables synchronized\n");

        // Seed admin user
        console.log("👤 Seeding admin user...");
        const userRepo = dataSource.getRepository(User);
        const accountRepo = dataSource.getRepository(Account);

        const existingAdmin = await userRepo.findOne({ where: { email: ADMIN_EMAIL } });
        if (existingAdmin) {
            console.log(`   ⚠️  Admin user already exists: ${ADMIN_EMAIL}`);
            // Check if credential account exists
            const existingAccount = await accountRepo.findOne({
                where: { userId: existingAdmin.id, providerId: "credential" }
            });
            if (!existingAccount) {
                // Create credential account for existing user
                const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
                const credentialAccount = accountRepo.create({
                    id: uuidv4(),
                    userId: existingAdmin.id,
                    accountId: existingAdmin.id,
                    providerId: "credential",
                    password: hashedPassword,
                });
                await accountRepo.save(credentialAccount);
                console.log(`   ✅ Credential account created for existing admin`);
            }
        } else {
            const adminUserId = uuidv4();
            const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

            // Create admin user
            const adminUser = userRepo.create({
                id: adminUserId,
                email: ADMIN_EMAIL,
                name: ADMIN_NAME,
                role: "admin",
                emailVerified: new Date(),
                timezone: "Asia/Kolkata",
            });
            await userRepo.save(adminUser);

            // Create credential account for Better Auth
            const credentialAccount = accountRepo.create({
                id: uuidv4(),
                userId: adminUserId,
                accountId: adminUserId,
                providerId: "credential",
                password: hashedPassword,
            });
            await accountRepo.save(credentialAccount);

            console.log(`   ✅ Admin user created: ${ADMIN_EMAIL}`);
            console.log(`   📧 Email: ${ADMIN_EMAIL}`);
            console.log(`   🔑 Password: ${ADMIN_PASSWORD}`);
        }

        // Seed specializations
        console.log("\n🏷️  Seeding specializations...");
        const specRepo = dataSource.getRepository(Specialization);

        let created = 0;
        let skipped = 0;

        for (const name of DEFAULT_SPECIALIZATIONS) {
            const existing = await specRepo.findOne({ where: { name } });
            if (existing) {
                skipped++;
            } else {
                const spec = specRepo.create({
                    id: uuidv4(),
                    name,
                    isActive: true,
                });
                await specRepo.save(spec);
                created++;
            }
        }

        console.log(`   ✅ Specializations: ${created} created, ${skipped} already existed`);

        // Print table summary
        console.log("\n📊 Tables created:");
        const tables = await dataSource.query("SHOW TABLES");
        const tableKey = `Tables_in_${databaseConfig.database}`;
        for (const table of tables) {
            console.log(`   • ${table[tableKey]}`);
        }

        console.log("\n✅ Database setup complete!\n");
        console.log("You can now start the application with: bun run dev");

    } catch (error) {
        console.error("\n❌ Database setup failed:", error);
        process.exit(1);
    } finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
        }
    }
}

// Run setup
setupDatabase();
