// frontend/src/app/admin/settings/specializations/page.tsx
import { Metadata } from "next";
import { AppDataSource } from "@/lib/db";
import { Specialization } from "@/entities/Specialization";
import SpecializationsManager from "./SpecializationsManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Manage Specializations | Admin | Mindweal by Pihu Suri",
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

export default async function SpecializationsPage() {
    const specializations = await getSpecializations();

    return (
        <div className="space-y-3">
            <div>
                <h1 className="portal-title">Manage Specializations</h1>
                <p className="text-gray-600 text-sm">
                    Add, edit, or remove specializations that can be assigned to therapists.
                </p>
            </div>

            <SpecializationsManager initialSpecializations={specializations} />
        </div>
    );
}
