import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class RemoveStrapiIdFromTherapists1769700724095 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if column exists before dropping (column is named strapiId in camelCase)
        const table = await queryRunner.getTable("therapists");
        const column = table?.findColumnByName("strapiId");
        if (column) {
            await queryRunner.dropColumn("therapists", "strapiId");
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "therapists",
            new TableColumn({
                name: "strapiId",
                type: "int",
                isNullable: true,
            })
        );
    }
}
