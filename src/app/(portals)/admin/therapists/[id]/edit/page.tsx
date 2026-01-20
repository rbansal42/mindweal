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
    return ds.getRepository(Therapist).findOne({ where: { id, deletedAt: IsNull() } });
}

async function getSpecializations() {
    const ds = await getDataSource();
    return ds.getRepository(Specialization).find({ where: { isActive: true }, order: { name: "ASC" } });
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
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/admin/therapists/${id}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Edit Therapist</h1>
                    <p className="text-gray-600">{therapist.name}</p>
                </div>
            </div>

            <EditTherapistForm therapist={therapist} specializations={specializations} />
        </div>
    );
}
