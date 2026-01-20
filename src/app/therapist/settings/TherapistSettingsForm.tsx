"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Video, MapPin, Phone, Plus, Trash2, Check, ExternalLink } from "lucide-react";

interface TherapistData {
    id: string;
    name: string;
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

interface TherapistSettingsFormProps {
    therapist: TherapistData;
    sessionTypes: SessionTypeData[];
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
    sessionTypes: initialSessionTypes,
}: TherapistSettingsFormProps) {
    const router = useRouter();
    const [sessionTypes, setSessionTypes] = useState(initialSessionTypes);
    const [settings, setSettings] = useState({
        defaultSessionDuration: therapist.defaultSessionDuration,
        bufferTime: therapist.bufferTime,
        advanceBookingDays: therapist.advanceBookingDays,
        minBookingNotice: therapist.minBookingNotice,
    });
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [settingsSuccess, setSettingsSuccess] = useState(false);
    const [showAddSession, setShowAddSession] = useState(false);
    const [newSession, setNewSession] = useState({
        name: "",
        duration: 60,
        meetingType: "video" as "in_person" | "video" | "phone",
        price: "",
        description: "",
    });
    const [sessionLoading, setSessionLoading] = useState(false);

    const handleSaveSettings = async () => {
        setSettingsLoading(true);
        setSettingsSuccess(false);

        try {
            const response = await fetch(`/api/therapist/settings`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    therapistId: therapist.id,
                    ...settings,
                }),
            });

            if (response.ok) {
                setSettingsSuccess(true);
                setTimeout(() => setSettingsSuccess(false), 3000);
            }
        } catch (error) {
            console.error("Error saving settings:", error);
        } finally {
            setSettingsLoading(false);
        }
    };

    const handleAddSession = async () => {
        setSessionLoading(true);

        try {
            const response = await fetch(`/api/therapist/session-types`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    therapistId: therapist.id,
                    name: newSession.name,
                    duration: newSession.duration,
                    meetingType: newSession.meetingType,
                    price: newSession.price ? parseFloat(newSession.price) : null,
                    description: newSession.description || null,
                }),
            });

            if (response.ok) {
                router.refresh();
                setShowAddSession(false);
                setNewSession({
                    name: "",
                    duration: 60,
                    meetingType: "video",
                    price: "",
                    description: "",
                });
            }
        } catch (error) {
            console.error("Error adding session type:", error);
        } finally {
            setSessionLoading(false);
        }
    };

    const handleDeleteSession = async (sessionId: string) => {
        if (!confirm("Are you sure you want to delete this session type?")) {
            return;
        }

        try {
            const response = await fetch(`/api/therapist/session-types/${sessionId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setSessionTypes(sessionTypes.filter((st) => st.id !== sessionId));
            }
        } catch (error) {
            console.error("Error deleting session type:", error);
        }
    };

    const toggleSessionActive = async (sessionId: string, isActive: boolean) => {
        try {
            const response = await fetch(`/api/therapist/session-types/${sessionId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !isActive }),
            });

            if (response.ok) {
                setSessionTypes(
                    sessionTypes.map((st) =>
                        st.id === sessionId ? { ...st, isActive: !isActive } : st
                    )
                );
            }
        } catch (error) {
            console.error("Error toggling session type:", error);
        }
    };

    return (
        <div className="space-y-8">
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

            {/* Booking Preferences */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-secondary-green/10">
                        <Settings className="w-5 h-5 text-secondary-green" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        Booking Preferences
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Default Session Duration (mins)
                        </label>
                        <input
                            type="number"
                            value={settings.defaultSessionDuration}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    defaultSessionDuration: parseInt(e.target.value) || 60,
                                })
                            }
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary-green focus:border-transparent outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Buffer Time Between Sessions (mins)
                        </label>
                        <input
                            type="number"
                            value={settings.bufferTime}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    bufferTime: parseInt(e.target.value) || 15,
                                })
                            }
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary-green focus:border-transparent outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Advance Booking (days)
                        </label>
                        <input
                            type="number"
                            value={settings.advanceBookingDays}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    advanceBookingDays: parseInt(e.target.value) || 30,
                                })
                            }
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary-green focus:border-transparent outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            How far in advance clients can book
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Minimum Booking Notice (hours)
                        </label>
                        <input
                            type="number"
                            value={settings.minBookingNotice}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    minBookingNotice: parseInt(e.target.value) || 24,
                                })
                            }
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary-green focus:border-transparent outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Minimum hours before a session can be booked
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleSaveSettings}
                    disabled={settingsLoading}
                    className="mt-6 btn btn-primary flex items-center gap-2"
                >
                    {settingsLoading ? (
                        <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Saving...
                        </>
                    ) : settingsSuccess ? (
                        <>
                            <Check className="w-4 h-4" />
                            Saved!
                        </>
                    ) : (
                        "Save Preferences"
                    )}
                </button>
            </div>

            {/* Session Types */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-secondary-green/10">
                            <Video className="w-5 h-5 text-secondary-green" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Session Types
                        </h2>
                    </div>
                    <button
                        onClick={() => setShowAddSession(true)}
                        className="btn btn-primary text-sm flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Session Type
                    </button>
                </div>

                {sessionTypes.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        No session types configured. Add one to allow bookings.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {sessionTypes.map((session) => {
                            const Icon = meetingTypeIcons[session.meetingType];
                            return (
                                <div
                                    key={session.id}
                                    className={`flex items-center gap-4 p-4 rounded-xl border ${
                                        session.isActive
                                            ? "border-gray-200 bg-white"
                                            : "border-gray-100 bg-gray-50 opacity-60"
                                    }`}
                                >
                                    <div
                                        className="p-3 rounded-lg"
                                        style={{ backgroundColor: `${session.color}20` }}
                                    >
                                        <Icon
                                            className="w-5 h-5"
                                            style={{ color: session.color }}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-gray-900">
                                                {session.name}
                                            </h3>
                                            {!session.isActive && (
                                                <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {meetingTypeLabels[session.meetingType]} •{" "}
                                            {session.duration} mins
                                            {session.price && ` • ₹${session.price}`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() =>
                                                toggleSessionActive(session.id, session.isActive)
                                            }
                                            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                                session.isActive
                                                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                    : "bg-green-100 text-green-600 hover:bg-green-200"
                                            }`}
                                        >
                                            {session.isActive ? "Deactivate" : "Activate"}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSession(session.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add Session Modal */}
            {showAddSession && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            Add Session Type
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Session Name
                                </label>
                                <input
                                    type="text"
                                    value={newSession.name}
                                    onChange={(e) =>
                                        setNewSession({ ...newSession, name: e.target.value })
                                    }
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary-green focus:border-transparent outline-none"
                                    placeholder="e.g., Individual Therapy"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Meeting Type
                                </label>
                                <select
                                    value={newSession.meetingType}
                                    onChange={(e) =>
                                        setNewSession({
                                            ...newSession,
                                            meetingType: e.target.value as
                                                | "in_person"
                                                | "video"
                                                | "phone",
                                        })
                                    }
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary-green focus:border-transparent outline-none"
                                >
                                    <option value="video">Video Call</option>
                                    <option value="in_person">In-Person</option>
                                    <option value="phone">Phone Call</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Duration (mins)
                                    </label>
                                    <input
                                        type="number"
                                        value={newSession.duration}
                                        onChange={(e) =>
                                            setNewSession({
                                                ...newSession,
                                                duration: parseInt(e.target.value) || 60,
                                            })
                                        }
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary-green focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Price (₹)
                                    </label>
                                    <input
                                        type="text"
                                        value={newSession.price}
                                        onChange={(e) =>
                                            setNewSession({ ...newSession, price: e.target.value })
                                        }
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary-green focus:border-transparent outline-none"
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={newSession.description}
                                    onChange={(e) =>
                                        setNewSession({
                                            ...newSession,
                                            description: e.target.value,
                                        })
                                    }
                                    rows={2}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary-green focus:border-transparent outline-none resize-none"
                                    placeholder="Optional description"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddSession(false)}
                                className="flex-1 btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddSession}
                                disabled={sessionLoading || !newSession.name}
                                className="flex-1 btn btn-primary"
                            >
                                {sessionLoading ? "Adding..." : "Add Session"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
