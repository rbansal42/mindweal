"use client";

import { useState, useEffect } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    addMonths,
    subMonths,
    isSameMonth,
    isSameDay,
    parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
    availableDates: string[];
    selectedDate: string | null;
    onSelect: (date: string) => void;
    loading?: boolean;
}

export default function DatePicker({
    availableDates,
    selectedDate,
    onSelect,
    loading = false,
}: DatePickerProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const availableDateSet = new Set(availableDates);

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between mb-4">
                <button
                    type="button"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="font-semibold text-gray-900">
                    {format(currentMonth, "MMMM yyyy")}
                </h2>
                <button
                    type="button"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
            </div>
        );
    };

    const renderDays = () => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        return (
            <div className="grid grid-cols-7 mb-2">
                {days.map((day) => (
                    <div
                        key={day}
                        className="text-center text-sm font-medium text-gray-500 py-2"
                    >
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const formattedDate = format(day, "yyyy-MM-dd");
                const isAvailable = availableDateSet.has(formattedDate);
                const isSelected =
                    selectedDate && isSameDay(day, parseISO(selectedDate));
                const isCurrentMonth = isSameMonth(day, monthStart);

                days.push(
                    <button
                        key={day.toString()}
                        type="button"
                        onClick={() => isAvailable && onSelect(formattedDate)}
                        disabled={!isAvailable || loading}
                        className={`
                            aspect-square p-2 rounded-lg text-sm font-medium transition-all
                            ${
                                !isCurrentMonth
                                    ? "text-gray-300"
                                    : isSelected
                                    ? "bg-primary text-white"
                                    : isAvailable
                                    ? "text-gray-900 hover:bg-primary/10 cursor-pointer"
                                    : "text-gray-300 cursor-not-allowed"
                            }
                        `}
                    >
                        {format(day, "d")}
                    </button>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div key={day.toString()} className="grid grid-cols-7 gap-1">
                    {days}
                </div>
            );
            days = [];
        }

        return <div className="space-y-1">{rows}</div>;
    };

    return (
        <div className="bg-white rounded-xl p-4">
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
            ) : (
                <>
                    {renderHeader()}
                    {renderDays()}
                    {renderCells()}
                </>
            )}
        </div>
    );
}
