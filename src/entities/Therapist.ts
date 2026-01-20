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

    @Column({ nullable: true })
    userId!: string | null;

    @Column({ nullable: true })
    strapiId!: number | null;

    @Column({ unique: true })
    slug!: string;

    @Column()
    name!: string;

    @Column()
    title!: string;

    @Column({ type: "text" })
    bio!: string;

    @Column()
    email!: string;

    @Column({ nullable: true })
    phone!: string | null;

    @Column({ nullable: true })
    photoUrl!: string | null;

    @Column({ default: 60 })
    defaultSessionDuration!: number;

    @Column({ default: 15 })
    bufferTime!: number;

    @Column({ default: 30 })
    advanceBookingDays!: number;

    @Column({ default: 24 })
    minBookingNotice!: number;

    @Column({ default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
