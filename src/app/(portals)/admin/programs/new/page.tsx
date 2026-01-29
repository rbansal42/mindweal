import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProgramForm } from "../ProgramForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "New Program | Admin | Mindweal by Pihu Suri",
    description: "Create a new therapy or wellness program",
};

export default function NewProgramPage() {
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
                    <h1 className="portal-title">New Program</h1>
                    <p className="text-gray-600 text-sm">Create a new therapy or wellness program</p>
                </div>
            </div>

            <div className="portal-card p-4">
                <ProgramForm mode="create" />
            </div>
        </div>
    );
}
