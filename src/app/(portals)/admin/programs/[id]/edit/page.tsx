import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppDataSource } from "@/lib/db";
import { Program } from "@/entities/Program";
import { ProgramForm } from "../../ProgramForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Edit Program | Admin | Mindweal by Pihu Suri",
    description: "Edit an existing program",
};

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

async function getProgram(id: string) {
    const ds = await getDataSource();
    const repo = ds.getRepository(Program);
    const program = await repo.findOne({ where: { id } });

    if (!program) {
        return null;
    }

    // Convert to plain object for Client Component serialization
    return {
        id: program.id,
        title: program.title,
        slug: program.slug,
        description: program.description,
        duration: program.duration,
        coverImage: program.coverImage,
        benefits: program.benefits,
        status: program.status,
        isActive: program.isActive,
        createdAt: program.createdAt.toISOString(),
        updatedAt: program.updatedAt.toISOString(),
    };
}

interface EditProgramPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditProgramPage({ params }: EditProgramPageProps) {
    const { id } = await params;
    const program = await getProgram(id);

    if (!program) {
        notFound();
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <Link
                    href="/admin/programs"
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="portal-title">Edit Program</h1>
                    <p className="text-gray-600 text-sm">Update program details</p>
                </div>
            </div>

            <div className="portal-card p-4">
                <ProgramForm
                    mode="edit"
                    initialData={{
                        id: program.id,
                        title: program.title,
                        description: program.description,
                        duration: program.duration,
                        coverImage: program.coverImage,
                        benefits: program.benefits,
                        status: program.status,
                        isActive: program.isActive,
                    }}
                />
            </div>
        </div>
    );
}
