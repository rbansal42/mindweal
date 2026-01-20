import { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Video, MapPin, Phone, ArrowRight, Plus, Download } from "lucide-react";
import { AppDataSource } from "@/lib/db";
import { Booking } from "@/entities/Booking";
import { Therapist } from "@/entities/Therapist";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "All Bookings | Admin | Mindweal by Pihu Suri",
    description: "View and manage all bookings",
};

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

async function getAllBookings() {
    const ds = await getDataSource();
    const bookingRepo = ds.getRepository(Booking);
    const therapistRepo = ds.getRepository(Therapist);

    const bookings = await bookingRepo.find({
        order: { startDatetime: "DESC" },
    });

    const therapists = await therapistRepo.find();

    return bookings.map((booking) => {
        const therapist = therapists.find((t) => t.id === booking.therapistId);
        return { ...booking, therapist };
    });
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

export default async function AdminBookingsPage() {
    const bookings = await getAllBookings();

    // Stats
    const stats = {
        total: bookings.length,
        confirmed: bookings.filter((b) => b.status === "confirmed").length,
        completed: bookings.filter((b) => b.status === "completed").length,
        cancelled: bookings.filter((b) => b.status === "cancelled").length,
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">
                        All Bookings
                    </h1>
                    <p className="text-gray-600 mt-1">
                        View and manage all appointments across therapists
                    </p>
                </div>
                <Link href="/admin/bookings/new" className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Booking
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-white rounded-xl p-3 shadow-sm">
                    <p className="text-gray-500 text-sm">Total</p>
                    <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3">
                    <p className="text-green-600 text-sm">Confirmed</p>
                    <p className="text-xl font-bold text-green-700">{stats.confirmed}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-blue-600 text-sm">Completed</p>
                    <p className="text-xl font-bold text-blue-700">{stats.completed}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3">
                    <p className="text-red-600 text-sm">Cancelled</p>
                    <p className="text-xl font-bold text-red-700">{stats.cancelled}</p>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left text-sm font-medium text-gray-500 px-4 py-3">
                                    Reference
                                </th>
                                <th className="text-left text-sm font-medium text-gray-500 px-4 py-3">
                                    Client
                                </th>
                                <th className="text-left text-sm font-medium text-gray-500 px-4 py-3">
                                    Therapist
                                </th>
                                <th className="text-left text-sm font-medium text-gray-500 px-4 py-3">
                                    Date & Time
                                </th>
                                <th className="text-left text-sm font-medium text-gray-500 px-4 py-3">
                                    Type
                                </th>
                                <th className="text-left text-sm font-medium text-gray-500 px-4 py-3">
                                    Status
                                </th>
                                <th className="text-right text-sm font-medium text-gray-500 px-4 py-3">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {bookings.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center">
                                        <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No bookings found</p>
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((booking) => {
                                    const Icon = meetingTypeIcons[booking.meetingType];
                                    return (
                                        <tr
                                            key={booking.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-sm text-primary font-medium">
                                                    {booking.bookingReference}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {booking.clientName}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {booking.clientEmail}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-gray-900">
                                                    {booking.therapist?.name || "—"}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-gray-900">
                                                    {format(
                                                        new Date(booking.startDatetime),
                                                        "MMM d, yyyy"
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {format(
                                                        new Date(booking.startDatetime),
                                                        "h:mm a"
                                                    )}{" "}
                                                    -{" "}
                                                    {format(
                                                        new Date(booking.endDatetime),
                                                        "h:mm a"
                                                    )}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Icon className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="text-sm text-gray-600 capitalize">
                                                        {booking.meetingType.replace("_", "-")}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                                        statusColors[booking.status]
                                                    }`}
                                                >
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link
                                                    href={`/booking/${booking.bookingReference}`}
                                                    className="text-primary hover:text-primary-dark text-sm font-medium"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
