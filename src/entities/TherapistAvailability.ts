import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity("therapist_availability")
export class TherapistAvailability {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 36 })
    therapistId!: string;

    @Column({ type: "tinyint" })
    dayOfWeek!: number;

    @Column({ type: "time" })
    startTime!: string;

    @Column({ type: "time" })
    endTime!: string;

    @Column({ type: "boolean", default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
