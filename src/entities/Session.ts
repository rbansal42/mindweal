import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity("sessions")
export class Session {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    userId!: string;

    @Column({ type: "datetime" })
    expiresAt!: Date;

    @Column({ unique: true })
    token!: string;

    @Column({ nullable: true })
    ipAddress!: string | null;

    @Column({ nullable: true })
    userAgent!: string | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
