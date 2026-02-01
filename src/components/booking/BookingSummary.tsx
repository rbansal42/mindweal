"use client";

import { format } from "date-fns";
import { Video, MapPin, Phone, Calendar, Clock, User } from "lucide-react";

interface SessionType {
    id: string;
    name: string;
    duration: number;
    meetingType: "in_person" | "video" | "phone";
    price: number | null;
}

interface TimeSlot {
    start: Date;
    end: Date;
    startFormatted: string;
    endFormatted: string;
}

interface BookingSummaryProps {
    therapistName: string;
    therapistPhoto?: string | null;
    sessionType: SessionType | null;
    selectedDate: string | null;
    selectedSlot: TimeSlot | null;
}

const meetingTypeIcons = {
    in_person: MapPin,
    video: Video,
    phone: Phone,
};

const meetingTypeLabels = {
    in_person: "In-Person",
    video: "Video Call",
    phone: "Phone Call",
};

export default function BookingSummary({
    therapistName,
    therapistPhoto,
    sessionType,
    selectedDate,
    selectedSlot,
}: BookingSummaryProps) {
    const Icon = sessionType
        ? meetingTypeIcons[sessionType.meetingType]
        : Calendar;

    return (
        <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Booking Summary</h3>

            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                {therapistPhoto ? (
                    <img
                        src={therapistPhoto}
                        alt={therapistName}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                    </div>
                )}
                <div>
                    <p className="font-medium text-gray-900">{therapistName}</p>
                    <p className="text-sm text-gray-500">Therapist</p>
                </div>
            </div>

            <div className="space-y-3">
                {sessionType && (
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white">
                            <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Session Type</p>
                            <p className="font-medium text-gray-900">
                                {sessionType.name}
                            </p>
                            <p className="text-xs text-gray-500">
                                {meetingTypeLabels[sessionType.meetingType]} •{" "}
                                {sessionType.duration} mins
                            </p>
                        </div>
                    </div>
                )}

                {selectedDate && (
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white">
                            <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Date</p>
                            <p className="font-medium text-gray-900">
                                {format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}
                            </p>
                        </div>
                    </div>
                )}

                {selectedSlot && (
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white">
                            <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Time</p>
                            <p className="font-medium text-gray-900">
                                {selectedSlot.startFormatted} -{" "}
                                {selectedSlot.endFormatted}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {sessionType?.price && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Session Fee</span>
                        <span className="text-xl font-bold text-primary">
                            ₹{sessionType.price}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Payment to be made at the clinic
                    </p>
                </div>
            )}
        </div>
    );
}
