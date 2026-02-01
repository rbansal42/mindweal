"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, AlertCircle } from "lucide-react";

interface BookingActionsProps {
    bookingId: string;
    status: string;
}

export default function BookingActions({ bookingId, status }: BookingActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [action, setAction] = useState<string | null>(null);

    const updateStatus = async (newStatus: string) => {
        setLoading(true);
        setAction(newStatus);

        try {
            const response = await fetch(`/api/therapist/bookings/${bookingId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                router.refresh();
            } else {
                alert("Failed to update booking status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("An error occurred");
        } finally {
            setLoading(false);
            setAction(null);
        }
    };

    const handleCancel = async () => {
        const reason = prompt("Please provide a reason for cancellation:");
        if (!reason) return;

        setLoading(true);
        setAction("cancelled");

        try {
            const response = await fetch(`/api/bookings/${bookingId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason }),
            });

            if (response.ok) {
                router.refresh();
            } else {
                alert("Failed to cancel booking");
            }
        } catch (error) {
            console.error("Error cancelling:", error);
            alert("An error occurred");
        } finally {
            setLoading(false);
            setAction(null);
        }
    };

    if (status === "cancelled") {
        return (
            <p className="text-gray-500 text-center">
                This booking has been cancelled.
            </p>
        );
    }

    return (
        <div className="flex flex-wrap gap-3">
            {status === "confirmed" && (
                <>
                    <button
                        onClick={() => updateStatus("completed")}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                        {loading && action === "completed" ? (
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        ) : (
                            <Check className="w-4 h-4" />
                        )}
                        Mark Completed
                    </button>
                    <button
                        onClick={() => updateStatus("no_show")}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                        {loading && action === "no_show" ? (
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        ) : (
                            <AlertCircle className="w-4 h-4" />
                        )}
                        No Show
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                        {loading && action === "cancelled" ? (
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        ) : (
                            <X className="w-4 h-4" />
                        )}
                        Cancel Booking
                    </button>
                </>
            )}

            {status === "completed" && (
                <p className="text-blue-600 flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    This session has been marked as completed.
                </p>
            )}

            {status === "no_show" && (
                <p className="text-gray-600 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Client did not attend this session.
                </p>
            )}
        </div>
    );
}
