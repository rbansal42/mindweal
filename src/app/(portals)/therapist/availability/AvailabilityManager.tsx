"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus, Trash2, Clock, Calendar, X } from "lucide-react";

interface AvailabilitySlot {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
}

interface BlockedDateItem {
    id: string;
    startDatetime: string;
    endDatetime: string;
    reason: string | null;
    isAllDay: boolean;
}

interface AvailabilityManagerProps {
    therapistId: string;
    initialAvailability: AvailabilitySlot[];
    initialBlockedDates: BlockedDateItem[];
}

const DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

export default function AvailabilityManager({
    therapistId,
    initialAvailability,
    initialBlockedDates,
}: AvailabilityManagerProps) {
    const router = useRouter();
    const [availability, setAvailability] = useState(initialAvailability);
    const [blockedDates, setBlockedDates] = useState(initialBlockedDates);
    const [loading, setLoading] = useState(false);
    const [showAddSlot, setShowAddSlot] = useState(false);
    const [showAddBlock, setShowAddBlock] = useState(false);

    const [newSlot, setNewSlot] = useState({
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "17:00",
    });

    const [newBlock, setNewBlock] = useState({
        date: format(new Date(), "yyyy-MM-dd"),
        startTime: "09:00",
        endTime: "17:00",
        reason: "",
        isAllDay: false,
    });

    const handleAddSlot = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/therapist/availability`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    therapistId,
                    ...newSlot,
                    startTime: newSlot.startTime + ":00",
                    endTime: newSlot.endTime + ":00",
                }),
            });

            if (response.ok) {
                router.refresh();
                setShowAddSlot(false);
            }
        } catch (error) {
            console.error("Error adding slot:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSlot = async (slotId: string) => {
        if (!confirm("Are you sure you want to delete this availability slot?")) {
            return;
        }

        try {
            const response = await fetch(`/api/therapist/availability/${slotId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setAvailability(availability.filter((a) => a.id !== slotId));
            }
        } catch (error) {
            console.error("Error deleting slot:", error);
        }
    };

    const handleAddBlockedDate = async () => {
        setLoading(true);
        try {
            let startDatetime: string;
            let endDatetime: string;

            if (newBlock.isAllDay) {
                startDatetime = `${newBlock.date}T00:00:00`;
                endDatetime = `${newBlock.date}T23:59:59`;
            } else {
                startDatetime = `${newBlock.date}T${newBlock.startTime}:00`;
                endDatetime = `${newBlock.date}T${newBlock.endTime}:00`;
            }

            const response = await fetch(`/api/therapist/blocked-dates`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    therapistId,
                    startDatetime,
                    endDatetime,
                    reason: newBlock.reason || null,
                    isAllDay: newBlock.isAllDay,
                }),
            });

            if (response.ok) {
                router.refresh();
                setShowAddBlock(false);
            }
        } catch (error) {
            console.error("Error adding blocked date:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBlockedDate = async (blockId: string) => {
        if (!confirm("Are you sure you want to remove this blocked date?")) {
            return;
        }

        try {
            const response = await fetch(`/api/therapist/blocked-dates/${blockId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setBlockedDates(blockedDates.filter((b) => b.id !== blockId));
            }
        } catch (error) {
            console.error("Error deleting blocked date:", error);
        }
    };

    // Group availability by day
    const availabilityByDay = DAYS.map((day, index) => ({
        day,
        index,
        slots: availability.filter((a) => a.dayOfWeek === index),
    }));

    return (
        <div className="space-y-8">
            {/* Weekly Availability */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Weekly Schedule
                        </h2>
                    </div>
                    <button
                        onClick={() => setShowAddSlot(true)}
                        className="btn btn-primary text-sm flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Hours
                    </button>
                </div>

                <div className="space-y-4">
                    {availabilityByDay.map(({ day, index, slots }) => (
                        <div
                            key={day}
                            className="flex items-start gap-4 py-3 border-b border-gray-100 last:border-0"
                        >
                            <div className="w-24 flex-shrink-0">
                                <span
                                    className={`font-medium ${
                                        slots.length > 0
                                            ? "text-gray-900"
                                            : "text-gray-400"
                                    }`}
                                >
                                    {day}
                                </span>
                            </div>
                            <div className="flex-1">
                                {slots.length === 0 ? (
                                    <span className="text-gray-400 text-sm">
                                        Not available
                                    </span>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {slots.map((slot) => (
                                            <div
                                                key={slot.id}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm"
                                            >
                                                <span>
                                                    {slot.startTime.slice(0, 5)} -{" "}
                                                    {slot.endTime.slice(0, 5)}
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteSlot(slot.id)}
                                                    className="p-1 hover:bg-primary/20 rounded transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Blocked Dates */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-100">
                            <Calendar className="w-5 h-5 text-red-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Blocked Dates
                        </h2>
                    </div>
                    <button
                        onClick={() => setShowAddBlock(true)}
                        className="btn bg-red-50 text-red-600 hover:bg-red-100 text-sm flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Block Time
                    </button>
                </div>

                {blockedDates.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        No blocked dates. Add dates when you&apos;re unavailable.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {blockedDates.map((block) => (
                            <div
                                key={block.id}
                                className="flex items-center justify-between p-4 bg-red-50 rounded-lg"
                            >
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {format(new Date(block.startDatetime), "EEEE, MMMM d, yyyy")}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {block.isAllDay
                                            ? "All day"
                                            : `${format(
                                                  new Date(block.startDatetime),
                                                  "h:mm a"
                                              )} - ${format(new Date(block.endDatetime), "h:mm a")}`}
                                    </p>
                                    {block.reason && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            {block.reason}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDeleteBlockedDate(block.id)}
                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Slot Modal */}
            {showAddSlot && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            Add Working Hours
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Day of Week
                                </label>
                                <select
                                    value={newSlot.dayOfWeek}
                                    onChange={(e) =>
                                        setNewSlot({ ...newSlot, dayOfWeek: parseInt(e.target.value) })
                                    }
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                >
                                    {DAYS.map((day, index) => (
                                        <option key={day} value={index}>
                                            {day}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Time
                                    </label>
                                    <input
                                        type="time"
                                        value={newSlot.startTime}
                                        onChange={(e) =>
                                            setNewSlot({ ...newSlot, startTime: e.target.value })
                                        }
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        End Time
                                    </label>
                                    <input
                                        type="time"
                                        value={newSlot.endTime}
                                        onChange={(e) =>
                                            setNewSlot({ ...newSlot, endTime: e.target.value })
                                        }
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddSlot(false)}
                                className="flex-1 btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddSlot}
                                disabled={loading}
                                className="flex-1 btn btn-primary"
                            >
                                {loading ? "Adding..." : "Add Hours"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Block Modal */}
            {showAddBlock && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            Block Time Off
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={newBlock.date}
                                    onChange={(e) =>
                                        setNewBlock({ ...newBlock, date: e.target.value })
                                    }
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isAllDay"
                                    checked={newBlock.isAllDay}
                                    onChange={(e) =>
                                        setNewBlock({ ...newBlock, isAllDay: e.target.checked })
                                    }
                                    className="w-4 h-4 text-primary border-gray-300 rounded"
                                />
                                <label htmlFor="isAllDay" className="text-sm text-gray-700">
                                    Block entire day
                                </label>
                            </div>

                            {!newBlock.isAllDay && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Start Time
                                        </label>
                                        <input
                                            type="time"
                                            value={newBlock.startTime}
                                            onChange={(e) =>
                                                setNewBlock({ ...newBlock, startTime: e.target.value })
                                            }
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            End Time
                                        </label>
                                        <input
                                            type="time"
                                            value={newBlock.endTime}
                                            onChange={(e) =>
                                                setNewBlock({ ...newBlock, endTime: e.target.value })
                                            }
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason (optional)
                                </label>
                                <input
                                    type="text"
                                    value={newBlock.reason}
                                    onChange={(e) =>
                                        setNewBlock({ ...newBlock, reason: e.target.value })
                                    }
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    placeholder="e.g., Vacation, Conference"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddBlock(false)}
                                className="flex-1 btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddBlockedDate}
                                disabled={loading}
                                className="flex-1 btn bg-red-500 text-white hover:bg-red-600"
                            >
                                {loading ? "Adding..." : "Block Time"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
