import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from "typeorm";

@Entity("accounts")
export class Account {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    userId!: string;

    @Column()
    provider!: string;

    @Column()
    providerAccountId!: string;

    @Column({ type: "text", nullable: true })
    accessToken!: string | null;

    @Column({ type: "text", nullable: true })
    refreshToken!: string | null;

    @Column({ type: "datetime", nullable: true })
    expiresAt!: Date | null;

    @Column({ nullable: true })
    tokenType!: string | null;

    @Column({ nullable: true })
    scope!: string | null;

    @Column({ nullable: true })
    idToken!: string | null;

    @CreateDateColumn()
    createdAt!: Date;
}
