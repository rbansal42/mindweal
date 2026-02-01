import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity("accounts")
export class Account {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 36 })
    userId!: string;

    @Column({ type: "varchar", length: 255 })
    accountId!: string;

    @Column({ type: "varchar", length: 50 })
    providerId!: string;

    @Column({ type: "text", nullable: true })
    accessToken!: string | null;

    @Column({ type: "text", nullable: true })
    refreshToken!: string | null;

    @Column({ type: "datetime", nullable: true })
    accessTokenExpiresAt!: Date | null;

    @Column({ type: "datetime", nullable: true })
    refreshTokenExpiresAt!: Date | null;

    @Column({ type: "varchar", length: 255, nullable: true })
    scope!: string | null;

    @Column({ type: "text", nullable: true })
    idToken!: string | null;

    @Column({ type: "text", nullable: true })
    password!: string | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
