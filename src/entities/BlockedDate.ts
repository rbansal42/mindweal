import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from "typeorm";

@Entity("blocked_dates")
export class BlockedDate {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 36 })
    therapistId!: string;

    @Column({ type: "datetime" })
    startDatetime!: Date;

    @Column({ type: "datetime" })
    endDatetime!: Date;

    @Column({ type: "varchar", length: 255, nullable: true })
    reason!: string | null;

    @Column({ type: "boolean", default: false })
    isAllDay!: boolean;

    @CreateDateColumn()
    createdAt!: Date;
}
