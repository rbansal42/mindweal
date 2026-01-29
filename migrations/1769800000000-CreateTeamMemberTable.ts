import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateTeamMemberTable1769800000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "team_members",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        length: "36",
                        isPrimary: true,
                        generationStrategy: "uuid",
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "255",
                    },
                    {
                        name: "slug",
                        type: "varchar",
                        length: "255",
                        isUnique: true,
                    },
                    {
                        name: "role",
                        type: "varchar",
                        length: "255",
                    },
                    {
                        name: "qualifications",
                        type: "varchar",
                        length: "500",
                        isNullable: true,
                    },
                    {
                        name: "bio",
                        type: "text",
                    },
                    {
                        name: "photoUrl",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "email",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "phone",
                        type: "varchar",
                        length: "50",
                        isNullable: true,
                    },
                    {
                        name: "location",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "educationalQualifications",
                        type: "json",
                        isNullable: true,
                    },
                    {
                        name: "professionalExperience",
                        type: "json",
                        isNullable: true,
                    },
                    {
                        name: "areasOfExpertise",
                        type: "json",
                        isNullable: true,
                    },
                    {
                        name: "therapeuticApproach",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "therapyModalities",
                        type: "json",
                        isNullable: true,
                    },
                    {
                        name: "servicesOffered",
                        type: "json",
                        isNullable: true,
                    },
                    {
                        name: "focusAreas",
                        type: "json",
                        isNullable: true,
                    },
                    {
                        name: "professionalValues",
                        type: "json",
                        isNullable: true,
                    },
                    {
                        name: "quote",
                        type: "text",
                        isNullable: true,
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
        await queryRunner.dropTable("team_members");
    }
}
