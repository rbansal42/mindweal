import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { TeamMemberForm } from "../../TeamMemberForm";
import { AppDataSource } from "@/lib/db";
import { TeamMember } from "@/entities/TeamMember";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Edit Team Member | Admin | MindWeal by Pihu Suri",
    description: "Edit team member details",
};

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getTeamMember(id: string) {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    const repo = AppDataSource.getRepository(TeamMember);
    return repo.findOne({ where: { id } });
}

export default async function EditTeamMemberPage({ params }: PageProps) {
    const { id } = await params;
    const teamMember = await getTeamMember(id);

    if (!teamMember) {
        notFound();
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <Link
                    href="/admin/team-members"
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="portal-title">Edit Team Member</h1>
                    <p className="text-gray-600 text-sm">{teamMember.name}</p>
                </div>
            </div>

            <div className="portal-card p-4">
                <TeamMemberForm
                    mode="edit"
                    initialData={{
                        id: teamMember.id,
                        name: teamMember.name,
                        role: teamMember.role,
                        qualifications: teamMember.qualifications,
                        bio: teamMember.bio,
                        photoUrl: teamMember.photoUrl,
                        email: teamMember.email,
                        phone: teamMember.phone,
                        location: teamMember.location,
                        educationalQualifications: teamMember.educationalQualifications,
                        professionalExperience: teamMember.professionalExperience,
                        areasOfExpertise: teamMember.areasOfExpertise,
                        therapeuticApproach: teamMember.therapeuticApproach,
                        therapyModalities: teamMember.therapyModalities,
                        servicesOffered: teamMember.servicesOffered,
                        focusAreas: teamMember.focusAreas,
                        professionalValues: teamMember.professionalValues,
                        quote: teamMember.quote,
                        displayOrder: teamMember.displayOrder,
                        isActive: teamMember.isActive,
                    }}
                />
            </div>
        </div>
    );
}
