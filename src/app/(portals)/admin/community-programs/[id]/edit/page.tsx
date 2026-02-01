import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { AppDataSource } from "@/lib/db";
import { CommunityProgram } from "@/entities/CommunityProgram";
import CommunityProgramForm from "../../CommunityProgramForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Edit Community Program | Admin | Mindweal by Pihu Suri",
    description: "Edit community program",
};

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getCommunityProgram(id: string) {
    const ds = await getDataSource();
    const repo = ds.getRepository(CommunityProgram);
    const program = await repo.findOne({ where: { id } });

    if (!program) {
        return null;
    }

    // Convert to plain object for serialization
    return {
        id: program.id,
        name: program.name,
        slug: program.slug,
        description: program.description,
        schedule: program.schedule,
        coverImage: program.coverImage,
        status: program.status,
        isActive: program.isActive,
        createdAt: program.createdAt.toISOString(),
        updatedAt: program.updatedAt.toISOString(),
    };
}

export default async function EditCommunityProgramPage({ params }: PageProps) {
    const { id } = await params;
    const program = await getCommunityProgram(id);

    if (!program) {
        notFound();
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <Link
                    href="/admin/community-programs"
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="portal-title">Edit Community Program</h1>
                    <p className="text-gray-600 text-sm">Update {program.name}</p>
                </div>
            </div>

            <CommunityProgramForm
                initialData={{
                    id: program.id,
                    name: program.name,
                    description: program.description,
                    schedule: program.schedule,
                    coverImage: program.coverImage,
                    status: program.status,
                    isActive: program.isActive,
                }}
            />
        </div>
    );
}
