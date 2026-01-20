"use client";

import { useState } from "react";
import {
    format,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    addWeeks,
    subWeeks,
    isSameDay,
    isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight, Video, MapPin, Phone } from "lucide-react";
import Link from "next/link";

interface TherapistInfo {
    id: string;
    name: string;
    slug: string;
}

interface BookingEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    status: string;
    meetingType: "in_person" | "video" | "phone";
    bookingReference: string;
    therapist: TherapistInfo | null;
}

interface MasterCalendarProps {
    therapists: TherapistInfo[];
    bookings: BookingEvent[];
}

const COLORS = [
    "#00A99D", // Primary teal
    "#4A9E6B", // Secondary green
    "#10B981", // Accent green
    "#3B82F6", // Blue
    "#8B5CF6", // Purple
    "#F59E0B", // Amber
    "#EC4899", // Pink
    "#EF4444", // Red
];

const statusColors = {
    pending: "opacity-50",
    confirmed: "",
    cancelled: "opacity-30 line-through",
    completed: "opacity-70",
    no_show: "opacity-50",
};

const meetingTypeIcons = {
    in_person: MapPin,
    video: Video,
    phone: Phone,
};

export default function MasterCalendar({
    therapists,
    bookings,
}: MasterCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedTherapists, setSelectedTherapists] = useState<string[]>(
        therapists.map((t) => t.id)
    );

    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    // Assign colors to therapists
    const therapistColors: Record<string, string> = {};
    therapists.forEach((t, index) => {
        therapistColors[t.id] = COLORS[index % COLORS.length];
    });

    const toggleTherapist = (therapistId: string) => {
        setSelectedTherapists((prev) =>
            prev.includes(therapistId)
                ? prev.filter((id) => id !== therapistId)
                : [...prev, therapistId]
        );
    };

    const selectAll = () => setSelectedTherapists(therapists.map((t) => t.id));
    const clearAll = () => setSelectedTherapists([]);

    const getEventsForDay = (day: Date) => {
        return bookings.filter(
            (event) =>
                isSameDay(new Date(event.start), day) &&
                event.therapist &&
                selectedTherapists.includes(event.therapist.id)
        );
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
                    </h2>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                            onClick={() => setCurrentDate(new Date())}
                            className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Therapist Filters */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700">
                        Filter by Therapist
                    </p>
                    <div className="flex gap-2 text-sm">
                        <button
                            onClick={selectAll}
                            className="text-primary hover:underline"
                        >
                            Select All
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                            onClick={clearAll}
                            className="text-gray-500 hover:underline"
                        >
                            Clear
                        </button>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {therapists.map((therapist) => {
                        const isSelected = selectedTherapists.includes(therapist.id);
                        const color = therapistColors[therapist.id];
                        return (
                            <button
                                key={therapist.id}
                                onClick={() => toggleTherapist(therapist.id)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                    isSelected
                                        ? "text-white"
                                        : "bg-white text-gray-600 border border-gray-200"
                                }`}
                                style={{
                                    backgroundColor: isSelected ? color : undefined,
                                }}
                            >
                                <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: color }}
                                />
                                {therapist.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {days.map((day) => (
                    <div
                        key={day.toISOString()}
                        className={`p-3 text-center border-b-2 ${
                            isToday(day)
                                ? "bg-primary/5 border-primary"
                                : "border-gray-200"
                        }`}
                    >
                        <p className="text-sm text-gray-500">{format(day, "EEE")}</p>
                        <p
                            className={`text-xl font-semibold ${
                                isToday(day) ? "text-primary" : "text-gray-900"
                            }`}
                        >
                            {format(day, "d")}
                        </p>
                    </div>
                ))}

                {/* Events for each day */}
                {days.map((day) => {
                    const dayEvents = getEventsForDay(day);
                    return (
                        <div
                            key={`events-${day.toISOString()}`}
                            className="min-h-[250px] p-2 border-r border-b last:border-r-0"
                        >
                            {dayEvents.map((event) => {
                                const Icon = meetingTypeIcons[event.meetingType];
                                const color = event.therapist
                                    ? therapistColors[event.therapist.id]
                                    : "#gray";
                                return (
                                    <Link
                                        key={event.id}
                                        href={`/booking/${event.bookingReference}`}
                                        className={`block p-2 mb-1 rounded-lg text-white text-xs ${
                                            statusColors[event.status as keyof typeof statusColors]
                                        } hover:opacity-90 transition-opacity`}
                                        style={{ backgroundColor: color }}
                                    >
                                        <div className="flex items-center gap-1 mb-1">
                                            <Icon className="w-3 h-3" />
                                            <span className="font-medium truncate">
                                                {event.title}
                                            </span>
                                        </div>
                                        <p className="opacity-80">
                                            {format(new Date(event.start), "h:mm a")}
                                        </p>
                                        {event.therapist && (
                                            <p className="opacity-70 truncate text-[10px]">
                                                {event.therapist.name}
                                            </p>
                                        )}
                                    </Link>
                                );
                            })}
                            {dayEvents.length === 0 && (
                                <p className="text-xs text-gray-300 text-center mt-4">
                                    No sessions
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-primary"></div>
                    <span className="text-gray-600">Confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-primary opacity-70"></div>
                    <span className="text-gray-600">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-primary opacity-30"></div>
                    <span className="text-gray-600">Cancelled</span>
                </div>
            </div>
        </div>
    );
}
