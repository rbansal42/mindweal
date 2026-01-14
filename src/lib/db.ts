import { DataSource, DataSourceOptions } from "typeorm";
import { databaseConfig } from "@/config";

const dataSourceOptions: DataSourceOptions = {
    type: "mysql",
    host: databaseConfig.host,
    port: databaseConfig.port,
    username: databaseConfig.user,
    password: databaseConfig.password,
    database: databaseConfig.database,
    synchronize: false, // Never use in production
    logging: process.env.NODE_ENV === "development",
    entities: ["src/entities/**/*.ts"],
    migrations: ["migrations/**/*.ts"],
    subscribers: ["src/subscribers/**/*.ts"],
};

export const AppDataSource = new DataSource(dataSourceOptions);
