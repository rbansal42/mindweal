import { Metadata } from "next";
import Link from "next/link";
import { Users, Plus, Archive, Mail, User } from "lucide-react";
import { AppDataSource } from "@/lib/db";
import { Therapist } from "@/entities/Therapist";
import { SessionType } from "@/entities/SessionType";
import { Booking } from "@/entities/Booking";
import { Specialization } from "@/entities/Specialization";
import { IsNull } from "typeorm";

export const dynamic = "force-dynamic";

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
    const specRepo = ds.getRepository(Specialization);

    // Only get non-deleted therapists
    const therapists = await therapistRepo.find({
        where: { deletedAt: IsNull() },
        order: { name: "ASC" },
    });

    return Promise.all(
        therapists.map(async (therapist) => {
            const sessionTypeCount = await sessionTypeRepo.count({
                where: { therapistId: therapist.id, isActive: true },
            });

            const totalBookings = await bookingRepo.count({
                where: { therapistId: therapist.id },
            });

            const upcomingBookings = await bookingRepo.count({
                where: { therapistId: therapist.id, status: "confirmed" },
            });

            // Get specialization names
            let specializations: Specialization[] = [];
            if (therapist.specializationIds?.length) {
                specializations = await specRepo.findBy(
                    therapist.specializationIds.map(id => ({ id }))
                );
            }

            return {
                ...therapist,
                sessionTypeCount,
                totalBookings,
                upcomingBookings,
                specializations,
            };
        })
    );
}

export default async function TherapistsPage() {
    const therapists = await getTherapists();

    return (
        <div className="space-y-4">
            {/* Header with actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">Therapists</h1>
                    <p className="text-gray-600 mt-1">
                        Manage therapist profiles and view their statistics
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/therapists/archived"
                        className="btn btn-outline flex items-center gap-2"
                    >
                        <Archive className="w-4 h-4" /> Archived
                    </Link>
                    <Link
                        href="/admin/therapists/new"
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Therapist
                    </Link>
                </div>
            </div>

            {/* Therapist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {therapists.length === 0 ? (
                    <div className="col-span-2 card p-8 text-center">
                        <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No therapists found</p>
                        <Link href="/admin/therapists/new" className="text-[var(--primary-teal)] hover:underline mt-2 inline-block">
                            Add your first therapist
                        </Link>
                    </div>
                ) : (
                    therapists.map((therapist) => (
                        <Link
                            key={therapist.id}
                            href={`/admin/therapists/${therapist.id}`}
                            className="card overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            <div className="p-4">
                                <div className="flex items-start gap-3">
                                    {therapist.photoUrl ? (
                                        <img
                                            src={therapist.photoUrl}
                                            alt={therapist.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                            <User className="w-5 h-5 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base font-semibold truncate">
                                                {therapist.name}
                                            </h3>
                                            <span className={`px-2 py-0.5 text-xs rounded-full shrink-0 ${
                                                therapist.isActive
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                            }`}>
                                                {therapist.isActive ? "Published" : "Draft"}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-sm truncate">
                                            {therapist.title}
                                        </p>
                                        <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                                            <Mail className="w-3 h-3" />
                                            {therapist.email}
                                        </p>
                                    </div>
                                </div>

                                {/* Specializations */}
                                {therapist.specializations.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-1">
                                        {therapist.specializations.slice(0, 3).map(spec => (
                                            <span key={spec.id} className="px-2 py-0.5 bg-[var(--primary-teal)]/10 text-[var(--primary-teal)] text-xs rounded-full">
                                                {spec.name}
                                            </span>
                                        ))}
                                        {therapist.specializations.length > 3 && (
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                                                +{therapist.specializations.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t">
                                    <div className="text-center">
                                        <p className="text-lg font-bold">{therapist.sessionTypeCount}</p>
                                        <p className="text-xs text-gray-500">Sessions</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold">{therapist.upcomingBookings}</p>
                                        <p className="text-xs text-gray-500">Upcoming</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold">{therapist.totalBookings}</p>
                                        <p className="text-xs text-gray-500">Total</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
