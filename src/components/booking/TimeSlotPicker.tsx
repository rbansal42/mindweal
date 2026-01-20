"use client";

interface TimeSlot {
    start: Date;
    end: Date;
    startFormatted: string;
    endFormatted: string;
    available: boolean;
}

interface TimeSlotPickerProps {
    slots: TimeSlot[];
    selectedSlot: TimeSlot | null;
    onSelect: (slot: TimeSlot) => void;
    loading?: boolean;
}

export default function TimeSlotPicker({
    slots,
    selectedSlot,
    onSelect,
    loading = false,
}: TimeSlotPickerProps) {
    const availableSlots = slots.filter((slot) => slot.available);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (availableSlots.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No available slots for this date. Please select another date.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {availableSlots.map((slot, index) => {
                const isSelected =
                    selectedSlot &&
                    new Date(selectedSlot.start).getTime() ===
                        new Date(slot.start).getTime();

                return (
                    <button
                        key={index}
                        type="button"
                        onClick={() => onSelect(slot)}
                        className={`
                            py-3 px-4 rounded-lg text-sm font-medium transition-all
                            ${
                                isSelected
                                    ? "bg-primary text-white"
                                    : "bg-gray-50 text-gray-700 hover:bg-primary/10 hover:text-primary"
                            }
                        `}
                    >
                        {slot.startFormatted}
                    </button>
                );
            })}
        </div>
    );
}
