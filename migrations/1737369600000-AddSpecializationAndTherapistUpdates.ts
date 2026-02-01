import { MigrationInterface, QueryRunner, Table, TableColumn } from "typeorm";

export class AddSpecializationAndTherapistUpdates1737369600000 implements MigrationInterface {
    name = "AddSpecializationAndTherapistUpdates1737369600000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create specialization table
        await queryRunner.createTable(
            new Table({
                name: "specialization",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        length: "36",
                        isPrimary: true,
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "description",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "isActive",
                        type: "boolean",
                        default: true,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                        onUpdate: "CURRENT_TIMESTAMP",
                    },
                ],
            }),
            true
        );

        // Add specializationIds column to therapist table
        await queryRunner.addColumn(
            "therapist",
            new TableColumn({
                name: "specializationIds",
                type: "json",
                isNullable: true,
            })
        );

        // Add deletedAt column to therapist table for soft delete
        await queryRunner.addColumn(
            "therapist",
            new TableColumn({
                name: "deletedAt",
                type: "timestamp",
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove columns from therapist table
        await queryRunner.dropColumn("therapist", "deletedAt");
        await queryRunner.dropColumn("therapist", "specializationIds");

        // Drop specialization table
        await queryRunner.dropTable("specialization");
    }
}
