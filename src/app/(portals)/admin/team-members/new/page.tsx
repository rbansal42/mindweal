import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TeamMemberForm } from "../TeamMemberForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Add Team Member | Admin | MindWeal by Pihu Suri",
    description: "Add a new team member",
};

export default function NewTeamMemberPage() {
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
                    <h1 className="portal-title">Add Team Member</h1>
                    <p className="text-gray-600 text-sm">Add a new member to your team</p>
                </div>
            </div>

            <div className="portal-card p-4">
                <TeamMemberForm mode="create" />
            </div>
        </div>
    );
}
