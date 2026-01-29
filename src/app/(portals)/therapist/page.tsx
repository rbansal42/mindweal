import { Metadata } from "next";
import Link from "next/link";
import { format, isFuture, isToday, startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";
import { Calendar, Clock, Users, TrendingUp, ArrowRight, Video, MapPin, Phone } from "lucide-react";
import { getServerSession } from "@/lib/auth-middleware";
import { AppDataSource } from "@/lib/db";
import { Booking } from "@/entities/Booking";
import { Therapist } from "@/entities/Therapist";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Dashboard | Therapist Portal | Mindweal by Pihu Suri",
    description: "Manage your schedule and appointments",
};

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

async function getTherapistData(userEmail: string) {
    const ds = await getDataSource();
    const therapistRepo = ds.getRepository(Therapist);
    const bookingRepo = ds.getRepository(Booking);

    const therapist = await therapistRepo.findOne({
        where: { email: userEmail },
    });

    if (!therapist) return null;

    const bookings = await bookingRepo.find({
        where: { therapistId: therapist.id },
        order: { startDatetime: "ASC" },
    });

    return { therapist, bookings };
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

export default async function TherapistDashboard() {
    const session = await getServerSession();
    if (!session) return null;

    const data = await getTherapistData(session.user.email);

    if (!data) {
        return (
            <div className="max-w-4xl mx-auto text-center py-8">
                <h1 className="portal-title">
                    Therapist Profile Not Found
                </h1>
                <p className="text-gray-600 text-sm mt-2">
                    Your account is not linked to a therapist profile. Please contact
                    the administrator.
                </p>
            </div>
        );
    }

    const { therapist, bookings } = data;

    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);

    const todayBookings = bookings.filter(
        (b) =>
            b.status === "confirmed" &&
            new Date(b.startDatetime) >= todayStart &&
            new Date(b.startDatetime) <= todayEnd
    );

    const weekBookings = bookings.filter(
        (b) =>
            b.status === "confirmed" &&
            new Date(b.startDatetime) >= weekStart &&
            new Date(b.startDatetime) <= weekEnd
    );

    const upcomingBookings = bookings.filter(
        (b) =>
            b.status === "confirmed" &&
            (isFuture(new Date(b.startDatetime)) || isToday(new Date(b.startDatetime)))
    );

    const completedThisMonth = bookings.filter(
        (b) =>
            b.status === "completed" &&
            new Date(b.startDatetime).getMonth() === today.getMonth()
    );

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            <div className="mb-4">
                <h1 className="portal-title">
                    Welcome back, {therapist.name.split(" ")[0]}!
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                    Here&apos;s your schedule overview for today
                </p>
            </div>

            {/* Today's Schedule */}
            {todayBookings.length > 0 && (
                <div className="bg-secondary-green/5 border border-secondary-green/20 rounded-xl p-4">
                    <h2 className="text-base font-semibold text-secondary-green mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Today&apos;s Sessions ({todayBookings.length})
                    </h2>
                    <div className="space-y-2">
                        {todayBookings.map((booking) => {
                            const Icon = meetingTypeIcons[booking.meetingType];
                            const now = new Date();
                            const isOngoing =
                                now >= new Date(booking.startDatetime) &&
                                now <= new Date(booking.endDatetime);

                            return (
                                <div
                                    key={booking.id}
                                    className={`bg-white rounded-lg p-3 shadow-sm ${
                                        isOngoing ? "ring-2 ring-secondary-green" : ""
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-secondary-green/10">
                                                <Icon className="w-4 h-4 text-secondary-green" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">
                                                    {booking.clientName}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {format(new Date(booking.startDatetime), "h:mm a")} -{" "}
                                                    {format(new Date(booking.endDatetime), "h:mm a")}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isOngoing && (
                                                <span className="px-2 py-0.5 bg-secondary-green text-white text-xs font-medium rounded-full">
                                                    In Progress
                                                </span>
                                            )}
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
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="portal-card">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                            <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-xs text-gray-500">Today</p>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                        {todayBookings.length}
                    </p>
                    <p className="text-xs text-gray-500">sessions</p>
                </div>
                <div className="portal-card">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 rounded-lg bg-secondary-green/10">
                            <Clock className="w-4 h-4 text-secondary-green" />
                        </div>
                        <p className="text-xs text-gray-500">This Week</p>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                        {weekBookings.length}
                    </p>
                    <p className="text-xs text-gray-500">sessions</p>
                </div>
                <div className="portal-card">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 rounded-lg bg-blue-100">
                            <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-xs text-gray-500">Upcoming</p>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                        {upcomingBookings.length}
                    </p>
                    <p className="text-xs text-gray-500">booked</p>
                </div>
                <div className="portal-card">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 rounded-lg bg-green-100">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                        </div>
                        <p className="text-xs text-gray-500">This Month</p>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                        {completedThisMonth.length}
                    </p>
                    <p className="text-xs text-gray-500">completed</p>
                </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="portal-card !p-0">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-900">
                        Upcoming Sessions
                    </h2>
                    <Link
                        href="/therapist/schedule"
                        className="text-secondary-green hover:text-secondary-green/80 text-sm font-medium flex items-center gap-1"
                    >
                        View Schedule
                        <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
                <div className="divide-y divide-gray-100">
                    {upcomingBookings.length === 0 ? (
                        <div className="p-6 text-center">
                            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No upcoming sessions</p>
                        </div>
                    ) : (
                        upcomingBookings.slice(0, 5).map((booking) => {
                            const Icon = meetingTypeIcons[booking.meetingType];
                            return (
                                <Link
                                    key={booking.id}
                                    href={`/therapist/bookings/${booking.id}`}
                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="p-2 rounded-lg bg-gray-100">
                                        <Icon className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 text-sm">
                                            {booking.clientName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {format(
                                                new Date(booking.startDatetime),
                                                "EEE, MMM d • h:mm a"
                                            )}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                            statusColors[booking.status]
                                        }`}
                                    >
                                        {booking.status}
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                    href="/therapist/availability"
                    className="portal-card hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 text-sm">
                                Manage Availability
                            </h3>
                            <p className="text-xs text-gray-500">
                                Set your weekly schedule
                            </p>
                        </div>
                    </div>
                </Link>
                <Link
                    href="/therapist/settings"
                    className="portal-card hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-secondary-green/10">
                            <Users className="w-5 h-5 text-secondary-green" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 text-sm">
                                Booking Settings
                            </h3>
                            <p className="text-xs text-gray-500">
                                Configure session types & preferences
                            </p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
