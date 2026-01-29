import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import WorkshopForm from "../WorkshopForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Create Workshop | Admin | Mindweal by Pihu Suri",
};

export default function NewWorkshopPage() {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <Link
                    href="/admin/workshops"
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="portal-title">Create New Workshop</h1>
                    <p className="text-gray-600 text-sm">
                        Add a new workshop or event
                    </p>
                </div>
            </div>

            <WorkshopForm />
        </div>
    );
}
