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
        <div className="space-y-3">
            {/* Header with actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="portal-title">Therapists</h1>
                    <p className="text-gray-600 text-sm">
                        Manage therapist profiles and view their statistics
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/admin/therapists/archived"
                        className="portal-btn portal-btn-outline flex items-center gap-1.5"
                    >
                        <Archive className="w-3.5 h-3.5" /> Archived
                    </Link>
                    <Link
                        href="/admin/therapists/new"
                        className="portal-btn portal-btn-primary flex items-center gap-1.5"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add Therapist
                    </Link>
                </div>
            </div>

            {/* Therapist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {therapists.length === 0 ? (
                    <div className="col-span-2 portal-card p-6 text-center">
                        <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No therapists found</p>
                        <Link href="/admin/therapists/new" className="text-[var(--primary-teal)] hover:underline mt-1 inline-block text-sm">
                            Add your first therapist
                        </Link>
                    </div>
                ) : (
                    therapists.map((therapist) => (
                        <Link
                            key={therapist.id}
                            href={`/admin/therapists/${therapist.id}`}
                            className="portal-card overflow-hidden hover:shadow-md transition-shadow"
                        >
                            <div className="p-3">
                                <div className="flex items-start gap-2.5">
                                    {therapist.photoUrl ? (
                                        <img
                                            src={therapist.photoUrl}
                                            alt={therapist.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                            <User className="w-4 h-4 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <h3 className="text-sm font-semibold truncate">
                                                {therapist.name}
                                            </h3>
                                            <span className={`portal-badge shrink-0 ${
                                                therapist.isActive
                                                    ? "portal-badge-success"
                                                    : "portal-badge-warning"
                                            }`}>
                                                {therapist.isActive ? "Published" : "Draft"}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-xs truncate">
                                            {therapist.title}
                                        </p>
                                        <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                                            <Mail className="w-3 h-3" />
                                            {therapist.email}
                                        </p>
                                    </div>
                                </div>

                                {/* Specializations */}
                                {therapist.specializations.length > 0 && (
                                    <div className="mt-2.5 flex flex-wrap gap-1">
                                        {therapist.specializations.slice(0, 3).map(spec => (
                                            <span key={spec.id} className="px-1.5 py-0.5 bg-[var(--primary-teal)]/10 text-[var(--primary-teal)] text-xs rounded">
                                                {spec.name}
                                            </span>
                                        ))}
                                        {therapist.specializations.length > 3 && (
                                            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                                                +{therapist.specializations.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2.5 border-t">
                                    <div className="text-center">
                                        <p className="text-base font-bold">{therapist.sessionTypeCount}</p>
                                        <p className="text-xs text-gray-500">Sessions</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-base font-bold">{therapist.upcomingBookings}</p>
                                        <p className="text-xs text-gray-500">Upcoming</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-base font-bold">{therapist.totalBookings}</p>
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
