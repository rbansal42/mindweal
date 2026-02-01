import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FAQForm } from "../FAQForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Add FAQ | Admin | MindWeal by Pihu Suri",
    description: "Add a new frequently asked question",
};

export default function NewFAQPage() {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <Link
                    href="/admin/faqs"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="portal-title">Add FAQ</h1>
                    <p className="text-gray-600 text-sm">Add a new frequently asked question</p>
                </div>
            </div>

            <div className="portal-card p-4">
                <FAQForm mode="create" />
            </div>
        </div>
    );
}
