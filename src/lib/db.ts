import { DataSource, DataSourceOptions } from "typeorm";
import { databaseConfig } from "@/config";
import {
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
    Program,
    Workshop,
    CommunityProgram,
    JobPosting,
    TeamMember,
    FAQ,
} from "@/entities";

const dataSourceOptions: DataSourceOptions = {
    type: "mysql",
    host: databaseConfig.host,
    port: databaseConfig.port,
    username: databaseConfig.user,
    password: databaseConfig.password,
    database: databaseConfig.database,
    synchronize: false, // Never use in production
    logging: process.env.NODE_ENV === "development",
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
        Program,
        Workshop,
        CommunityProgram,
        JobPosting,
        TeamMember,
        FAQ,
    ],
    // Note: migrations are loaded only via CLI (data-source.ts), not at runtime
};

export const AppDataSource = new DataSource(dataSourceOptions);

/**
 * Get initialized DataSource. Use this in API routes instead of
 * defining a local getDataSource function.
 */
export async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

export { dataSourceOptions };
