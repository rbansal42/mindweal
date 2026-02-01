import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { Therapist } from "./Therapist";
import { SessionType } from "./SessionType";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
export type BookingMeetingType = "in_person" | "video" | "phone";

@Entity("bookings")
export class Booking {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 50, unique: true })
    bookingReference!: string;

    @Column({ type: "varchar", length: 36 })
    therapistId!: string;

    @ManyToOne(() => Therapist)
    @JoinColumn({ name: "therapistId" })
    therapist!: Therapist;

    @Column({ type: "varchar", length: 36, nullable: true })
    clientId!: string | null;

    @Column({ type: "varchar", length: 36, nullable: true })
    sessionTypeId!: string | null;

    @ManyToOne(() => SessionType)
    @JoinColumn({ name: "sessionTypeId" })
    sessionType?: SessionType;
    @Column({ type: "varchar", length: 255 })
    clientName!: string;

    @Column({ type: "varchar", length: 255 })
    clientEmail!: string;

    @Column({ type: "varchar", length: 50, nullable: true })
    clientPhone!: string | null;

    @Column({ type: "datetime" })
    startDatetime!: Date;

    @Column({ type: "datetime" })
    endDatetime!: Date;

    @Column({ type: "varchar", length: 50, default: "Asia/Kolkata" })
    timezone!: string;

    @Column({ type: "enum", enum: ["pending", "confirmed", "cancelled", "completed", "no_show"], default: "confirmed" })
    status!: BookingStatus;

    @Column({ type: "text", nullable: true })
    cancellationReason!: string | null;

    @Column({ type: "varchar", length: 36, nullable: true })
    cancelledBy!: string | null;

    @Column({ type: "datetime", nullable: true })
    cancelledAt!: Date | null;

    @Column({ type: "enum", enum: ["in_person", "video", "phone"] })
    meetingType!: BookingMeetingType;

    @Column({ type: "text", nullable: true })
    meetingLink!: string | null;

    @Column({ type: "varchar", length: 255, nullable: true })
    meetingLocation!: string | null;

    @Column({ type: "text", nullable: true })
    clientNotes!: string | null;

    @Column({ type: "text", nullable: true })
    internalNotes!: string | null;

    @Column({ type: "datetime", nullable: true })
    reminderSentAt!: Date | null;

    @Column({ type: "varchar", length: 36, nullable: true })
    createdBy!: string | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
