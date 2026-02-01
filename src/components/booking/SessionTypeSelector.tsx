"use client";

import { Video, MapPin, Phone } from "lucide-react";

interface SessionType {
    id: string;
    name: string;
    duration: number;
    meetingType: "in_person" | "video" | "phone";
    price: number | null;
    description: string | null;
    color: string;
}

interface SessionTypeSelectorProps {
    sessionTypes: SessionType[];
    selectedId: string | null;
    onSelect: (sessionType: SessionType) => void;
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

export default function SessionTypeSelector({
    sessionTypes,
    selectedId,
    onSelect,
}: SessionTypeSelectorProps) {
    return (
        <div className="space-y-3">
            {sessionTypes.map((sessionType) => {
                const Icon = meetingTypeIcons[sessionType.meetingType];
                const isSelected = selectedId === sessionType.id;

                return (
                    <button
                        key={sessionType.id}
                        type="button"
                        onClick={() => onSelect(sessionType)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                            isSelected
                                ? "border-primary bg-primary/5"
                                : "border-gray-200 hover:border-primary/50"
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div
                                    className={`p-2 rounded-lg ${
                                        isSelected
                                            ? "bg-primary text-white"
                                            : "bg-gray-100 text-gray-600"
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">
                                        {sessionType.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        {meetingTypeLabels[sessionType.meetingType]} •{" "}
                                        {sessionType.duration} mins
                                    </p>
                                    {sessionType.description && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            {sessionType.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {sessionType.price && (
                                <span className="text-primary font-semibold">
                                    ₹{sessionType.price}
                                </span>
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
