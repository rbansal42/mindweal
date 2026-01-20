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

    @Column()
    userId!: string;

    @Column()
    accountId!: string;

    @Column()
    providerId!: string;

    @Column({ type: "text", nullable: true })
    accessToken!: string | null;

    @Column({ type: "text", nullable: true })
    refreshToken!: string | null;

    @Column({ type: "datetime", nullable: true })
    accessTokenExpiresAt!: Date | null;

    @Column({ type: "datetime", nullable: true })
    refreshTokenExpiresAt!: Date | null;

    @Column({ nullable: true })
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
