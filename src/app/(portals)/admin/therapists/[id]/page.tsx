// frontend/src/app/admin/therapists/[id]/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, Calendar, Edit, User } from "lucide-react";
import { AppDataSource } from "@/lib/db";
import { Therapist } from "@/entities/Therapist";
import { SessionType } from "@/entities/SessionType";
import { TherapistAvailability } from "@/entities/TherapistAvailability";
import { Booking } from "@/entities/Booking";
import { Specialization } from "@/entities/Specialization";
import { IsNull, MoreThanOrEqual } from "typeorm";
import TherapistActions from "./TherapistActions";

export const dynamic = "force-dynamic";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

async function getTherapistDetails(id: string) {
    const ds = await getDataSource();
    const therapistRepo = ds.getRepository(Therapist);
    const sessionTypeRepo = ds.getRepository(SessionType);
    const availabilityRepo = ds.getRepository(TherapistAvailability);
    const bookingRepo = ds.getRepository(Booking);
    const specRepo = ds.getRepository(Specialization);

    const therapist = await therapistRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!therapist) return null;

    const sessionTypes = await sessionTypeRepo.find({
        where: { therapistId: id },
        order: { name: "ASC" }
    });

    const availability = await availabilityRepo.find({
        where: { therapistId: id, isActive: true },
        order: { dayOfWeek: "ASC", startTime: "ASC" }
    });

    const upcomingBookings = await bookingRepo.find({
        where: {
            therapistId: id,
            status: "confirmed",
            startDatetime: MoreThanOrEqual(new Date())
        },
        order: { startDatetime: "ASC" },
        take: 5
    });

    const totalBookings = await bookingRepo.count({ where: { therapistId: id } });
    const completedBookings = await bookingRepo.count({ where: { therapistId: id, status: "completed" } });

    let specializations: Specialization[] = [];
    if (therapist.specializationIds?.length) {
        specializations = await specRepo.findByIds(therapist.specializationIds);
    }

    return {
        therapist,
        sessionTypes,
        availability,
        upcomingBookings,
        specializations,
        stats: { totalBookings, completedBookings, upcomingCount: upcomingBookings.length }
    };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const data = await getTherapistDetails(id);
    return { title: data ? `${data.therapist.name} | Admin | Mindweal by Pihu Suri` : "Therapist Not Found" };
}

export default async function TherapistDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getTherapistDetails(id);

    if (!data) notFound();

    const { therapist, sessionTypes, availability, upcomingBookings, specializations, stats } = data;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/admin/therapists" className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="flex items-center gap-3">
                        {therapist.photoUrl ? (
                            <img src={therapist.photoUrl} alt={therapist.name} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="w-6 h-6 text-gray-400" />
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="portal-title">{therapist.name}</h1>
                                <span className={`portal-badge ${therapist.isActive ? "portal-badge-success" : "portal-badge-warning"}`}>
                                    {therapist.isActive ? "Published" : "Draft"}
                                </span>
                            </div>
                            <p className="text-gray-600 text-sm">{therapist.title}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/admin/therapists/${id}/edit`} className="portal-btn portal-btn-outline flex items-center gap-1.5">
                        <Edit className="w-3.5 h-3.5" /> Edit
                    </Link>
                    <TherapistActions therapistId={id} isActive={therapist.isActive} />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Total Bookings", value: stats.totalBookings },
                    { label: "Completed", value: stats.completedBookings },
                    { label: "Upcoming", value: stats.upcomingCount },
                ].map(stat => (
                    <div key={stat.label} className="portal-card p-3 text-center">
                        <p className="text-xl font-bold text-[var(--primary-teal)]">{stat.value}</p>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
                {/* Left: Profile */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Contact */}
                    <div className="portal-card p-4">
                        <h2 className="font-semibold text-sm mb-3">Contact Information</h2>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-3.5 h-3.5 text-gray-400" />
                                <span>{therapist.email}</span>
                            </div>
                            {therapist.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                                    <span>{therapist.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Specializations */}
                    {specializations.length > 0 && (
                        <div className="portal-card p-4">
                            <h2 className="font-semibold text-sm mb-3">Specializations</h2>
                            <div className="flex flex-wrap gap-1.5">
                                {specializations.map(spec => (
                                    <span key={spec.id} className="px-2 py-0.5 bg-[var(--primary-teal)]/10 text-[var(--primary-teal)] text-xs rounded">
                                        {spec.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bio */}
                    <div className="portal-card p-4">
                        <h2 className="font-semibold text-sm mb-3">Bio</h2>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap">{therapist.bio}</p>
                    </div>

                    {/* Session Types */}
                    <div className="portal-card p-4">
                        <h2 className="font-semibold text-sm mb-3">Session Types</h2>
                        {sessionTypes.length === 0 ? (
                            <p className="text-gray-500 text-sm">No session types configured</p>
                        ) : (
                            <div className="space-y-2">
                                {sessionTypes.map(st => (
                                    <div key={st.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-sm">{st.name}</p>
                                            <p className="text-xs text-gray-500">{st.duration} min - {st.meetingType.replace("_", " ")}</p>
                                        </div>
                                        {st.price && <span className="text-[var(--primary-teal)] font-medium text-sm">Rs {st.price}</span>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-4">
                    {/* Availability */}
                    <div className="portal-card p-4">
                        <h2 className="font-semibold text-sm mb-3">Weekly Availability</h2>
                        {availability.length === 0 ? (
                            <p className="text-gray-500 text-xs">No availability set</p>
                        ) : (
                            <div className="space-y-1.5 text-xs">
                                {availability.map((av, i) => (
                                    <div key={i} className="flex justify-between">
                                        <span className="text-gray-500">{DAYS[av.dayOfWeek]}</span>
                                        <span>{av.startTime} - {av.endTime}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Booking Settings */}
                    <div className="portal-card p-4">
                        <h2 className="font-semibold text-sm mb-3">Booking Settings</h2>
                        <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Default Duration</span>
                                <span>{therapist.defaultSessionDuration} min</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Buffer Time</span>
                                <span>{therapist.bufferTime} min</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Advance Booking</span>
                                <span>{therapist.advanceBookingDays} days</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Min Notice</span>
                                <span>{therapist.minBookingNotice} hours</span>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Bookings */}
                    <div className="portal-card p-4">
                        <h2 className="font-semibold text-sm mb-3">Upcoming Bookings</h2>
                        {upcomingBookings.length === 0 ? (
                            <p className="text-gray-500 text-xs">No upcoming bookings</p>
                        ) : (
                            <div className="space-y-2">
                                {upcomingBookings.map(b => (
                                    <div key={b.id} className="flex items-center gap-2 text-xs">
                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                        <div>
                                            <p className="font-medium">{b.clientName}</p>
                                            <p className="text-gray-500">{new Date(b.startDatetime).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
