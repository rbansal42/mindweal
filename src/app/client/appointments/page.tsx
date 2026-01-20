import { Metadata } from "next";
import Link from "next/link";
import { format, isFuture, isPast } from "date-fns";
import { Calendar, Video, MapPin, Phone, ArrowRight, Filter } from "lucide-react";
import { getServerSession } from "@/lib/auth-middleware";
import { AppDataSource } from "@/lib/db";
import { Booking } from "@/entities/Booking";
import { Therapist } from "@/entities/Therapist";
import { User } from "@/entities/User";

export const metadata: Metadata = {
    title: "Appointments | Client Portal | Mindweal by Pihu Suri",
    description: "View all your therapy appointments",
};

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

async function getClientBookings(userId: string) {
    const ds = await getDataSource();
    const bookingRepo = ds.getRepository(Booking);
    const userRepo = ds.getRepository(User);

    const user = await userRepo.findOne({ where: { id: userId } });

    const bookings = await bookingRepo.find({
        where: [
            { clientId: userId },
            ...(user ? [{ clientEmail: user.email }] : []),
        ],
        order: { startDatetime: "DESC" },
    });

    const therapistRepo = ds.getRepository(Therapist);
    const bookingsWithTherapists = await Promise.all(
        bookings.map(async (booking) => {
            const therapist = await therapistRepo.findOne({
                where: { id: booking.therapistId },
            });
            return { ...booking, therapist };
        })
    );

    return bookingsWithTherapists;
}

const meetingTypeIcons = {
    in_person: MapPin,
    video: Video,
    phone: Phone,
};

const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800",
    no_show: "bg-gray-100 text-gray-800",
};

export default async function AppointmentsPage() {
    const session = await getServerSession();
    if (!session) return null;

    const bookings = await getClientBookings(session.user.id);

    const upcomingBookings = bookings.filter(
        (b) => b.status === "confirmed" && isFuture(new Date(b.startDatetime))
    );

    const pastBookings = bookings.filter(
        (b) =>
            isPast(new Date(b.endDatetime)) ||
            b.status === "completed" ||
            b.status === "cancelled" ||
            b.status === "no_show"
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        My Appointments
                    </h1>
                    <p className="text-gray-600 mt-1">
                        View and manage all your therapy sessions
                    </p>
                </div>
                <Link
                    href="/therapists"
                    className="btn btn-primary"
                >
                    Book New Session
                </Link>
            </div>

            {/* Upcoming Appointments */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Upcoming ({upcomingBookings.length})
                </h2>
                {upcomingBookings.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">
                            No upcoming appointments
                        </p>
                        <Link
                            href="/therapists"
                            className="btn btn-primary inline-flex"
                        >
                            Book a Session
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {upcomingBookings.map((booking) => {
                            const Icon = meetingTypeIcons[booking.meetingType];
                            return (
                                <Link
                                    key={booking.id}
                                    href={`/booking/${booking.bookingReference}`}
                                    className="block bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-lg bg-primary/10">
                                            <Icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        {booking.therapist?.name || "Therapist"}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {booking.therapist?.title}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                                                        statusColors[booking.status]
                                                    }`}
                                                >
                                                    {booking.status}
                                                </span>
                                            </div>
                                            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {format(
                                                        new Date(booking.startDatetime),
                                                        "EEE, MMMM d, yyyy"
                                                    )}
                                                </span>
                                                <span>
                                                    {format(new Date(booking.startDatetime), "h:mm a")} -{" "}
                                                    {format(new Date(booking.endDatetime), "h:mm a")}
                                                </span>
                                            </div>
                                            {booking.meetingType === "video" && booking.meetingLink && (
                                                <div className="mt-3">
                                                    <a
                                                        href={booking.meetingLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="inline-flex items-center gap-2 text-primary hover:text-primary-dark text-sm font-medium"
                                                    >
                                                        <Video className="w-4 h-4" />
                                                        Join Video Call
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Past Appointments */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Past Sessions ({pastBookings.length})
                </h2>
                {pastBookings.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                        <p className="text-gray-500">No past sessions yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pastBookings.map((booking) => {
                            const Icon = meetingTypeIcons[booking.meetingType];
                            return (
                                <Link
                                    key={booking.id}
                                    href={`/booking/${booking.bookingReference}`}
                                    className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="p-2 rounded-lg bg-gray-100">
                                        <Icon className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900">
                                            {booking.therapist?.name || "Therapist"}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {format(
                                                new Date(booking.startDatetime),
                                                "MMM d, yyyy • h:mm a"
                                            )}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                                            statusColors[booking.status]
                                        }`}
                                    >
                                        {booking.status}
                                    </span>
                                    <ArrowRight className="w-5 h-5 text-gray-400" />
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
