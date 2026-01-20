import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity("therapists")
export class Therapist {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 36, nullable: true })
    userId!: string | null;

    @Column({ type: "int", nullable: true })
    strapiId!: number | null;

    @Column({ type: "varchar", length: 255, unique: true })
    slug!: string;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "varchar", length: 255 })
    title!: string;

    @Column({ type: "text" })
    bio!: string;

    @Column({ type: "varchar", length: 255 })
    email!: string;

    @Column({ type: "varchar", length: 50, nullable: true })
    phone!: string | null;

    @Column({ type: "text", nullable: true })
    photoUrl!: string | null;

    @Column({ type: "int", default: 60 })
    defaultSessionDuration!: number;

    @Column({ type: "int", default: 15 })
    bufferTime!: number;

    @Column({ type: "int", default: 30 })
    advanceBookingDays!: number;

    @Column({ type: "int", default: 24 })
    minBookingNotice!: number;

    @Column({ type: "boolean", default: true })
    isActive!: boolean;

    @Column({ type: "simple-array", nullable: true })
    specializationIds!: string[] | null;

    @Column({ type: "datetime", nullable: true })
    deletedAt!: Date | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
