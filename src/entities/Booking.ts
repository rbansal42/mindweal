import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
export type BookingMeetingType = "in_person" | "video" | "phone";

@Entity("bookings")
export class Booking {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ unique: true })
    bookingReference!: string;

    @Column()
    therapistId!: string;

    @Column({ nullable: true })
    clientId!: string | null;

    @Column({ nullable: true })
    sessionTypeId!: string | null;

    @Column()
    clientName!: string;

    @Column()
    clientEmail!: string;

    @Column({ nullable: true })
    clientPhone!: string | null;

    @Column({ type: "datetime" })
    startDatetime!: Date;

    @Column({ type: "datetime" })
    endDatetime!: Date;

    @Column({ default: "Asia/Kolkata" })
    timezone!: string;

    @Column({ type: "enum", enum: ["pending", "confirmed", "cancelled", "completed", "no_show"], default: "confirmed" })
    status!: BookingStatus;

    @Column({ type: "text", nullable: true })
    cancellationReason!: string | null;

    @Column({ nullable: true })
    cancelledBy!: string | null;

    @Column({ type: "datetime", nullable: true })
    cancelledAt!: Date | null;

    @Column({ type: "enum", enum: ["in_person", "video", "phone"] })
    meetingType!: BookingMeetingType;

    @Column({ nullable: true })
    meetingLink!: string | null;

    @Column({ nullable: true })
    meetingLocation!: string | null;

    @Column({ type: "text", nullable: true })
    clientNotes!: string | null;

    @Column({ type: "text", nullable: true })
    internalNotes!: string | null;

    @Column({ type: "datetime", nullable: true })
    reminderSentAt!: Date | null;

    @Column({ nullable: true })
    createdBy!: string | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
