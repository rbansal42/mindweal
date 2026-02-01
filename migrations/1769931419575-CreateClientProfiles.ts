import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class CreateClientProfiles1769931419575 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create client_profiles table
    await queryRunner.createTable(
      new Table({
        name: "client_profiles",
        columns: [
          {
            name: "id",
            type: "char",
            length: "36",
            isPrimary: true,
          },
          {
            name: "userId",
            type: "char",
            length: "36",
            isUnique: true,
          },
          {
            name: "emergencyContactName",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "emergencyContactPhone",
            type: "varchar",
            length: "20",
            isNullable: true,
          },
          {
            name: "emergencyContactRelationship",
            type: "varchar",
            length: "50",
            isNullable: true,
          },
          {
            name: "consentFormSigned",
            type: "boolean",
            default: false,
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

    // Create index on userId
    await queryRunner.createIndex(
      "client_profiles",
      new TableIndex({
        name: "IDX_client_profiles_userId",
        columnNames: ["userId"],
      })
    );

    // Create foreign key to users table
    await queryRunner.createForeignKey(
      "client_profiles",
      new TableForeignKey({
        columnNames: ["userId"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );

    // Backfill profiles for existing clients
    await queryRunner.query(`
      INSERT INTO client_profiles (id, userId, consentFormSigned, createdAt, updatedAt)
      SELECT UUID(), id, false, NOW(), NOW()
      FROM users
      WHERE role = 'client'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("client_profiles");
  }
}
