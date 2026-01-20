// frontend/src/app/admin/therapists/archived/RestoreButton.tsx
"use client";

import { useState } from "react";
import { RotateCcw, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RestoreButton({ therapistId }: { therapistId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleRestore = async () => {
        if (!confirm("Restore this therapist?")) return;
        setIsLoading(true);

        try {
            const res = await fetch(`/api/admin/therapists/${therapistId}/restore`, {
                method: "POST",
            });
            if (res.ok) {
                router.refresh();
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleRestore}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[var(--primary-teal)] text-white rounded-lg hover:bg-[var(--primary-teal-dark)] disabled:opacity-50"
        >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            Restore
        </button>
    );
}
