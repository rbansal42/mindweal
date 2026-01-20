"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar, Clock, User, Check } from "lucide-react";

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
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Booking Created!
                </h2>
                <p className="text-gray-600 mb-4">
                    Reference:{" "}
                    <span className="font-mono font-semibold text-primary">
                        {bookingRef}
                    </span>
                </p>
                <p className="text-gray-600 mb-6">
                    Confirmation emails have been sent to the client and therapist.
                </p>
                <div className="flex gap-4 justify-center">
                    <a
                        href={`/booking/${bookingRef}`}
                        className="btn btn-primary"
                    >
                        View Booking
                    </a>
                    <button
                        onClick={() => {
                            setSuccess(false);
                            setBookingRef(null);
                        }}
                        className="btn btn-secondary"
                    >
                        Create Another
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Therapist Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Therapist <span className="text-red-500">*</span>
                </label>
                <select
                    {...register("therapistId")}
                    className={`w-full px-4 py-3 rounded-lg border ${
                        errors.therapistId
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-primary"
                    } focus:ring-2 focus:border-transparent outline-none`}
                >
                    <option value="">Select a therapist</option>
                    {therapists.map((therapist) => (
                        <option key={therapist.id} value={therapist.id}>
                            {therapist.name}
                        </option>
                    ))}
                </select>
                {errors.therapistId && (
                    <p className="mt-1 text-sm text-red-500">
                        {errors.therapistId.message}
                    </p>
                )}
            </div>

            {/* Session Type */}
            {selectedTherapist && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Type <span className="text-red-500">*</span>
                    </label>
                    {selectedTherapist.sessionTypes.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                            No session types configured for this therapist
                        </p>
                    ) : (
                        <select
                            {...register("sessionTypeId")}
                            className={`w-full px-4 py-3 rounded-lg border ${
                                errors.sessionTypeId
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-primary"
                            } focus:ring-2 focus:border-transparent outline-none`}
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
                        <p className="mt-1 text-sm text-red-500">
                            {errors.sessionTypeId.message}
                        </p>
                    )}
                </div>
            )}

            {/* Date Selection */}
            {sessionTypeId && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date <span className="text-red-500">*</span>
                    </label>
                    {loadingDates ? (
                        <div className="flex items-center gap-2 text-gray-500">
                            <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                            Loading available dates...
                        </div>
                    ) : availableDates.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                            No available dates found
                        </p>
                    ) : (
                        <select
                            {...register("date")}
                            className={`w-full px-4 py-3 rounded-lg border ${
                                errors.date
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-primary"
                            } focus:ring-2 focus:border-transparent outline-none`}
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
                        <p className="mt-1 text-sm text-red-500">
                            {errors.date.message}
                        </p>
                    )}
                </div>
            )}

            {/* Time Selection */}
            {selectedDate && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time <span className="text-red-500">*</span>
                    </label>
                    {loadingSlots ? (
                        <div className="flex items-center gap-2 text-gray-500">
                            <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                            Loading available times...
                        </div>
                    ) : slots.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                            No available times for this date
                        </p>
                    ) : (
                        <select
                            {...register("time")}
                            className={`w-full px-4 py-3 rounded-lg border ${
                                errors.time
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-primary"
                            } focus:ring-2 focus:border-transparent outline-none`}
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
                        <p className="mt-1 text-sm text-red-500">
                            {errors.time.message}
                        </p>
                    )}
                </div>
            )}

            <hr className="border-gray-200" />

            {/* Client Details */}
            <div className="flex items-center gap-2 text-gray-700">
                <User className="w-5 h-5" />
                <h3 className="font-medium">Client Details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        {...register("clientName")}
                        className={`w-full px-4 py-3 rounded-lg border ${
                            errors.clientName
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:ring-primary"
                        } focus:ring-2 focus:border-transparent outline-none`}
                    />
                    {errors.clientName && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.clientName.message}
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        {...register("clientEmail")}
                        className={`w-full px-4 py-3 rounded-lg border ${
                            errors.clientEmail
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:ring-primary"
                        } focus:ring-2 focus:border-transparent outline-none`}
                    />
                    {errors.clientEmail && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.clientEmail.message}
                        </p>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                </label>
                <input
                    type="tel"
                    {...register("clientPhone")}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="+91 98765 43210"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Notes
                </label>
                <textarea
                    {...register("clientNotes")}
                    rows={2}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                    placeholder="Notes visible to the client"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Internal Notes
                </label>
                <textarea
                    {...register("internalNotes")}
                    rows={2}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                    placeholder="Internal notes (not visible to client)"
                />
            </div>

            <div className="flex gap-4 pt-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 btn btn-secondary"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn btn-primary"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
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
