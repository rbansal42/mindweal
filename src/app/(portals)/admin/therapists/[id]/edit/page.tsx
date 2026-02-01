// frontend/src/app/admin/therapists/[id]/edit/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppDataSource } from "@/lib/db";
import { Therapist } from "@/entities/Therapist";
import { Specialization } from "@/entities/Specialization";
import { IsNull } from "typeorm";
import EditTherapistForm from "./EditTherapistForm";

export const dynamic = "force-dynamic";

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

async function getTherapist(id: string) {
    const ds = await getDataSource();
    const therapist = await ds.getRepository(Therapist).findOne({ where: { id, deletedAt: IsNull() } });
    if (!therapist) return null;
    // Convert TypeORM entity to plain object for Client Component serialization
    return {
        id: therapist.id,
        userId: therapist.userId,
        slug: therapist.slug,
        name: therapist.name,
        title: therapist.title,
        bio: therapist.bio,
        email: therapist.email,
        phone: therapist.phone,
        photoUrl: therapist.photoUrl,
        defaultSessionDuration: therapist.defaultSessionDuration,
        bufferTime: therapist.bufferTime,
        advanceBookingDays: therapist.advanceBookingDays,
        minBookingNotice: therapist.minBookingNotice,
        isActive: therapist.isActive,
        specializationIds: therapist.specializationIds,
    };
}

async function getSpecializations() {
    const ds = await getDataSource();
    const specializations = await ds.getRepository(Specialization).find({ where: { isActive: true }, order: { name: "ASC" } });
    // Convert TypeORM entities to plain objects for Client Component serialization
    return specializations.map(s => ({
        id: s.id,
        name: s.name,
        isActive: s.isActive,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const therapist = await getTherapist(id);
    return { title: therapist ? `Edit ${therapist.name} | Admin | Mindweal by Pihu Suri` : "Therapist Not Found" };
}

export default async function EditTherapistPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [therapist, specializations] = await Promise.all([
        getTherapist(id),
        getSpecializations()
    ]);

    if (!therapist) notFound();

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Link href={`/admin/therapists/${id}`} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="portal-title">Edit Therapist</h1>
                    <p className="text-gray-600 text-sm">{therapist.name}</p>
                </div>
            </div>

            <EditTherapistForm therapist={therapist} specializations={specializations} />
        </div>
    );
}
