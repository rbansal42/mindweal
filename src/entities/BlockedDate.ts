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

    @Column()
    therapistId!: string;

    @Column({ type: "datetime" })
    startDatetime!: Date;

    @Column({ type: "datetime" })
    endDatetime!: Date;

    @Column({ nullable: true })
    reason!: string | null;

    @Column({ default: false })
    isAllDay!: boolean;

    @CreateDateColumn()
    createdAt!: Date;
}
