import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
} from "typeorm";
import { ClientProfile } from "./ClientProfile";

export type UserRole = "client" | "therapist" | "admin" | "reception";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 255, unique: true })
    email!: string;

    @Column({ type: "datetime", nullable: true })
    emailVerified!: Date | null;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "varchar", length: 50, nullable: true })
    phone!: string | null;

    @Column({ type: "text", nullable: true })
    image!: string | null;

    @Column({ type: "enum", enum: ["client", "therapist", "admin", "reception"], default: "client" })
    role!: UserRole;

    @Column({ type: "varchar", length: 50, default: "Asia/Kolkata" })
    timezone!: string;

    @Column({ type: "varchar", length: 36, nullable: true })
    therapistId!: string | null;

    @OneToOne(() => ClientProfile, (profile) => profile.userId)
    @JoinColumn({ name: "id", referencedColumnName: "userId" })
    clientProfile?: ClientProfile;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
