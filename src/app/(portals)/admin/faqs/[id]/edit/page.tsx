import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { FAQForm } from "../../FAQForm";
import { AppDataSource } from "@/lib/db";
import { FAQ } from "@/entities/FAQ";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Edit FAQ | Admin | MindWeal by Pihu Suri",
    description: "Edit frequently asked question",
};

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getFAQ(id: string) {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    const repo = AppDataSource.getRepository(FAQ);
    return repo.findOne({ where: { id } });
}

export default async function EditFAQPage({ params }: PageProps) {
    const { id } = await params;
    const faq = await getFAQ(id);

    if (!faq) {
        notFound();
    }

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
                    <h1 className="portal-title">Edit FAQ</h1>
                    <p className="text-gray-600 text-sm truncate max-w-md">{faq.question}</p>
                </div>
            </div>

            <div className="portal-card p-4">
                <FAQForm
                    mode="edit"
                    initialData={{
                        id: faq.id,
                        question: faq.question,
                        answer: faq.answer,
                        category: faq.category,
                        displayOrder: faq.displayOrder,
                        isActive: faq.isActive,
                    }}
                />
            </div>
        </div>
    );
}
