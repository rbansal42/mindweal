import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddCategoryToProgram1769800000002 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "programs",
            new TableColumn({
                name: "category",
                type: "enum",
                enum: ["therapy-service", "professional-programs", "workshop"],
                default: "'therapy-service'",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("programs", "category");
    }
}
