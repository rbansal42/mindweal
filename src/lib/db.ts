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
    ],
    migrations: ["migrations/**/*.ts"],
    subscribers: ["src/subscribers/**/*.ts"],
};

export const AppDataSource = new DataSource(dataSourceOptions);

export { dataSourceOptions };
