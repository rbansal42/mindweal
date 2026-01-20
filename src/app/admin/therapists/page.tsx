import { Metadata } from "next";
import Link from "next/link";
import { Users, ExternalLink, Mail, Phone } from "lucide-react";
import { AppDataSource } from "@/lib/db";
import { Therapist } from "@/entities/Therapist";
import { SessionType } from "@/entities/SessionType";
import { Booking } from "@/entities/Booking";

export const metadata: Metadata = {
    title: "Therapists | Admin | Mindweal by Pihu Suri",
    description: "Manage therapist profiles",
};

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

async function getTherapists() {
    const ds = await getDataSource();
    const therapistRepo = ds.getRepository(Therapist);
    const sessionTypeRepo = ds.getRepository(SessionType);
    const bookingRepo = ds.getRepository(Booking);

    const therapists = await therapistRepo.find({
        order: { name: "ASC" },
    });

    return Promise.all(
        therapists.map(async (therapist) => {
            const sessionTypes = await sessionTypeRepo.count({
                where: { therapistId: therapist.id, isActive: true },
            });

            const bookings = await bookingRepo.count({
                where: { therapistId: therapist.id },
            });

            const confirmedBookings = await bookingRepo.count({
                where: { therapistId: therapist.id, status: "confirmed" },
            });

            return {
                ...therapist,
                sessionTypeCount: sessionTypes,
                totalBookings: bookings,
                upcomingBookings: confirmedBookings,
            };
        })
    );
}

export default async function TherapistsPage() {
    const therapists = await getTherapists();

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Therapists</h1>
                <p className="text-gray-600 mt-1">
                    Manage therapist profiles and view their statistics
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {therapists.length === 0 ? (
                    <div className="col-span-2 bg-white rounded-2xl p-12 text-center shadow-sm">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No therapists found</p>
                    </div>
                ) : (
                    therapists.map((therapist) => (
                        <div
                            key={therapist.id}
                            className={`bg-white rounded-2xl shadow-sm overflow-hidden ${
                                !therapist.isActive ? "opacity-60" : ""
                            }`}
                        >
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    {therapist.photoUrl ? (
                                        <img
                                            src={therapist.photoUrl}
                                            alt={therapist.name}
                                            className="w-16 h-16 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-primary text-xl font-medium">
                                                {therapist.name.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {therapist.name}
                                            </h3>
                                            {!therapist.isActive && (
                                                <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-500 text-sm">
                                            {therapist.title}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                            <a
                                                href={`mailto:${therapist.email}`}
                                                className="flex items-center gap-1 hover:text-primary"
                                            >
                                                <Mail className="w-4 h-4" />
                                                {therapist.email}
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100">
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {therapist.sessionTypeCount}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Session Types
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {therapist.upcomingBookings}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Upcoming
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {therapist.totalBookings}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Total Bookings
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                                <a
                                    href={`/book/${therapist.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    View Booking Page
                                </a>
                                <span className="text-xs text-gray-400 font-mono">
                                    /{therapist.slug}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
