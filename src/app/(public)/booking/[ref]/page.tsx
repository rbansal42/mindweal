import { Metadata } from "next";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { Calendar, Clock, Video, MapPin, Phone, User, Download, ArrowLeft } from "lucide-react";
import { AppDataSource } from "@/lib/db";
import { Booking } from "@/entities/Booking";
import { Therapist } from "@/entities/Therapist";
import { SessionType } from "@/entities/SessionType";
import CancelBookingButton from "./CancelBookingButton";

export const dynamic = "force-dynamic";

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

interface PageProps {
    params: Promise<{ ref: string }>;
}

async function getBooking(ref: string) {
    const ds = await getDataSource();
    const bookingRepo = ds.getRepository(Booking);

    let booking = await bookingRepo.findOne({
        where: { bookingReference: ref },
    });

    if (!booking) {
        booking = await bookingRepo.findOne({
            where: { id: ref },
        });
    }

    if (!booking) return null;

    const therapistRepo = ds.getRepository(Therapist);
    const sessionTypeRepo = ds.getRepository(SessionType);

    const therapist = await therapistRepo.findOne({
        where: { id: booking.therapistId },
    });

    const sessionType = booking.sessionTypeId
        ? await sessionTypeRepo.findOne({
              where: { id: booking.sessionTypeId },
          })
        : null;

    return {
        ...booking,
        therapist,
        sessionType,
    };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { ref } = await params;
    const booking = await getBooking(ref);

    if (!booking) {
        return {
            title: "Booking Not Found | Mindweal by Pihu Suri",
        };
    }

    return {
        title: `Booking ${booking.bookingReference} | Mindweal by Pihu Suri`,
        description: `View and manage your therapy booking with ${booking.therapist?.name || "our therapist"}`,
    };
}

const meetingTypeIcons = {
    in_person: MapPin,
    video: Video,
    phone: Phone,
};

const meetingTypeLabels = {
    in_person: "In-Person",
    video: "Video Call",
    phone: "Phone Call",
};

const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800",
    no_show: "bg-gray-100 text-gray-800",
};

export default async function BookingPage({ params }: PageProps) {
    const { ref } = await params;
    const booking = await getBooking(ref);

    if (!booking) {
        notFound();
    }

    const Icon = meetingTypeIcons[booking.meetingType];
    const isPast = new Date(booking.startDatetime) < new Date();
    const canCancel = booking.status === "confirmed" && !isPast;

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-[#f0fdf9] to-[#ecfdf5] py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-primary/5 px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Booking Reference</p>
                                <p className="font-mono font-semibold text-primary text-lg">
                                    {booking.bookingReference}
                                </p>
                            </div>
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                                    statusColors[booking.status]
                                }`}
                            >
                                {booking.status}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Therapist */}
                        {booking.therapist && (
                            <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                                {booking.therapist.photoUrl ? (
                                    <img
                                        src={booking.therapist.photoUrl}
                                        alt={booking.therapist.name}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="w-8 h-8 text-primary" />
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {booking.therapist.name}
                                    </h2>
                                    <p className="text-gray-500">{booking.therapist.title}</p>
                                </div>
                            </div>
                        )}

                        {/* Session Details */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-primary/10">
                                    <Calendar className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Date & Time</p>
                                    <p className="font-medium text-gray-900">
                                        {format(new Date(booking.startDatetime), "EEEE, MMMM d, yyyy")}
                                    </p>
                                    <p className="text-gray-600">
                                        {format(new Date(booking.startDatetime), "h:mm a")} -{" "}
                                        {format(new Date(booking.endDatetime), "h:mm a")}
                                    </p>
                                </div>
                            </div>

                            {booking.sessionType && (
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-primary/10">
                                        <Icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Session Type</p>
                                        <p className="font-medium text-gray-900">
                                            {booking.sessionType.name}
                                        </p>
                                        <p className="text-gray-600">
                                            {meetingTypeLabels[booking.meetingType]} •{" "}
                                            {booking.sessionType.duration} mins
                                        </p>
                                    </div>
                                </div>
                            )}

                            {booking.meetingType === "video" && booking.meetingLink && (
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-primary/10">
                                        <Video className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Video Call Link</p>
                                        <a
                                            href={booking.meetingLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline break-all"
                                        >
                                            Join Google Meet
                                        </a>
                                    </div>
                                </div>
                            )}

                            {booking.meetingType === "in_person" && booking.meetingLocation && (
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-primary/10">
                                        <MapPin className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Location</p>
                                        <p className="font-medium text-gray-900">
                                            {booking.meetingLocation}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Cancellation Info */}
                        {booking.status === "cancelled" && (
                            <div className="bg-red-50 rounded-xl p-4">
                                <p className="text-sm font-medium text-red-800">
                                    This booking was cancelled
                                </p>
                                {booking.cancellationReason && (
                                    <p className="text-sm text-red-700 mt-1">
                                        Reason: {booking.cancellationReason}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="pt-6 border-t border-gray-100 space-y-3">
                            <a
                                href={`/api/bookings/${booking.bookingReference}/ics`}
                                className="w-full btn btn-secondary flex items-center justify-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Add to Calendar
                            </a>

                            {canCancel && (
                                <CancelBookingButton
                                    bookingReference={booking.bookingReference}
                                />
                            )}

                            {booking.therapist && !isPast && booking.status === "cancelled" && (
                                <Link
                                    href={`/book/${booking.therapist.slug}`}
                                    className="w-full btn btn-primary flex items-center justify-center"
                                >
                                    Book Again
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
