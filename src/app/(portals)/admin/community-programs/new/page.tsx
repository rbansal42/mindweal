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
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/community-programs"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">New Community Program</h1>
                    <p className="text-gray-600">Create a new community program or workshop</p>
                </div>
            </div>

            <CommunityProgramForm />
        </div>
    );
}
