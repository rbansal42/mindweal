import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class UpdateBookingsSchema1769800000003 implements MigrationInterface {
    name = "UpdateBookingsSchema1769800000003";

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Helper function to check if column exists
        const columnExists = async (tableName: string, columnName: string): Promise<boolean> => {
            const table = await queryRunner.getTable(tableName);
            return table?.findColumnByName(columnName) !== undefined;
        };

        // Step 1: Add new datetime columns if they don't exist
        const hasStartDatetime = await columnExists("bookings", "startDatetime");
        const hasEndDatetime = await columnExists("bookings", "endDatetime");
        
        if (!hasStartDatetime || !hasEndDatetime) {
            const columnsToAdd: string[] = [];
            if (!hasStartDatetime) columnsToAdd.push("`startDatetime` datetime NULL");
            if (!hasEndDatetime) columnsToAdd.push("`endDatetime` datetime NULL");
            
            if (columnsToAdd.length > 0) {
                await queryRunner.query(`
                    ALTER TABLE \`bookings\`
                    ADD COLUMN ${columnsToAdd.join(",\n            ADD COLUMN ")}
                `);
            }
        }

        // Step 2: Populate new datetime columns from existing date + time columns (if old columns exist)
        const hasDateColumn = await columnExists("bookings", "date");
        if (hasDateColumn) {
            await queryRunner.query(`
                UPDATE \`bookings\`
                SET \`startDatetime\` = CONCAT(\`date\`, ' ', \`startTime\`),
                    \`endDatetime\` = CONCAT(\`date\`, ' ', \`endTime\`)
                WHERE \`startDatetime\` IS NULL OR \`endDatetime\` IS NULL
            `);

            // Step 3: Make datetime columns NOT NULL after population
            await queryRunner.query(`
                ALTER TABLE \`bookings\`
                MODIFY COLUMN \`startDatetime\` datetime NOT NULL,
                MODIFY COLUMN \`endDatetime\` datetime NOT NULL
            `);
        }

        // Step 4: Rename existing columns (check if old column names exist)
        const hasReference = await columnExists("bookings", "reference");
        if (hasReference) {
            await queryRunner.query(`
                ALTER TABLE \`bookings\`
                CHANGE COLUMN \`reference\` \`bookingReference\` varchar(50) NOT NULL,
                CHANGE COLUMN \`guestName\` \`clientName\` varchar(255) NOT NULL,
                CHANGE COLUMN \`guestEmail\` \`clientEmail\` varchar(255) NOT NULL,
                CHANGE COLUMN \`guestPhone\` \`clientPhone\` varchar(50) NULL,
                CHANGE COLUMN \`notes\` \`clientNotes\` text NULL
            `);
        }

        // Step 5: Update unique index (check if old index exists)
        const table = await queryRunner.getTable("bookings");
        const hasOldIndex = table?.indices.some(index => 
            index.name === "IDX_booking_reference" && 
            index.columnNames.includes("reference")
        );
        
        if (hasOldIndex) {
            await queryRunner.query(`
                ALTER TABLE \`bookings\`
                DROP INDEX \`IDX_booking_reference\`,
                ADD UNIQUE INDEX \`IDX_booking_reference\` (\`bookingReference\`)
            `);
        }

        // Step 6: Add new columns if they don't exist
        const newColumns = [
            { name: "cancellationReason", def: "`cancellationReason` text NULL" },
            { name: "cancelledBy", def: "`cancelledBy` varchar(36) NULL" },
            { name: "cancelledAt", def: "`cancelledAt` datetime NULL" },
            { name: "meetingType", def: "`meetingType` enum('in_person', 'video', 'phone') NOT NULL DEFAULT 'video'" },
            { name: "meetingLocation", def: "`meetingLocation` varchar(255) NULL" },
            { name: "internalNotes", def: "`internalNotes` text NULL" },
            { name: "reminderSentAt", def: "`reminderSentAt` datetime NULL" },
            { name: "createdBy", def: "`createdBy` varchar(36) NULL" }
        ];

        const columnsToAdd: string[] = [];
        for (const col of newColumns) {
            const exists = await columnExists("bookings", col.name);
            if (!exists) {
                columnsToAdd.push(col.def);
            }
        }

        if (columnsToAdd.length > 0) {
            await queryRunner.query(`
                ALTER TABLE \`bookings\`
                ADD COLUMN ${columnsToAdd.join(",\n            ADD COLUMN ")}
            `);
        }

        // Step 7: Make sessionTypeId nullable (entity definition says it should be)
        await queryRunner.query(`
            ALTER TABLE \`bookings\`
            MODIFY COLUMN \`sessionTypeId\` varchar(36) NULL
        `);

        // Step 8: Drop old date/time columns (only if they still exist)
        const hasOldDateColumns = await columnExists("bookings", "date");
        if (hasOldDateColumns) {
            await queryRunner.query(`
                ALTER TABLE \`bookings\`
                DROP COLUMN \`date\`,
                DROP COLUMN \`startTime\`,
                DROP COLUMN \`endTime\`
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Helper function to check if column exists
        const columnExists = async (tableName: string, columnName: string): Promise<boolean> => {
            const table = await queryRunner.getTable(tableName);
            return table?.findColumnByName(columnName) !== undefined;
        };

        // Step 1: Add back old date/time columns if they don't exist
        const hasDateColumn = await columnExists("bookings", "date");
        if (!hasDateColumn) {
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
        }

        // Step 4: Make sessionTypeId NOT NULL again
        await queryRunner.query(`
            ALTER TABLE \`bookings\`
            MODIFY COLUMN \`sessionTypeId\` varchar(36) NOT NULL
        `);

        // Step 5: Drop new columns if they exist
        const newColumns = [
            "cancellationReason", "cancelledBy", "cancelledAt",
            "meetingType", "meetingLocation", "internalNotes",
            "reminderSentAt", "createdBy"
        ];

        const columnsToDrop: string[] = [];
        for (const col of newColumns) {
            const exists = await columnExists("bookings", col);
            if (exists) {
                columnsToDrop.push(`\`${col}\``);
            }
        }

        if (columnsToDrop.length > 0) {
            await queryRunner.query(`
                ALTER TABLE \`bookings\`
                DROP COLUMN ${columnsToDrop.join(",\n            DROP COLUMN ")}
            `);
        }

        // Step 6: Rename columns back (check if new column names exist)
        const hasBookingReference = await columnExists("bookings", "bookingReference");
        if (hasBookingReference) {
            const table = await queryRunner.getTable("bookings");
            const hasNewIndex = table?.indices.some(index => 
                index.name === "IDX_booking_reference" && 
                index.columnNames.includes("bookingReference")
            );
            
            if (hasNewIndex) {
                await queryRunner.query(`
                    ALTER TABLE \`bookings\`
                    DROP INDEX \`IDX_booking_reference\`,
                    ADD UNIQUE INDEX \`IDX_booking_reference\` (\`reference\`)
                `);
            }

            await queryRunner.query(`
                ALTER TABLE \`bookings\`
                CHANGE COLUMN \`bookingReference\` \`reference\` varchar(20) NOT NULL,
                CHANGE COLUMN \`clientName\` \`guestName\` varchar(255) NULL,
                CHANGE COLUMN \`clientEmail\` \`guestEmail\` varchar(255) NULL,
                CHANGE COLUMN \`clientPhone\` \`guestPhone\` varchar(50) NULL,
                CHANGE COLUMN \`clientNotes\` \`notes\` text NULL
            `);
        }

        // Step 8: Drop new datetime columns if they exist
        const hasStartDatetime = await columnExists("bookings", "startDatetime");
        if (hasStartDatetime) {
            await queryRunner.query(`
                ALTER TABLE \`bookings\`
                DROP COLUMN \`startDatetime\`,
                DROP COLUMN \`endDatetime\`
            `);
        }
    }
}
