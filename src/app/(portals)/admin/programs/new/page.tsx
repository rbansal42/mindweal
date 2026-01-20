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
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/programs"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">New Program</h1>
                    <p className="text-gray-600">Create a new therapy or wellness program</p>
                </div>
            </div>

            <div className="card p-6">
                <ProgramForm mode="create" />
            </div>
        </div>
    );
}
