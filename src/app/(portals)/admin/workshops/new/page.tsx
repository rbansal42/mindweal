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
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/workshops"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Create New Workshop</h1>
                    <p className="text-gray-600">
                        Add a new workshop or event
                    </p>
                </div>
            </div>

            <WorkshopForm />
        </div>
    );
}
