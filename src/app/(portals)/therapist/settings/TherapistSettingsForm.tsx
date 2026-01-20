"use client";

import { Video, MapPin, Phone, ExternalLink, Mail, Clock, User, AlertCircle } from "lucide-react";

interface TherapistData {
    id: string;
    name: string;
    title: string;
    email: string;
    phone: string | null;
    bio: string;
    photoUrl: string | null;
    slug: string;
    defaultSessionDuration: number;
    bufferTime: number;
    advanceBookingDays: number;
    minBookingNotice: number;
}

interface SessionTypeData {
    id: string;
    name: string;
    duration: number;
    meetingType: "in_person" | "video" | "phone";
    price: number | null;
    description: string | null;
    isActive: boolean;
    color: string;
}

interface Specialization {
    id: string;
    name: string;
}

interface TherapistSettingsFormProps {
    therapist: TherapistData;
    sessionTypes: SessionTypeData[];
    specializations: Specialization[];
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

export default function TherapistSettingsForm({
    therapist,
    sessionTypes,
    specializations,
}: TherapistSettingsFormProps) {
    return (
        <div className="space-y-8">
            {/* Admin Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                    <p className="font-medium text-amber-800">Profile managed by admin</p>
                    <p className="text-sm text-amber-700 mt-1">
                        Contact the admin team to update your profile information, session types, or booking settings.
                        You can manage your availability from the Availability page.
                    </p>
                </div>
            </div>

            {/* Booking Link */}
            <div className="bg-secondary-green/5 border border-secondary-green/20 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-secondary-green mb-2">
                    Your Booking Link
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                    Share this link with clients to let them book sessions with you.
                </p>
                <div className="flex items-center gap-4">
                    <code className="flex-1 px-4 py-3 bg-white rounded-lg text-gray-900 text-sm border border-gray-200">
                        {typeof window !== "undefined"
                            ? `${window.location.origin}/book/${therapist.slug}`
                            : `/book/${therapist.slug}`}
                    </code>
                    <a
                        href={`/book/${therapist.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Open
                    </a>
                </div>
            </div>

            {/* Profile Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>

                <div className="flex items-start gap-6 mb-6">
                    {therapist.photoUrl ? (
                        <img src={therapist.photoUrl} alt={therapist.name} className="w-24 h-24 rounded-full object-cover" />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="w-10 h-10 text-gray-400" />
                        </div>
                    )}
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold">{therapist.name}</h3>
                        <p className="text-gray-600">{therapist.title}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {therapist.email}
                            </span>
                            {therapist.phone && (
                                <span className="flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    {therapist.phone}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Specializations */}
                {specializations.length > 0 && (
                    <div className="mb-6">
                        <p className="text-sm font-medium text-gray-700 mb-2">Specializations</p>
                        <div className="flex flex-wrap gap-2">
                            {specializations.map(spec => (
                                <span key={spec.id} className="px-3 py-1 bg-[var(--primary-teal)]/10 text-[var(--primary-teal)] text-sm rounded-full">
                                    {spec.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bio */}
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Bio</p>
                    <p className="text-gray-600 whitespace-pre-wrap">{therapist.bio}</p>
                </div>
            </div>

            {/* Session Types (Read-only) */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-secondary-green/10">
                        <Video className="w-5 h-5 text-secondary-green" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Session Types</h2>
                </div>

                {sessionTypes.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        No session types configured. Contact admin to add session types.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {sessionTypes.filter(s => s.isActive).map((session) => {
                            const Icon = meetingTypeIcons[session.meetingType];
                            return (
                                <div
                                    key={session.id}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white"
                                >
                                    <div
                                        className="p-3 rounded-lg"
                                        style={{ backgroundColor: `${session.color}20` }}
                                    >
                                        <Icon className="w-5 h-5" style={{ color: session.color }} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{session.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            {meetingTypeLabels[session.meetingType]} • {session.duration} mins
                                            {session.price && ` • Rs ${session.price}`}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Booking Settings (Read-only) */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-secondary-green/10">
                        <Clock className="w-5 h-5 text-secondary-green" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Booking Settings</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{therapist.defaultSessionDuration}</p>
                        <p className="text-sm text-gray-500">Default Duration (mins)</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{therapist.bufferTime}</p>
                        <p className="text-sm text-gray-500">Buffer Time (mins)</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{therapist.advanceBookingDays}</p>
                        <p className="text-sm text-gray-500">Advance Booking (days)</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{therapist.minBookingNotice}</p>
                        <p className="text-sm text-gray-500">Min Notice (hours)</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
