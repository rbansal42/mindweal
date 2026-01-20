import { Metadata } from "next";
import Link from "next/link";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import {
    Calendar,
    Users,
    TrendingUp,
    Clock,
    ArrowRight,
    CheckCircle,
    XCircle,
    AlertCircle,
} from "lucide-react";
import { AppDataSource } from "@/lib/db";
import { Booking } from "@/entities/Booking";
import { Therapist } from "@/entities/Therapist";
import { User } from "@/entities/User";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Dashboard | Admin | Mindweal by Pihu Suri",
    description: "Admin dashboard overview",
};

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

async function getDashboardStats() {
    const ds = await getDataSource();
    const bookingRepo = ds.getRepository(Booking);
    const therapistRepo = ds.getRepository(Therapist);
    const userRepo = ds.getRepository(User);

    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    // Get all bookings
    const allBookings = await bookingRepo.find({
        order: { startDatetime: "DESC" },
    });

    // Today's stats
    const todayBookings = allBookings.filter(
        (b) =>
            b.status === "confirmed" &&
            new Date(b.startDatetime) >= todayStart &&
            new Date(b.startDatetime) <= todayEnd
    );

    // Week stats
    const weekBookings = allBookings.filter(
        (b) =>
            new Date(b.startDatetime) >= weekStart &&
            new Date(b.startDatetime) <= weekEnd
    );

    // Month stats
    const monthBookings = allBookings.filter(
        (b) =>
            new Date(b.startDatetime) >= monthStart &&
            new Date(b.startDatetime) <= monthEnd
    );

    const completedThisMonth = monthBookings.filter((b) => b.status === "completed").length;
    const cancelledThisMonth = monthBookings.filter((b) => b.status === "cancelled").length;

    // Therapists count
    const therapists = await therapistRepo.find({ where: { isActive: true } });

    // Users count
    const users = await userRepo.find();
    const clients = users.filter((u) => u.role === "client");

    // Recent bookings
    const recentBookings = await Promise.all(
        allBookings.slice(0, 10).map(async (booking) => {
            const therapist = await therapistRepo.findOne({
                where: { id: booking.therapistId },
            });
            return { ...booking, therapist };
        })
    );

    return {
        todayCount: todayBookings.length,
        weekCount: weekBookings.length,
        monthTotal: monthBookings.length,
        completedThisMonth,
        cancelledThisMonth,
        therapistCount: therapists.length,
        clientCount: clients.length,
        recentBookings,
    };
}

const statusIcons = {
    confirmed: CheckCircle,
    completed: CheckCircle,
    cancelled: XCircle,
    no_show: AlertCircle,
    pending: Clock,
};

const statusColors = {
    pending: "text-yellow-500",
    confirmed: "text-green-500",
    cancelled: "text-red-500",
    completed: "text-blue-500",
    no_show: "text-gray-500",
};

export default async function AdminDashboard() {
    const stats = await getDashboardStats();

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900">
                    Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                    Overview of appointments and activity
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                            <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-sm text-gray-500">Today</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {stats.todayCount}
                    </p>
                    <p className="text-sm text-gray-500">sessions</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-blue-100">
                            <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-sm text-gray-500">This Week</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {stats.weekCount}
                    </p>
                    <p className="text-sm text-gray-500">bookings</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-green-100">
                            <Users className="w-4 h-4 text-green-600" />
                        </div>
                        <p className="text-sm text-gray-500">Therapists</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {stats.therapistCount}
                    </p>
                    <p className="text-sm text-gray-500">active</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-purple-100">
                            <TrendingUp className="w-4 h-4 text-purple-600" />
                        </div>
                        <p className="text-sm text-gray-500">This Month</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {stats.monthTotal}
                    </p>
                    <p className="text-sm text-gray-500">
                        {stats.completedThisMonth} completed
                    </p>
                </div>
            </div>

            {/* Monthly Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-6">
                <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <div>
                            <p className="text-xl font-bold text-green-700">
                                {stats.completedThisMonth}
                            </p>
                            <p className="text-sm text-green-600">Completed this month</p>
                        </div>
                    </div>
                </div>
                <div className="bg-red-50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <XCircle className="w-6 h-6 text-red-500" />
                        <div>
                            <p className="text-xl font-bold text-red-700">
                                {stats.cancelledThisMonth}
                            </p>
                            <p className="text-sm text-red-600">Cancelled this month</p>
                        </div>
                    </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <Users className="w-6 h-6 text-blue-500" />
                        <div>
                            <p className="text-xl font-bold text-blue-700">
                                {stats.clientCount}
                            </p>
                            <p className="text-sm text-blue-600">Registered clients</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl shadow-sm">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-900">
                        Recent Bookings
                    </h2>
                    <Link
                        href="/admin/bookings"
                        className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1"
                    >
                        View All
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="divide-y divide-gray-100">
                    {stats.recentBookings.length === 0 ? (
                        <div className="p-6 text-center">
                            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No bookings yet</p>
                        </div>
                    ) : (
                        stats.recentBookings.map((booking) => {
                            const StatusIcon =
                                statusIcons[booking.status as keyof typeof statusIcons];
                            return (
                                <Link
                                    key={booking.id}
                                    href={`/booking/${booking.bookingReference}`}
                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                                >
                                    <StatusIcon
                                        className={`w-5 h-5 ${
                                            statusColors[booking.status as keyof typeof statusColors]
                                        }`}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-gray-900">
                                                {booking.clientName}
                                            </p>
                                            <span className="text-gray-400">→</span>
                                            <p className="text-gray-600">
                                                {booking.therapist?.name || "Unknown"}
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {format(
                                                new Date(booking.startDatetime),
                                                "MMM d, yyyy • h:mm a"
                                            )}
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-400 font-mono">
                                        {booking.bookingReference}
                                    </span>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
                <Link
                    href="/admin/bookings/new"
                    className="bg-primary text-white rounded-xl p-4 hover:bg-primary-dark transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Calendar className="w-6 h-6" />
                        <div>
                            <h3 className="font-semibold">Create Booking</h3>
                            <p className="text-sm text-white/80">
                                Schedule a new session
                            </p>
                        </div>
                    </div>
                </Link>
                <Link
                    href="/admin/calendar"
                    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-blue-100">
                            <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">
                                Master Calendar
                            </h3>
                            <p className="text-sm text-gray-500">
                                View all schedules
                            </p>
                        </div>
                    </div>
                </Link>
                <Link
                    href="/admin/therapists"
                    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-green-100">
                            <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">
                                Manage Therapists
                            </h3>
                            <p className="text-sm text-gray-500">
                                View and edit profiles
                            </p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
