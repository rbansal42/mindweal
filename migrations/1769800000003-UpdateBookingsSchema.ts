import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateBookingsSchema1769800000003 implements MigrationInterface {
    name = "UpdateBookingsSchema1769800000003";

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Step 1: Add new datetime columns
        await queryRunner.query(`
            ALTER TABLE \`bookings\`
            ADD COLUMN \`startDatetime\` datetime NULL,
            ADD COLUMN \`endDatetime\` datetime NULL
        `);

        // Step 2: Populate new datetime columns from existing date + time columns
        await queryRunner.query(`
            UPDATE \`bookings\`
            SET \`startDatetime\` = CONCAT(\`date\`, ' ', \`startTime\`),
                \`endDatetime\` = CONCAT(\`date\`, ' ', \`endTime\`)
        `);

        // Step 3: Make datetime columns NOT NULL after population
        await queryRunner.query(`
            ALTER TABLE \`bookings\`
            MODIFY COLUMN \`startDatetime\` datetime NOT NULL,
            MODIFY COLUMN \`endDatetime\` datetime NOT NULL
        `);

        // Step 4: Rename existing columns
        await queryRunner.query(`
            ALTER TABLE \`bookings\`
            CHANGE COLUMN \`reference\` \`bookingReference\` varchar(50) NOT NULL,
            CHANGE COLUMN \`guestName\` \`clientName\` varchar(255) NOT NULL,
            CHANGE COLUMN \`guestEmail\` \`clientEmail\` varchar(255) NOT NULL,
            CHANGE COLUMN \`guestPhone\` \`clientPhone\` varchar(50) NULL,
            CHANGE COLUMN \`notes\` \`clientNotes\` text NULL
        `);

        // Step 5: Update unique index name
        await queryRunner.query(`
            ALTER TABLE \`bookings\`
            DROP INDEX \`IDX_booking_reference\`,
            ADD UNIQUE INDEX \`IDX_booking_reference\` (\`bookingReference\`)
        `);

        // Step 6: Add new columns
        await queryRunner.query(`
            ALTER TABLE \`bookings\`
            ADD COLUMN \`cancellationReason\` text NULL,
            ADD COLUMN \`cancelledBy\` varchar(36) NULL,
            ADD COLUMN \`cancelledAt\` datetime NULL,
            ADD COLUMN \`meetingType\` enum('in_person', 'video', 'phone') NOT NULL DEFAULT 'video',
            ADD COLUMN \`meetingLocation\` varchar(255) NULL,
            ADD COLUMN \`internalNotes\` text NULL,
            ADD COLUMN \`reminderSentAt\` datetime NULL,
            ADD COLUMN \`createdBy\` varchar(36) NULL
        `);

        // Step 7: Make sessionTypeId nullable (entity definition says it should be)
        await queryRunner.query(`
            ALTER TABLE \`bookings\`
            MODIFY COLUMN \`sessionTypeId\` varchar(36) NULL
        `);

        // Step 8: Drop old date/time columns
        await queryRunner.query(`
            ALTER TABLE \`bookings\`
            DROP COLUMN \`date\`,
            DROP COLUMN \`startTime\`,
            DROP COLUMN \`endTime\`
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Step 1: Add back old date/time columns
        await queryRunner.query(`
            ALTER TABLE \`bookings\`
            ADD COLUMN \`date\` date NULL,
            ADD COLUMN \`startTime\` time NULL,
            ADD COLUMN \`endTime\` time NULL
        `);

        // Step 2: Populate old columns from new datetime columns
        await queryRunner.query(`
            UPDATE \`bookings\`
            SET \`date\` = DATE(\`startDatetime\`),
                \`startTime\` = TIME(\`startDatetime\`),
                \`endTime\` = TIME(\`endDatetime\`)
        `);

        // Step 3: Make old columns NOT NULL
        await queryRunner.query(`
            ALTER TABLE \`bookings\`
            MODIFY COLUMN \`date\` date NOT NULL,
            MODIFY COLUMN \`startTime\` time NOT NULL,
            MODIFY COLUMN \`endTime\` time NOT NULL
        `);

        // Step 4: Make sessionTypeId NOT NULL again
        await queryRunner.query(`
            ALTER TABLE \`bookings\`
            MODIFY COLUMN \`sessionTypeId\` varchar(36) NOT NULL
        `);

        // Step 5: Drop new columns
        await queryRunner.query(`
            ALTER TABLE \`bookings\`
            DROP COLUMN \`cancellationReason\`,
            DROP COLUMN \`cancelledBy\`,
            DROP COLUMN \`cancelledAt\`,
            DROP COLUMN \`meetingType\`,
            DROP COLUMN \`meetingLocation\`,
            DROP COLUMN \`internalNotes\`,
            DROP COLUMN \`reminderSentAt\`,
            DROP COLUMN \`createdBy\`
        `);

        // Step 6: Update unique index name back
        await queryRunner.query(`
            ALTER TABLE \`bookings\`
            DROP INDEX \`IDX_booking_reference\`,
            ADD UNIQUE INDEX \`IDX_booking_reference\` (\`reference\`)
        `);

        // Step 7: Rename columns back
        await queryRunner.query(`
            ALTER TABLE \`bookings\`
            CHANGE COLUMN \`bookingReference\` \`reference\` varchar(20) NOT NULL,
            CHANGE COLUMN \`clientName\` \`guestName\` varchar(255) NULL,
            CHANGE COLUMN \`clientEmail\` \`guestEmail\` varchar(255) NULL,
            CHANGE COLUMN \`clientPhone\` \`guestPhone\` varchar(50) NULL,
            CHANGE COLUMN \`clientNotes\` \`notes\` text NULL
        `);

        // Step 8: Drop new datetime columns
        await queryRunner.query(`
            ALTER TABLE \`bookings\`
            DROP COLUMN \`startDatetime\`,
            DROP COLUMN \`endDatetime\`
        `);
    }
}
