import { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Video, MapPin, Phone, ArrowRight } from "lucide-react";
import { getServerSession } from "@/lib/auth-middleware";
import { AppDataSource } from "@/lib/db";
import { Booking } from "@/entities/Booking";
import { Therapist } from "@/entities/Therapist";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "All Bookings | Therapist Portal | Mindweal by Pihu Suri",
    description: "View all your bookings",
};

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

async function getTherapistBookings(userEmail: string) {
    const ds = await getDataSource();
    const therapistRepo = ds.getRepository(Therapist);
    const bookingRepo = ds.getRepository(Booking);

    const therapist = await therapistRepo.findOne({
        where: { email: userEmail },
    });

    if (!therapist) return null;

    const bookings = await bookingRepo.find({
        where: { therapistId: therapist.id },
        order: { startDatetime: "DESC" },
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

export default async function BookingsPage() {
    const session = await getServerSession();
    if (!session) return null;

    const data = await getTherapistBookings(session.user.email);

    if (!data) {
        return (
            <div className="max-w-4xl mx-auto text-center py-8">
                <h1 className="portal-title">
                    Therapist Profile Not Found
                </h1>
                <p className="text-gray-600 text-sm mt-2">
                    Your account is not linked to a therapist profile.
                </p>
            </div>
        );
    }

    const { bookings } = data;

    // Group bookings by status
    const confirmed = bookings.filter((b) => b.status === "confirmed");
    const completed = bookings.filter((b) => b.status === "completed");
    const cancelled = bookings.filter((b) => b.status === "cancelled");
    const noShow = bookings.filter((b) => b.status === "no_show");

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            <div className="mb-4">
                <h1 className="portal-title">All Bookings</h1>
                <p className="text-gray-600 text-sm mt-1">
                    View and manage all your appointments
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-green-600 text-xs font-medium">Confirmed</p>
                    <p className="text-xl font-bold text-green-700">{confirmed.length}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-blue-600 text-xs font-medium">Completed</p>
                    <p className="text-xl font-bold text-blue-700">{completed.length}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-red-600 text-xs font-medium">Cancelled</p>
                    <p className="text-xl font-bold text-red-700">{cancelled.length}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-600 text-xs font-medium">No Show</p>
                    <p className="text-xl font-bold text-gray-700">{noShow.length}</p>
                </div>
            </div>

            {/* Bookings List */}
            <div className="portal-card !p-0">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900">
                        All Bookings ({bookings.length})
                    </h2>
                </div>
                <div className="divide-y divide-gray-100">
                    {bookings.length === 0 ? (
                        <div className="p-6 text-center">
                            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No bookings yet</p>
                        </div>
                    ) : (
                        bookings.map((booking) => {
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
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-gray-900 text-sm">
                                                {booking.clientName}
                                            </p>
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                                    statusColors[booking.status]
                                                }`}
                                            >
                                                {booking.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {format(
                                                new Date(booking.startDatetime),
                                                "EEE, MMM d, yyyy • h:mm a"
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-400 font-mono">
                                            {booking.bookingReference}
                                        </p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
