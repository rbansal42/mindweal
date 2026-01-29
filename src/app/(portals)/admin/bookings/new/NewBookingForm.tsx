"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { User, Check } from "lucide-react";

interface SessionType {
    id: string;
    name: string;
    duration: number;
    meetingType: "in_person" | "video" | "phone";
    price: number | null;
}

interface TherapistInfo {
    id: string;
    name: string;
    slug: string;
    sessionTypes: SessionType[];
}

interface NewBookingFormProps {
    therapists: TherapistInfo[];
}

const bookingSchema = z.object({
    therapistId: z.string().min(1, "Please select a therapist"),
    sessionTypeId: z.string().min(1, "Please select a session type"),
    date: z.string().min(1, "Please select a date"),
    time: z.string().min(1, "Please select a time"),
    clientName: z.string().min(2, "Name must be at least 2 characters"),
    clientEmail: z.string().email("Invalid email address"),
    clientPhone: z.string().optional(),
    clientNotes: z.string().optional(),
    internalNotes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function NewBookingForm({ therapists }: NewBookingFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedTherapist, setSelectedTherapist] = useState<TherapistInfo | null>(
        null
    );
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [slots, setSlots] = useState<any[]>([]);
    const [loadingDates, setLoadingDates] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [success, setSuccess] = useState(false);
    const [bookingRef, setBookingRef] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<BookingFormData>({
        resolver: zodResolver(bookingSchema),
    });

    const therapistId = watch("therapistId");
    const sessionTypeId = watch("sessionTypeId");
    const selectedDate = watch("date");

    // Get selected session type
    const selectedSessionType = selectedTherapist?.sessionTypes.find(
        (st) => st.id === sessionTypeId
    );

    // Fetch available dates when therapist and session type change
    useEffect(() => {
        if (therapistId) {
            const therapist = therapists.find((t) => t.id === therapistId);
            setSelectedTherapist(therapist || null);
            setValue("sessionTypeId", "");
            setValue("date", "");
            setValue("time", "");
            setAvailableDates([]);
            setSlots([]);
        }
    }, [therapistId, therapists, setValue]);

    useEffect(() => {
        if (selectedTherapist && sessionTypeId) {
            setLoadingDates(true);
            fetch(
                `/api/therapists/${selectedTherapist.slug}/availability?duration=${selectedSessionType?.duration || 60}`
            )
                .then((res) => res.json())
                .then((data) => {
                    setAvailableDates(data.dates || []);
                })
                .catch((err) => console.error("Error fetching dates:", err))
                .finally(() => setLoadingDates(false));
        }
    }, [selectedTherapist, sessionTypeId, selectedSessionType]);

    // Fetch slots when date changes
    useEffect(() => {
        if (selectedTherapist && sessionTypeId && selectedDate) {
            setLoadingSlots(true);
            fetch(
                `/api/therapists/${selectedTherapist.slug}/slots?date=${selectedDate}&duration=${selectedSessionType?.duration || 60}`
            )
                .then((res) => res.json())
                .then((data) => {
                    setSlots(data.slots?.filter((s: any) => s.available) || []);
                })
                .catch((err) => console.error("Error fetching slots:", err))
                .finally(() => setLoadingSlots(false));
        }
    }, [selectedTherapist, sessionTypeId, selectedDate, selectedSessionType]);

    const onSubmit = async (data: BookingFormData) => {
        if (!selectedSessionType) return;

        setLoading(true);

        try {
            // Find the selected slot
            const selectedSlot = slots.find(
                (s) => format(new Date(s.start), "HH:mm") === data.time
            );

            if (!selectedSlot) {
                alert("Please select a valid time slot");
                setLoading(false);
                return;
            }

            const response = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    therapistId: data.therapistId,
                    sessionTypeId: data.sessionTypeId,
                    startDatetime: selectedSlot.start,
                    endDatetime: selectedSlot.end,
                    clientName: data.clientName,
                    clientEmail: data.clientEmail,
                    clientPhone: data.clientPhone,
                    clientNotes: data.clientNotes,
                }),
            });

            const result = await response.json();

            if (result.success) {
                setSuccess(true);
                setBookingRef(result.booking.bookingReference);
            } else {
                alert(result.error || "Failed to create booking");
            }
        } catch (error) {
            console.error("Error creating booking:", error);
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (success && bookingRef) {
        return (
            <div className="text-center py-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6 text-green-500" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                    Booking Created!
                </h2>
                <p className="text-gray-600 text-sm mb-3">
                    Reference:{" "}
                    <span className="font-mono font-semibold text-primary">
                        {bookingRef}
                    </span>
                </p>
                <p className="text-gray-600 text-sm mb-4">
                    Confirmation emails have been sent to the client and therapist.
                </p>
                <div className="flex gap-3 justify-center">
                    <a
                        href={`/booking/${bookingRef}`}
                        className="portal-btn portal-btn-primary"
                    >
                        View Booking
                    </a>
                    <button
                        onClick={() => {
                            setSuccess(false);
                            setBookingRef(null);
                        }}
                        className="portal-btn portal-btn-secondary"
                    >
                        Create Another
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Therapist Selection */}
            <div>
                <label className="portal-label">
                    Therapist <span className="text-red-500">*</span>
                </label>
                <select
                    {...register("therapistId")}
                    className={`portal-select ${
                        errors.therapistId ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                >
                    <option value="">Select a therapist</option>
                    {therapists.map((therapist) => (
                        <option key={therapist.id} value={therapist.id}>
                            {therapist.name}
                        </option>
                    ))}
                </select>
                {errors.therapistId && (
                    <p className="mt-1 text-xs text-red-500">
                        {errors.therapistId.message}
                    </p>
                )}
            </div>

            {/* Session Type */}
            {selectedTherapist && (
                <div>
                    <label className="portal-label">
                        Session Type <span className="text-red-500">*</span>
                    </label>
                    {selectedTherapist.sessionTypes.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                            No session types configured for this therapist
                        </p>
                    ) : (
                        <select
                            {...register("sessionTypeId")}
                            className={`portal-select ${
                                errors.sessionTypeId ? "border-red-500 focus:ring-red-500" : ""
                            }`}
                        >
                            <option value="">Select session type</option>
                            {selectedTherapist.sessionTypes.map((st) => (
                                <option key={st.id} value={st.id}>
                                    {st.name} ({st.duration} mins)
                                    {st.price && ` - ₹${st.price}`}
                                </option>
                            ))}
                        </select>
                    )}
                    {errors.sessionTypeId && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.sessionTypeId.message}
                        </p>
                    )}
                </div>
            )}

            {/* Date Selection */}
            {sessionTypeId && (
                <div>
                    <label className="portal-label">
                        Date <span className="text-red-500">*</span>
                    </label>
                    {loadingDates ? (
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <div className="animate-spin w-3 h-3 border-2 border-primary border-t-transparent rounded-full"></div>
                            Loading available dates...
                        </div>
                    ) : availableDates.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                            No available dates found
                        </p>
                    ) : (
                        <select
                            {...register("date")}
                            className={`portal-select ${
                                errors.date ? "border-red-500 focus:ring-red-500" : ""
                            }`}
                        >
                            <option value="">Select a date</option>
                            {availableDates.map((date) => (
                                <option key={date} value={date}>
                                    {format(new Date(date), "EEEE, MMMM d, yyyy")}
                                </option>
                            ))}
                        </select>
                    )}
                    {errors.date && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.date.message}
                        </p>
                    )}
                </div>
            )}

            {/* Time Selection */}
            {selectedDate && (
                <div>
                    <label className="portal-label">
                        Time <span className="text-red-500">*</span>
                    </label>
                    {loadingSlots ? (
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <div className="animate-spin w-3 h-3 border-2 border-primary border-t-transparent rounded-full"></div>
                            Loading available times...
                        </div>
                    ) : slots.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                            No available times for this date
                        </p>
                    ) : (
                        <select
                            {...register("time")}
                            className={`portal-select ${
                                errors.time ? "border-red-500 focus:ring-red-500" : ""
                            }`}
                        >
                            <option value="">Select a time</option>
                            {slots.map((slot, index) => (
                                <option
                                    key={index}
                                    value={format(new Date(slot.start), "HH:mm")}
                                >
                                    {slot.startFormatted} - {slot.endFormatted}
                                </option>
                            ))}
                        </select>
                    )}
                    {errors.time && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.time.message}
                        </p>
                    )}
                </div>
            )}

            <hr className="border-gray-200" />

            {/* Client Details */}
            <div className="flex items-center gap-2 text-gray-700">
                <User className="w-4 h-4" />
                <h3 className="font-medium text-sm">Client Details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className="portal-label">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        {...register("clientName")}
                        className={`portal-input ${
                            errors.clientName ? "border-red-500 focus:ring-red-500" : ""
                        }`}
                    />
                    {errors.clientName && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.clientName.message}
                        </p>
                    )}
                </div>
                <div>
                    <label className="portal-label">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        {...register("clientEmail")}
                        className={`portal-input ${
                            errors.clientEmail ? "border-red-500 focus:ring-red-500" : ""
                        }`}
                    />
                    {errors.clientEmail && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.clientEmail.message}
                        </p>
                    )}
                </div>
            </div>

            <div>
                <label className="portal-label">Phone Number</label>
                <input
                    type="tel"
                    {...register("clientPhone")}
                    className="portal-input"
                    placeholder="+91 98765 43210"
                />
            </div>

            <div>
                <label className="portal-label">Client Notes</label>
                <textarea
                    {...register("clientNotes")}
                    rows={2}
                    className="portal-input resize-none"
                    placeholder="Notes visible to the client"
                />
            </div>

            <div>
                <label className="portal-label">Internal Notes</label>
                <textarea
                    {...register("internalNotes")}
                    rows={2}
                    className="portal-input resize-none"
                    placeholder="Internal notes (not visible to client)"
                />
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 portal-btn portal-btn-secondary"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 portal-btn portal-btn-primary"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            Creating...
                        </>
                    ) : (
                        "Create Booking"
                    )}
                </button>
            </div>
        </form>
    );
}
