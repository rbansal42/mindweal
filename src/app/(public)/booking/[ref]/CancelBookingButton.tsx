"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface CancelBookingButtonProps {
    bookingReference: string;
}

export default function CancelBookingButton({ bookingReference }: CancelBookingButtonProps) {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCancel = async () => {
        if (!reason.trim()) {
            alert("Please provide a reason for cancellation");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`/api/bookings/${bookingReference}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason }),
            });

            const data = await response.json();

            if (data.success) {
                setShowModal(false);
                router.refresh();
            } else {
                alert(data.error || "Failed to cancel booking");
            }
        } catch (error) {
            console.error("Error cancelling booking:", error);
            alert("An error occurred while cancelling");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="w-full btn bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 flex items-center justify-center gap-2"
            >
                <X className="w-4 h-4" />
                Cancel Booking
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Cancel Booking
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to cancel this booking? This action cannot
                            be undone.
                        </p>

                        <div className="mb-4">
                            <label
                                htmlFor="reason"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Reason for cancellation <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                                placeholder="Please let us know why you're cancelling..."
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 btn btn-secondary"
                                disabled={loading}
                            >
                                Keep Booking
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={loading}
                                className="flex-1 btn bg-red-500 text-white hover:bg-red-600"
                            >
                                {loading ? "Cancelling..." : "Confirm Cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
