// frontend/src/app/admin/therapists/archived/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";
import { AppDataSource } from "@/lib/db";
import { Therapist } from "@/entities/Therapist";
import { Not, IsNull } from "typeorm";
import RestoreButton from "./RestoreButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Archived Therapists | Admin | Mindweal by Pihu Suri",
};

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

async function getArchivedTherapists() {
    const ds = await getDataSource();
    const repo = ds.getRepository(Therapist);
    return repo.find({
        where: { deletedAt: Not(IsNull()) },
        order: { deletedAt: "DESC" },
    });
}

export default async function ArchivedTherapistsPage() {
    const therapists = await getArchivedTherapists();

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Link
                    href="/admin/therapists"
                    className="p-1.5 hover:bg-gray-100 rounded-lg"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="portal-title">Archived Therapists</h1>
                    <p className="text-gray-600 text-sm">Restore or permanently manage archived therapists</p>
                </div>
            </div>

            {therapists.length === 0 ? (
                <div className="portal-card p-8 text-center">
                    <p className="text-gray-500 text-sm">No archived therapists</p>
                </div>
            ) : (
                <div className="portal-card divide-y">
                    {therapists.map((t) => (
                        <div key={t.id} className="p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {t.photoUrl ? (
                                    <img src={t.photoUrl} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                        <User className="w-5 h-5 text-gray-400" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium text-sm">{t.name}</p>
                                    <p className="text-xs text-gray-500">{t.title}</p>
                                    <p className="text-xs text-gray-400">
                                        Archived {t.deletedAt?.toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <RestoreButton therapistId={t.id} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
