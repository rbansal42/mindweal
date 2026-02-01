import { Metadata } from "next";
import Link from "next/link";
import { format, isFuture, isPast, isToday } from "date-fns";
import { Calendar, ArrowRight, Video, MapPin, Phone } from "lucide-react";
import { getServerSession } from "@/lib/auth-middleware";
import { AppDataSource } from "@/lib/db";
import { Booking } from "@/entities/Booking";
import { Therapist } from "@/entities/Therapist";
import { User } from "@/entities/User";

export const dynamic = "force-dynamic";

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
            <div className="mb-4">
                <h1 className="portal-title">
                    Welcome back, {session.user.name.split(" ")[0]}!
                </h1>
                <p className="text-gray-600 text-sm mt-0.5">
                    Here&apos;s an overview of your appointments
                </p>
            </div>

            {/* Today's Sessions */}
            {todayBookings.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
                    <h2 className="text-base font-semibold text-primary mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Today&apos;s Sessions
                    </h2>
                    <div className="space-y-2">
                        {todayBookings.map((booking) => {
                            const Icon = meetingTypeIcons[booking.meetingType];
                            return (
                                <div
                                    key={booking.id}
                                    className="bg-white rounded-lg p-3 shadow-sm"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                <Icon className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">
                                                    {booking.therapist?.name || "Therapist"}
                                                </p>
                                                <p className="text-xs text-gray-500">
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
                                                className="portal-btn portal-btn-primary portal-btn-sm"
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="portal-card">
                    <p className="text-xs text-gray-500">Upcoming</p>
                    <p className="text-2xl font-bold text-gray-900 mt-0.5">
                        {upcomingBookings.length}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">appointments</p>
                </div>
                <div className="portal-card">
                    <p className="text-xs text-gray-500">Completed</p>
                    <p className="text-2xl font-bold text-gray-900 mt-0.5">
                        {pastBookings.length}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">sessions</p>
                </div>
                <div className="portal-card">
                    <p className="text-xs text-gray-500">Next Session</p>
                    <p className="text-lg font-bold text-gray-900 mt-0.5">
                        {upcomingBookings.length > 0
                            ? format(new Date(upcomingBookings[0].startDatetime), "MMM d")
                            : "—"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {upcomingBookings.length > 0
                            ? format(new Date(upcomingBookings[0].startDatetime), "h:mm a")
                            : "No upcoming"}
                    </p>
                </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="portal-card mb-4">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-900">
                        Upcoming Appointments
                    </h2>
                    <Link
                        href="/client/appointments"
                        className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1"
                    >
                        View All
                        <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
                <div className="divide-y divide-gray-100">
                    {upcomingBookings.length === 0 ? (
                        <div className="p-6 text-center">
                            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No upcoming appointments</p>
                            <Link
                                href="/therapists"
                                className="portal-btn portal-btn-primary mt-3 inline-flex"
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
                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="p-2 rounded-lg bg-gray-100">
                                        <Icon className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 text-sm">
                                            {booking.therapist?.name || "Therapist"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {format(
                                                new Date(booking.startDatetime),
                                                "EEE, MMM d • h:mm a"
                                            )}
                                        </p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Book New Session CTA */}
            <div className="bg-gradient-to-br from-primary to-secondary-green rounded-xl p-4 text-white">
                <h3 className="text-lg font-semibold mb-1">
                    Ready to book your next session?
                </h3>
                <p className="text-white/80 text-sm mb-3">
                    Browse our therapists and find the perfect match for your needs.
                </p>
                <Link
                    href="/therapists"
                    className="inline-flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors"
                >
                    Browse Therapists
                    <ArrowRight className="w-3 h-3" />
                </Link>
            </div>
        </div>
    );
}
