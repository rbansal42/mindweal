"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import {
    SessionTypeSelector,
    DatePicker,
    TimeSlotPicker,
    BookingForm,
    BookingSummary,
} from "@/components/booking";

interface SessionType {
    id: string;
    name: string;
    duration: number;
    meetingType: "in_person" | "video" | "phone";
    price: number | null;
    description: string | null;
    color: string;
}

interface TimeSlot {
    start: Date;
    end: Date;
    startFormatted: string;
    endFormatted: string;
    available: boolean;
}

interface TherapistData {
    id: string;
    name: string;
    slug: string;
    title: string;
    bio: string;
    photoUrl: string | null;
    defaultSessionDuration: number;
}

interface BookingClientProps {
    therapist: TherapistData;
    sessionTypes: SessionType[];
}

type BookingStep = "session" | "date" | "time" | "details" | "confirmation";

const steps: { key: BookingStep; label: string }[] = [
    { key: "session", label: "Session" },
    { key: "date", label: "Date" },
    { key: "time", label: "Time" },
    { key: "details", label: "Details" },
    { key: "confirmation", label: "Confirmation" },
];

export default function BookingClient({
    therapist,
    sessionTypes,
}: BookingClientProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<BookingStep>("session");
    const [selectedSessionType, setSelectedSessionType] = useState<SessionType | null>(
        null
    );
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [loadingDates, setLoadingDates] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [bookingResult, setBookingResult] = useState<{
        bookingReference: string;
        meetingLink?: string | null;
    } | null>(null);

    // Fetch available dates when session type changes
    useEffect(() => {
        if (selectedSessionType) {
            setLoadingDates(true);
            setAvailableDates([]);
            setSelectedDate(null);
            setSelectedSlot(null);

            fetch(
                `/api/therapists/${therapist.slug}/availability?duration=${selectedSessionType.duration}`
            )
                .then((res) => res.json())
                .then((data) => {
                    setAvailableDates(data.dates || []);
                })
                .catch((err) => console.error("Error fetching dates:", err))
                .finally(() => setLoadingDates(false));
        }
    }, [selectedSessionType, therapist.slug]);

    // Fetch slots when date changes
    useEffect(() => {
        if (selectedSessionType && selectedDate) {
            setLoadingSlots(true);
            setSlots([]);
            setSelectedSlot(null);

            fetch(
                `/api/therapists/${therapist.slug}/slots?date=${selectedDate}&duration=${selectedSessionType.duration}`
            )
                .then((res) => res.json())
                .then((data) => {
                    setSlots(data.slots || []);
                })
                .catch((err) => console.error("Error fetching slots:", err))
                .finally(() => setLoadingSlots(false));
        }
    }, [selectedDate, selectedSessionType, therapist.slug]);

    const handleSessionTypeSelect = (sessionType: SessionType) => {
        setSelectedSessionType(sessionType);
        setCurrentStep("date");
    };

    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
        setCurrentStep("time");
    };

    const handleSlotSelect = (slot: TimeSlot) => {
        setSelectedSlot(slot);
        setCurrentStep("details");
    };

    const handleFormSubmit = async (formData: {
        clientName: string;
        clientEmail: string;
        clientPhone?: string;
        clientNotes?: string;
    }) => {
        if (!selectedSessionType || !selectedSlot) return;

        setSubmitting(true);

        try {
            const response = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    therapistId: therapist.id,
                    sessionTypeId: selectedSessionType.id,
                    startDatetime: new Date(selectedSlot.start).toISOString(),
                    endDatetime: new Date(selectedSlot.end).toISOString(),
                    clientName: formData.clientName,
                    clientEmail: formData.clientEmail,
                    clientPhone: formData.clientPhone,
                    clientNotes: formData.clientNotes,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setBookingResult({
                    bookingReference: data.booking.bookingReference,
                    meetingLink: data.booking.meetingLink,
                });
                setCurrentStep("confirmation");
            } else {
                alert(data.error || "Failed to create booking");
            }
        } catch (error) {
            console.error("Error creating booking:", error);
            alert("An error occurred while booking");
        } finally {
            setSubmitting(false);
        }
    };

    const getCurrentStepIndex = () =>
        steps.findIndex((s) => s.key === currentStep);

    const canGoBack = () =>
        currentStep !== "session" && currentStep !== "confirmation";

    const goBack = () => {
        const currentIndex = getCurrentStepIndex();
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1].key);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-[#f0fdf9] to-[#ecfdf5]">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Book a Session with {therapist.name}
                    </h1>
                    <p className="text-gray-600 mt-1">{therapist.title}</p>
                </div>

                {/* Progress Steps */}
                {currentStep !== "confirmation" && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between max-w-2xl">
                            {steps.slice(0, -1).map((step, index) => {
                                const isActive = step.key === currentStep;
                                const isComplete =
                                    getCurrentStepIndex() > index;

                                return (
                                    <div
                                        key={step.key}
                                        className="flex items-center"
                                    >
                                        <div
                                            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                                                isComplete
                                                    ? "bg-primary text-white"
                                                    : isActive
                                                    ? "bg-primary text-white"
                                                    : "bg-gray-200 text-gray-500"
                                            }`}
                                        >
                                            {isComplete ? (
                                                <Check className="w-4 h-4" />
                                            ) : (
                                                index + 1
                                            )}
                                        </div>
                                        <span
                                            className={`ml-2 text-sm hidden sm:block ${
                                                isActive
                                                    ? "text-primary font-medium"
                                                    : "text-gray-500"
                                            }`}
                                        >
                                            {step.label}
                                        </span>
                                        {index < steps.length - 2 && (
                                            <div
                                                className={`w-12 sm:w-24 h-0.5 mx-2 ${
                                                    isComplete
                                                        ? "bg-primary"
                                                        : "bg-gray-200"
                                                }`}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            {/* Back Button */}
                            {canGoBack() && (
                                <button
                                    onClick={goBack}
                                    className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back
                                </button>
                            )}

                            {/* Step: Session Type */}
                            {currentStep === "session" && (
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                        Select Session Type
                                    </h2>
                                    <SessionTypeSelector
                                        sessionTypes={sessionTypes}
                                        selectedId={selectedSessionType?.id || null}
                                        onSelect={handleSessionTypeSelect}
                                    />
                                </div>
                            )}

                            {/* Step: Date */}
                            {currentStep === "date" && (
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                        Select a Date
                                    </h2>
                                    <DatePicker
                                        availableDates={availableDates}
                                        selectedDate={selectedDate}
                                        onSelect={handleDateSelect}
                                        loading={loadingDates}
                                    />
                                </div>
                            )}

                            {/* Step: Time */}
                            {currentStep === "time" && (
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                        Select a Time
                                    </h2>
                                    <TimeSlotPicker
                                        slots={slots}
                                        selectedSlot={selectedSlot}
                                        onSelect={handleSlotSelect}
                                        loading={loadingSlots}
                                    />
                                </div>
                            )}

                            {/* Step: Details */}
                            {currentStep === "details" && (
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                        Your Details
                                    </h2>
                                    <BookingForm
                                        onSubmit={handleFormSubmit}
                                        loading={submitting}
                                    />
                                </div>
                            )}

                            {/* Step: Confirmation */}
                            {currentStep === "confirmation" && bookingResult && (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Check className="w-8 h-8 text-green-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Booking Confirmed!
                                    </h2>
                                    <p className="text-gray-600 mb-4">
                                        Your booking reference is{" "}
                                        <span className="font-mono font-semibold text-primary">
                                            {bookingResult.bookingReference}
                                        </span>
                                    </p>
                                    <p className="text-gray-600 mb-8">
                                        A confirmation email has been sent to your
                                        email address with all the details and a
                                        calendar invite.
                                    </p>

                                    {bookingResult.meetingLink && (
                                        <div className="bg-gray-50 rounded-xl p-4 mb-6 max-w-md mx-auto">
                                            <p className="text-sm text-gray-600 mb-2">
                                                Video Call Link:
                                            </p>
                                            <a
                                                href={bookingResult.meetingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline break-all"
                                            >
                                                {bookingResult.meetingLink}
                                            </a>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <a
                                            href={`/booking/${bookingResult.bookingReference}`}
                                            className="btn btn-primary"
                                        >
                                            View Booking Details
                                        </a>
                                        <a
                                            href="/"
                                            className="btn btn-secondary"
                                        >
                                            Return Home
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    {currentStep !== "confirmation" && (
                        <div className="lg:col-span-1">
                            <BookingSummary
                                therapistName={therapist.name}
                                therapistPhoto={therapist.photoUrl}
                                sessionType={selectedSessionType}
                                selectedDate={selectedDate}
                                selectedSlot={selectedSlot}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
