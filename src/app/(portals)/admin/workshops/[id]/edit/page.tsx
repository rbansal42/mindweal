"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import WorkshopForm from "../../WorkshopForm";

interface Workshop {
    id: string;
    title: string;
    slug: string;
    description: string;
    date: string;
    duration: string;
    capacity: number;
    coverImage: string | null;
    status: "draft" | "published";
    isActive: boolean;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditWorkshopPage({ params }: PageProps) {
    const { id } = use(params);
    const [workshop, setWorkshop] = useState<Workshop | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWorkshop = async () => {
            try {
                const res = await fetch(`/api/admin/workshops/${id}`);
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "Failed to fetch workshop");
                }
                setWorkshop(data.workshop);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        fetchWorkshop();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--primary-teal)]" />
            </div>
        );
    }

    if (error || !workshop) {
        return (
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/workshops"
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <h1 className="portal-title">Edit Workshop</h1>
                </div>
                <div className="portal-card p-6 text-center">
                    <p className="text-red-500 text-sm">{error || "Workshop not found"}</p>
                    <Link
                        href="/admin/workshops"
                        className="text-[var(--primary-teal)] hover:underline mt-3 inline-block text-sm"
                    >
                        Back to Workshops
                    </Link>
                </div>
            </div>
        );
    }

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
                    <h1 className="portal-title">Edit Workshop</h1>
                    <p className="text-gray-600 text-sm">{workshop.title}</p>
                </div>
            </div>

            <WorkshopForm workshop={workshop} />
        </div>
    );
}
