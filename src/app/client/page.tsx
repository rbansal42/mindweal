import { Metadata } from "next";
import Link from "next/link";
import { format, isFuture, isPast, isToday } from "date-fns";
import { Calendar, Clock, ArrowRight, Video, MapPin, Phone } from "lucide-react";
import { getServerSession } from "@/lib/auth-middleware";
import { AppDataSource } from "@/lib/db";
import { Booking } from "@/entities/Booking";
import { Therapist } from "@/entities/Therapist";
import { User } from "@/entities/User";

export const metadata: Metadata = {
    title: "Dashboard | Client Portal | Mindweal by Pihu Suri",
    description: "View and manage your therapy appointments",
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

    // Find user by better-auth user ID
    const user = await userRepo.findOne({ where: { id: userId } });

    // Also search by email from the client fields
    const bookings = await bookingRepo.find({
        where: [
            { clientId: userId },
            ...(user ? [{ clientEmail: user.email }] : []),
        ],
        order: { startDatetime: "ASC" },
    });

    // Load therapist data
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

export default async function ClientDashboard() {
    const session = await getServerSession();
    if (!session) return null;

    const bookings = await getClientBookings(session.user.id);

    const upcomingBookings = bookings.filter(
        (b) =>
            b.status === "confirmed" &&
            (isFuture(new Date(b.startDatetime)) || isToday(new Date(b.startDatetime)))
    );

    const todayBookings = upcomingBookings.filter((b) =>
        isToday(new Date(b.startDatetime))
    );

    const pastBookings = bookings.filter(
        (b) => isPast(new Date(b.endDatetime)) && b.status !== "cancelled"
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {session.user.name.split(" ")[0]}!
                </h1>
                <p className="text-gray-600 mt-1">
                    Here&apos;s an overview of your appointments
                </p>
            </div>

            {/* Today's Sessions */}
            {todayBookings.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-8">
                    <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Today&apos;s Sessions
                    </h2>
                    <div className="space-y-4">
                        {todayBookings.map((booking) => {
                            const Icon = meetingTypeIcons[booking.meetingType];
                            return (
                                <div
                                    key={booking.id}
                                    className="bg-white rounded-xl p-4 shadow-sm"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-lg bg-primary/10">
                                                <Icon className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {booking.therapist?.name || "Therapist"}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {format(new Date(booking.startDatetime), "h:mm a")} -{" "}
                                                    {format(new Date(booking.endDatetime), "h:mm a")}
                                                </p>
                                            </div>
                                        </div>
                                        {booking.meetingType === "video" && booking.meetingLink && (
                                            <a
                                                href={booking.meetingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-primary"
                                            >
                                                Join Call
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <p className="text-sm text-gray-500">Upcoming</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                        {upcomingBookings.length}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">appointments</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <p className="text-sm text-gray-500">Completed</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                        {pastBookings.length}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">sessions</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <p className="text-sm text-gray-500">Next Session</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                        {upcomingBookings.length > 0
                            ? format(new Date(upcomingBookings[0].startDatetime), "MMM d")
                            : "—"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        {upcomingBookings.length > 0
                            ? format(new Date(upcomingBookings[0].startDatetime), "h:mm a")
                            : "No upcoming"}
                    </p>
                </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-2xl shadow-sm mb-8">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Upcoming Appointments
                    </h2>
                    <Link
                        href="/client/appointments"
                        className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1"
                    >
                        View All
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="divide-y divide-gray-100">
                    {upcomingBookings.length === 0 ? (
                        <div className="p-8 text-center">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No upcoming appointments</p>
                            <Link
                                href="/therapists"
                                className="btn btn-primary mt-4 inline-flex"
                            >
                                Book a Session
                            </Link>
                        </div>
                    ) : (
                        upcomingBookings.slice(0, 5).map((booking) => {
                            const Icon = meetingTypeIcons[booking.meetingType];
                            return (
                                <Link
                                    key={booking.id}
                                    href={`/booking/${booking.bookingReference}`}
                                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="p-3 rounded-lg bg-gray-100">
                                        <Icon className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900">
                                            {booking.therapist?.name || "Therapist"}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {format(
                                                new Date(booking.startDatetime),
                                                "EEE, MMM d • h:mm a"
                                            )}
                                        </p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-400" />
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Book New Session CTA */}
            <div className="bg-gradient-to-br from-primary to-secondary-green rounded-2xl p-6 text-white">
                <h3 className="text-xl font-semibold mb-2">
                    Ready to book your next session?
                </h3>
                <p className="text-white/80 mb-4">
                    Browse our therapists and find the perfect match for your needs.
                </p>
                <Link
                    href="/therapists"
                    className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                    Browse Therapists
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
