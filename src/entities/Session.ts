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

    @Column({ type: "varchar", length: 36 })
    userId!: string;

    @Column({ type: "datetime" })
    expiresAt!: Date;

    @Column({ type: "varchar", length: 255, unique: true })
    token!: string;

    @Column({ type: "varchar", length: 50, nullable: true })
    ipAddress!: string | null;

    @Column({ type: "text", nullable: true })
    userAgent!: string | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
