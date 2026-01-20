import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
    Calendar,
    Clock,
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
                className="inline-flex items-center gap-2 text-gray-600 hover:text-secondary-green mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Bookings
            </Link>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Booking Reference</p>
                            <p className="font-mono font-semibold text-secondary-green text-lg">
                                {booking.bookingReference}
                            </p>
                        </div>
                        <span
                            className={`px-4 py-2 rounded-full text-sm font-medium capitalize border ${
                                statusColors[booking.status]
                            }`}
                        >
                            {booking.status}
                        </span>
                    </div>
                </div>

                {/* Client Info */}
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-4">
                        Client Information
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-secondary-green/10 flex items-center justify-center">
                            <User className="w-8 h-8 text-secondary-green" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {booking.clientName}
                            </h2>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                <a
                                    href={`mailto:${booking.clientEmail}`}
                                    className="flex items-center gap-1 hover:text-secondary-green"
                                >
                                    <Mail className="w-4 h-4" />
                                    {booking.clientEmail}
                                </a>
                                {booking.clientPhone && (
                                    <a
                                        href={`tel:${booking.clientPhone}`}
                                        className="flex items-center gap-1 hover:text-secondary-green"
                                    >
                                        <Phone className="w-4 h-4" />
                                        {booking.clientPhone}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Session Details */}
                <div className="p-6 space-y-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-4">
                        Session Details
                    </h3>

                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-secondary-green/10">
                            <Calendar className="w-5 h-5 text-secondary-green" />
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

                    {sessionType && (
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-secondary-green/10">
                                <Icon className="w-5 h-5 text-secondary-green" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Session Type</p>
                                <p className="font-medium text-gray-900">
                                    {sessionType.name}
                                </p>
                                <p className="text-gray-600">
                                    {meetingTypeLabels[booking.meetingType]} •{" "}
                                    {sessionType.duration} mins
                                </p>
                            </div>
                        </div>
                    )}

                    {booking.meetingType === "video" && booking.meetingLink && (
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-secondary-green/10">
                                <Video className="w-5 h-5 text-secondary-green" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Video Call Link</p>
                                <a
                                    href={booking.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-secondary-green hover:underline"
                                >
                                    Join Google Meet
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    )}

                    {booking.meetingType === "in_person" && booking.meetingLocation && (
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-secondary-green/10">
                                <MapPin className="w-5 h-5 text-secondary-green" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Location</p>
                                <p className="font-medium text-gray-900">
                                    {booking.meetingLocation}
                                </p>
                            </div>
                        </div>
                    )}

                    {booking.clientNotes && (
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-secondary-green/10">
                                <FileText className="w-5 h-5 text-secondary-green" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Client Notes</p>
                                <p className="text-gray-900">{booking.clientNotes}</p>
                            </div>
                        </div>
                    )}

                    {booking.status === "cancelled" && (
                        <div className="bg-red-50 rounded-xl p-4 mt-4">
                            <p className="text-sm font-medium text-red-800">
                                Cancellation Details
                            </p>
                            {booking.cancellationReason && (
                                <p className="text-sm text-red-700 mt-1">
                                    Reason: {booking.cancellationReason}
                                </p>
                            )}
                            {booking.cancelledAt && (
                                <p className="text-sm text-red-600 mt-1">
                                    Cancelled on:{" "}
                                    {format(new Date(booking.cancelledAt), "MMM d, yyyy h:mm a")}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <BookingActions
                        bookingId={booking.id}
                        status={booking.status}
                    />
                </div>
            </div>
        </div>
    );
}
