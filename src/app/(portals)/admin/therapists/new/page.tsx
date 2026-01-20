import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppDataSource } from "@/lib/db";
import { Specialization } from "@/entities/Specialization";
import CreateTherapistForm from "./CreateTherapistForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Add Therapist | Admin | Mindweal by Pihu Suri",
};

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

async function getSpecializations() {
    const ds = await getDataSource();
    const repo = ds.getRepository(Specialization);
    const specializations = await repo.find({ where: { isActive: true }, order: { name: "ASC" } });
    // Convert TypeORM entities to plain objects for Client Component serialization
    return specializations.map(s => ({
        id: s.id,
        name: s.name,
        isActive: s.isActive,
    }));
}

export default async function NewTherapistPage() {
    const specializations = await getSpecializations();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/therapists"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Add New Therapist</h1>
                    <p className="text-gray-600">Create a new therapist profile and account</p>
                </div>
            </div>

            <CreateTherapistForm specializations={specializations} />
        </div>
    );
}
