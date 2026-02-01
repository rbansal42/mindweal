import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";

export type MeetingType = "in_person" | "video" | "phone";

@Entity("session_types")
export class SessionType {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 36 })
    therapistId!: string;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "int" })
    duration!: number;

    @Column({ type: "enum", enum: ["in_person", "video", "phone"] })
    meetingType!: MeetingType;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    price!: number | null;

    @Column({ type: "text", nullable: true })
    description!: string | null;

    @Column({ type: "boolean", default: true })
    isActive!: boolean;

    @Column({ type: "varchar", length: 20, default: "#00A99D" })
    color!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
