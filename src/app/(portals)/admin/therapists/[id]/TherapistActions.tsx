// frontend/src/app/admin/therapists/[id]/TherapistActions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Eye, EyeOff, Trash2, Loader2 } from "lucide-react";

interface Props {
    therapistId: string;
    isActive: boolean;
}

export default function TherapistActions({ therapistId, isActive }: Props) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handlePublish = async () => {
        setIsLoading(true);
        try {
            await fetch(`/api/admin/therapists/${therapistId}/publish`, { method: "POST" });
            router.refresh();
        } finally {
            setIsLoading(false);
            setIsOpen(false);
        }
    };

    const handleUnpublish = async () => {
        setIsLoading(true);
        try {
            await fetch(`/api/admin/therapists/${therapistId}/unpublish`, { method: "POST" });
            router.refresh();
        } finally {
            setIsLoading(false);
            setIsOpen(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this therapist? They will be moved to archived.")) return;
        setIsLoading(true);
        try {
            await fetch(`/api/admin/therapists/${therapistId}`, { method: "DELETE" });
            router.push("/admin/therapists");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border z-20">
                        {isActive ? (
                            <button
                                onClick={handleUnpublish}
                                className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 flex items-center gap-2"
                            >
                                <EyeOff className="w-3.5 h-3.5" /> Unpublish
                            </button>
                        ) : (
                            <button
                                onClick={handlePublish}
                                className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 flex items-center gap-2"
                            >
                                <Eye className="w-3.5 h-3.5" /> Publish
                            </button>
                        )}
                        <button
                            onClick={handleDelete}
                            className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
