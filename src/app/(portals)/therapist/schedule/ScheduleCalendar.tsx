"use client";

import { useState } from "react";
import {
    format,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    addDays,
    addWeeks,
    subWeeks,
    addMonths,
    subMonths,
    isSameDay,
    isToday,
    isSameMonth,
} from "date-fns";
import { ChevronLeft, ChevronRight, Video, MapPin, Phone } from "lucide-react";
import Link from "next/link";

interface Event {
    id: string;
    title: string;
    start: Date;
    end: Date;
    status: string;
    meetingType: "in_person" | "video" | "phone";
    meetingLink: string | null;
    bookingReference: string;
}

interface ScheduleCalendarProps {
    events: Event[];
}

type ViewType = "week" | "month";

const meetingTypeIcons = {
    in_person: MapPin,
    video: Video,
    phone: Phone,
};

const statusColors = {
    pending: "bg-yellow-100 border-yellow-300 text-yellow-800",
    confirmed: "bg-green-100 border-green-300 text-green-800",
    cancelled: "bg-red-100 border-red-300 text-red-800",
    completed: "bg-blue-100 border-blue-300 text-blue-800",
    no_show: "bg-gray-100 border-gray-300 text-gray-800",
};

export default function ScheduleCalendar({ events }: ScheduleCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<ViewType>("week");

    const navigateBack = () => {
        if (view === "week") {
            setCurrentDate(subWeeks(currentDate, 1));
        } else {
            setCurrentDate(subMonths(currentDate, 1));
        }
    };

    const navigateForward = () => {
        if (view === "week") {
            setCurrentDate(addWeeks(currentDate, 1));
        } else {
            setCurrentDate(addMonths(currentDate, 1));
        }
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const getEventsForDay = (day: Date) => {
        return events.filter((event) => isSameDay(new Date(event.start), day));
    };

    const renderWeekView = () => {
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

        return (
            <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {days.map((day) => (
                    <div
                        key={day.toISOString()}
                        className={`p-2 text-center border-b ${
                            isToday(day) ? "bg-primary/5" : ""
                        }`}
                    >
                        <p className="text-xs text-gray-500">{format(day, "EEE")}</p>
                        <p
                            className={`text-lg font-semibold ${
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
                            className="min-h-[200px] p-1 border-r border-b last:border-r-0"
                        >
                            {dayEvents.map((event) => {
                                const Icon = meetingTypeIcons[event.meetingType];
                                return (
                                    <Link
                                        key={event.id}
                                        href={`/therapist/bookings/${event.id}`}
                                        className={`block p-2 mb-1 rounded-lg border text-xs ${
                                            statusColors[event.status as keyof typeof statusColors]
                                        } hover:opacity-80 transition-opacity`}
                                    >
                                        <div className="flex items-center gap-1 mb-1">
                                            <Icon className="w-3 h-3" />
                                            <span className="font-medium truncate">
                                                {event.title}
                                            </span>
                                        </div>
                                        <p className="text-[10px] opacity-75">
                                            {format(new Date(event.start), "h:mm a")}
                                        </p>
                                    </Link>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderMonthView = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart);
        const calendarEnd = endOfWeek(monthEnd);
        const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

        const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        return (
            <div>
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                    {weekDays.map((day) => (
                        <div
                            key={day}
                            className="p-2 text-center text-sm font-medium text-gray-500"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                    {days.map((day) => {
                        const dayEvents = getEventsForDay(day);
                        const isCurrentMonth = isSameMonth(day, currentDate);

                        return (
                            <div
                                key={day.toISOString()}
                                className={`min-h-[100px] p-1 border rounded-lg ${
                                    isToday(day)
                                        ? "bg-primary/5 border-primary"
                                        : isCurrentMonth
                                        ? "bg-white border-gray-200"
                                        : "bg-gray-50 border-gray-100"
                                }`}
                            >
                                <p
                                    className={`text-sm font-medium mb-1 ${
                                        isToday(day)
                                            ? "text-primary"
                                            : isCurrentMonth
                                            ? "text-gray-900"
                                            : "text-gray-400"
                                    }`}
                                >
                                    {format(day, "d")}
                                </p>
                                {dayEvents.slice(0, 2).map((event) => (
                                    <Link
                                        key={event.id}
                                        href={`/therapist/bookings/${event.id}`}
                                        className={`block p-1 mb-0.5 rounded text-[10px] ${
                                            statusColors[event.status as keyof typeof statusColors]
                                        } hover:opacity-80 truncate`}
                                    >
                                        {format(new Date(event.start), "h:mm")} {event.title}
                                    </Link>
                                ))}
                                {dayEvents.length > 2 && (
                                    <p className="text-[10px] text-gray-500 px-1">
                                        +{dayEvents.length - 2} more
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {view === "week"
                            ? `${format(startOfWeek(currentDate), "MMM d")} - ${format(
                                  endOfWeek(currentDate),
                                  "MMM d, yyyy"
                              )}`
                            : format(currentDate, "MMMM yyyy")}
                    </h2>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={navigateBack}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                            onClick={goToToday}
                            className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Today
                        </button>
                        <button
                            onClick={navigateForward}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setView("week")}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            view === "week"
                                ? "bg-primary text-white"
                                : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                        Week
                    </button>
                    <button
                        onClick={() => setView("month")}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            view === "month"
                                ? "bg-primary text-white"
                                : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                        Month
                    </button>
                </div>
            </div>

            {/* Calendar */}
            {view === "week" ? renderWeekView() : renderMonthView()}

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-200 border border-green-400"></div>
                    <span className="text-gray-600">Confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-yellow-200 border border-yellow-400"></div>
                    <span className="text-gray-600">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-200 border border-blue-400"></div>
                    <span className="text-gray-600">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-200 border border-red-400"></div>
                    <span className="text-gray-600">Cancelled</span>
                </div>
            </div>
        </div>
    );
}
