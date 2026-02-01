import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CommunityProgramForm from "../CommunityProgramForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "New Community Program | Admin | Mindweal by Pihu Suri",
    description: "Create a new community program",
};

export default function NewCommunityProgramPage() {
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
                    <h1 className="portal-title">New Community Program</h1>
                    <p className="text-gray-600 text-sm">Create a new community program or workshop</p>
                </div>
            </div>

            <CommunityProgramForm />
        </div>
    );
}
