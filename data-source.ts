import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Database configuration
const databaseConfig = {
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT || "3307", 10),
    user: process.env.DATABASE_USER || "mindweal",
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE_NAME || "mindweal",
};

// TypeORM CLI DataSource
export const AppDataSource = new DataSource({
    type: "mysql",
    host: databaseConfig.host,
    port: databaseConfig.port,
    username: databaseConfig.user,
    password: databaseConfig.password,
    database: databaseConfig.database,
    synchronize: false,
    logging: true,
    entities: ["src/entities/**/*.ts"],
    migrations: ["migrations/**/*.ts"],
    subscribers: ["src/subscribers/**/*.ts"],
});
