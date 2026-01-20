import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from "typeorm";

export type UserRole = "client" | "therapist" | "admin" | "reception";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ unique: true })
    email!: string;

    @Column({ type: "datetime", nullable: true })
    emailVerified!: Date | null;

    @Column({ nullable: true })
    passwordHash!: string | null;

    @Column()
    name!: string;

    @Column({ nullable: true })
    phone!: string | null;

    @Column({ nullable: true })
    image!: string | null;

    @Column({ type: "enum", enum: ["client", "therapist", "admin", "reception"], default: "client" })
    role!: UserRole;

    @Column({ default: "Asia/Kolkata" })
    timezone!: string;

    @Column({ nullable: true })
    therapistId!: string | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
