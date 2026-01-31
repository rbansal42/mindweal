import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import * as fs from "fs";

// Load environment variables (try .env.local first, then .env)
if (fs.existsSync(".env.local")) {
    dotenv.config({ path: ".env.local" });
} else {
    dotenv.config({ path: ".env" });
}

// Database configuration
const databaseConfig = {
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT || "3307", 10),
    user: process.env.DATABASE_USER || "mindweal",
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE_NAME || "mindweal",
};

// TypeORM CLI DataSource (for migrations only)
// Note: entities are not loaded here to avoid ESM resolution issues with CLI
export const AppDataSource = new DataSource({
    type: "mysql",
    host: databaseConfig.host,
    port: databaseConfig.port,
    username: databaseConfig.user,
    password: databaseConfig.password,
    database: databaseConfig.database,
    synchronize: false,
    logging: true,
    entities: [],
    migrations: ["migrations/**/*.ts"],
    subscribers: [],
});
