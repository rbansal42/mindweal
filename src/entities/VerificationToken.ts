import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from "typeorm";

export type VerificationType = "email_verification" | "password_reset";

@Entity("verification_tokens")
export class VerificationToken {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    identifier!: string;

    @Column({ unique: true })
    token!: string;

    @Column({ type: "enum", enum: ["email_verification", "password_reset"] })
    type!: VerificationType;

    @Column({ type: "datetime" })
    expiresAt!: Date;

    @CreateDateColumn()
    createdAt!: Date;
}
