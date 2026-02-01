import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
    Calendar,
    Video,
    MapPin,
    Phone,
    User,
    Mail,
    ArrowLeft,
    ExternalLink,
    FileText,
} from "lucide-react";
import { getServerSession } from "@/lib/auth-middleware";
import { AppDataSource } from "@/lib/db";
import { Booking } from "@/entities/Booking";
import { Therapist } from "@/entities/Therapist";
import { SessionType } from "@/entities/SessionType";
import BookingActions from "./BookingActions";

export const dynamic = "force-dynamic";

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getBooking(id: string, userEmail: string) {
    const ds = await getDataSource();
    const bookingRepo = ds.getRepository(Booking);
    const therapistRepo = ds.getRepository(Therapist);
    const sessionTypeRepo = ds.getRepository(SessionType);

    const therapist = await therapistRepo.findOne({
        where: { email: userEmail },
    });

    if (!therapist) return null;

    const booking = await bookingRepo.findOne({
        where: { id, therapistId: therapist.id },
    });

    if (!booking) return null;

    const sessionType = booking.sessionTypeId
        ? await sessionTypeRepo.findOne({ where: { id: booking.sessionTypeId } })
        : null;

    return { booking, sessionType };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    return {
        title: "Booking Details | Therapist Portal | Mindweal by Pihu Suri",
        description: "View booking details",
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
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    confirmed: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    completed: "bg-blue-100 text-blue-800 border-blue-200",
    no_show: "bg-gray-100 text-gray-800 border-gray-200",
};

export default async function BookingDetailPage({ params }: PageProps) {
    const session = await getServerSession();
    if (!session) return null;

    const { id } = await params;
    const data = await getBooking(id, session.user.email);

    if (!data) {
        notFound();
    }

    const { booking, sessionType } = data;
    const Icon = meetingTypeIcons[booking.meetingType];

    return (
        <div className="max-w-3xl mx-auto">
            <Link
                href="/therapist/bookings"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-secondary-green mb-4 transition-colors text-sm"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Bookings
            </Link>

            <div className="portal-card !p-0 overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-gray-500">Booking Reference</p>
                            <p className="font-mono font-semibold text-secondary-green text-base">
                                {booking.bookingReference}
                            </p>
                        </div>
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-medium capitalize border ${
                                statusColors[booking.status]
                            }`}
                        >
                            {booking.status}
                        </span>
                    </div>
                </div>

                {/* Client Info */}
                <div className="p-4 border-b border-gray-100">
                    <h3 className="text-xs font-medium text-gray-500 mb-3">
                        Client Information
                    </h3>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-secondary-green/10 flex items-center justify-center">
                            <User className="w-6 h-6 text-secondary-green" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">
                                {booking.clientName}
                            </h2>
                            <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-600">
                                <a
                                    href={`mailto:${booking.clientEmail}`}
                                    className="flex items-center gap-1 hover:text-secondary-green"
                                >
                                    <Mail className="w-3 h-3" />
                                    {booking.clientEmail}
                                </a>
                                {booking.clientPhone && (
                                    <a
                                        href={`tel:${booking.clientPhone}`}
                                        className="flex items-center gap-1 hover:text-secondary-green"
                                    >
                                        <Phone className="w-3 h-3" />
                                        {booking.clientPhone}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Session Details */}
                <div className="p-4 space-y-3">
                    <h3 className="text-xs font-medium text-gray-500 mb-3">
                        Session Details
                    </h3>

                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-secondary-green/10">
                            <Calendar className="w-4 h-4 text-secondary-green" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Date & Time</p>
                            <p className="font-medium text-gray-900 text-sm">
                                {format(new Date(booking.startDatetime), "EEEE, MMMM d, yyyy")}
                            </p>
                            <p className="text-gray-600 text-sm">
                                {format(new Date(booking.startDatetime), "h:mm a")} -{" "}
                                {format(new Date(booking.endDatetime), "h:mm a")}
                            </p>
                        </div>
                    </div>

                    {sessionType && (
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-secondary-green/10">
                                <Icon className="w-4 h-4 text-secondary-green" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Session Type</p>
                                <p className="font-medium text-gray-900 text-sm">
                                    {sessionType.name}
                                </p>
                                <p className="text-gray-600 text-sm">
                                    {meetingTypeLabels[booking.meetingType]} •{" "}
                                    {sessionType.duration} mins
                                </p>
                            </div>
                        </div>
                    )}

                    {booking.meetingType === "video" && booking.meetingLink && (
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-secondary-green/10">
                                <Video className="w-4 h-4 text-secondary-green" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Video Call Link</p>
                                <a
                                    href={booking.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-secondary-green hover:underline text-sm"
                                >
                                    Join Google Meet
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    )}

                    {booking.meetingType === "in_person" && booking.meetingLocation && (
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-secondary-green/10">
                                <MapPin className="w-4 h-4 text-secondary-green" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Location</p>
                                <p className="font-medium text-gray-900 text-sm">
                                    {booking.meetingLocation}
                                </p>
                            </div>
                        </div>
                    )}

                    {booking.clientNotes && (
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-secondary-green/10">
                                <FileText className="w-4 h-4 text-secondary-green" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Client Notes</p>
                                <p className="text-gray-900 text-sm">{booking.clientNotes}</p>
                            </div>
                        </div>
                    )}

                    {booking.status === "cancelled" && (
                        <div className="bg-red-50 rounded-lg p-3 mt-3">
                            <p className="text-xs font-medium text-red-800">
                                Cancellation Details
                            </p>
                            {booking.cancellationReason && (
                                <p className="text-xs text-red-700 mt-1">
                                    Reason: {booking.cancellationReason}
                                </p>
                            )}
                            {booking.cancelledAt && (
                                <p className="text-xs text-red-600 mt-1">
                                    Cancelled on:{" "}
                                    {format(new Date(booking.cancelledAt), "MMM d, yyyy h:mm a")}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <BookingActions
                        bookingId={booking.id}
                        status={booking.status}
                    />
                </div>
            </div>
        </div>
    );
}
