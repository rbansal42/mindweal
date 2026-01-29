import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateFAQTable1769800000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "faqs",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        length: "36",
                        isPrimary: true,
                        generationStrategy: "uuid",
                    },
                    {
                        name: "question",
                        type: "varchar",
                        length: "500",
                    },
                    {
                        name: "answer",
                        type: "text",
                    },
                    {
                        name: "category",
                        type: "enum",
                        enum: ["therapy", "booking", "programs", "general"],
                        default: "'general'",
                    },
                    {
                        name: "displayOrder",
                        type: "int",
                        default: 0,
                    },
                    {
                        name: "isActive",
                        type: "boolean",
                        default: true,
                    },
                    {
                        name: "createdAt",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updatedAt",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                        onUpdate: "CURRENT_TIMESTAMP",
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("faqs");
    }
}
