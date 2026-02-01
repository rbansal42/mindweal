import {
    addMinutes,
    format,
    parse,
    isAfter,
    isBefore,
    startOfDay,
    addDays,
    getDay,
    isSameDay,
    parseISO,
    addHours,
} from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { AppDataSource } from "./db";
import { Therapist } from "@/entities/Therapist";
import { TherapistAvailability } from "@/entities/TherapistAvailability";
import { BlockedDate } from "@/entities/BlockedDate";
import { Booking } from "@/entities/Booking";
import { bookingConfig } from "@/config";

export interface TimeSlot {
    start: Date;
    end: Date;
    startFormatted: string;
    endFormatted: string;
    available: boolean;
}

export interface AvailableDatesResult {
    dates: string[];
    therapist: {
        id: string;
        name: string;
        slug: string;
    };
}

export interface AvailableSlotsResult {
    date: string;
    slots: TimeSlot[];
    therapist: {
        id: string;
        name: string;
        slug: string;
    };
}

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

export async function getTherapistBySlug(slug: string): Promise<Therapist | null> {
    const ds = await getDataSource();
    const therapistRepo = ds.getRepository(Therapist);

    return therapistRepo.findOne({
        where: { slug, isActive: true },
        relations: ["sessionTypes", "availability"],
    });
}

export async function getAvailableDates(
    therapistSlug: string,
    sessionDuration: number,
    timezone: string = bookingConfig.defaultTimezone
): Promise<AvailableDatesResult | null> {
    const therapist = await getTherapistBySlug(therapistSlug);
    if (!therapist) return null;

    const ds = await getDataSource();
    const availabilityRepo = ds.getRepository(TherapistAvailability);
    const blockedDateRepo = ds.getRepository(BlockedDate);
    const bookingRepo = ds.getRepository(Booking);

    const now = new Date();
    const minBookingTime = addHours(now, therapist.minBookingNotice);
    const maxBookingDate = addDays(now, therapist.advanceBookingDays);

    // Get therapist's weekly availability
    const availability = await availabilityRepo.find({
        where: { therapistId: therapist.id, isActive: true },
    });

    // Get blocked dates in the range
    const blockedDates = await blockedDateRepo.find({
        where: { therapistId: therapist.id },
    });

    // Get existing bookings
    const existingBookings = await bookingRepo.find({
        where: {
            therapistId: therapist.id,
            status: "confirmed",
        },
    });

    const availableDates: string[] = [];
    let currentDate = startOfDay(toZonedTime(minBookingTime, timezone));
    const endDate = startOfDay(toZonedTime(maxBookingDate, timezone));

    while (isBefore(currentDate, endDate) || isSameDay(currentDate, endDate)) {
        const dayOfWeek = getDay(currentDate);

        // Check if therapist has availability on this day of week
        const dayAvailability = availability.filter(a => a.dayOfWeek === dayOfWeek);

        if (dayAvailability.length > 0) {
            // Check if not a fully blocked date
            const dateStr = format(currentDate, "yyyy-MM-dd");
            const isFullyBlocked = blockedDates.some(bd => {
                const blockedStart = new Date(bd.startDatetime);
                const blockedEnd = new Date(bd.endDatetime);
                return bd.isAllDay && format(blockedStart, "yyyy-MM-dd") === dateStr;
            });

            if (!isFullyBlocked) {
                // Check if there's at least one available slot
                const hasSlot = await hasAvailableSlot(
                    currentDate,
                    dayAvailability,
                    blockedDates,
                    existingBookings,
                    sessionDuration,
                    therapist.bufferTime,
                    minBookingTime,
                    timezone
                );

                if (hasSlot) {
                    availableDates.push(dateStr);
                }
            }
        }

        currentDate = addDays(currentDate, 1);
    }

    return {
        dates: availableDates,
        therapist: {
            id: therapist.id,
            name: therapist.name,
            slug: therapist.slug,
        },
    };
}

async function hasAvailableSlot(
    date: Date,
    dayAvailability: TherapistAvailability[],
    blockedDates: BlockedDate[],
    existingBookings: Booking[],
    sessionDuration: number,
    bufferTime: number,
    minBookingTime: Date,
    timezone: string
): Promise<boolean> {
    const dateStr = format(date, "yyyy-MM-dd");

    for (const availability of dayAvailability) {
        const startTime = parse(availability.startTime, "HH:mm:ss", date);
        const endTime = parse(availability.endTime, "HH:mm:ss", date);

        let slotStart = startTime;

        while (isBefore(addMinutes(slotStart, sessionDuration), endTime) ||
               addMinutes(slotStart, sessionDuration).getTime() === endTime.getTime()) {
            const slotEnd = addMinutes(slotStart, sessionDuration);
            const slotStartUTC = fromZonedTime(slotStart, timezone);
            const slotEndUTC = fromZonedTime(slotEnd, timezone);

            // Check if slot is after minimum booking time
            if (isAfter(slotStartUTC, minBookingTime)) {
                // Check if slot is not blocked
                const isBlocked = blockedDates.some(bd => {
                    if (bd.isAllDay) return false; // Already handled
                    const blockedStart = new Date(bd.startDatetime);
                    const blockedEnd = new Date(bd.endDatetime);
                    return (
                        (isAfter(slotStartUTC, blockedStart) || slotStartUTC.getTime() === blockedStart.getTime()) &&
                        isBefore(slotStartUTC, blockedEnd)
                    ) || (
                        isAfter(slotEndUTC, blockedStart) &&
                        (isBefore(slotEndUTC, blockedEnd) || slotEndUTC.getTime() === blockedEnd.getTime())
                    );
                });

                if (!isBlocked) {
                    // Check if slot conflicts with existing bookings (including buffer)
                    const hasConflict = existingBookings.some(booking => {
                        const bookingStart = addMinutes(new Date(booking.startDatetime), -bufferTime);
                        const bookingEnd = addMinutes(new Date(booking.endDatetime), bufferTime);
                        return (
                            (isAfter(slotStartUTC, bookingStart) || slotStartUTC.getTime() === bookingStart.getTime()) &&
                            isBefore(slotStartUTC, bookingEnd)
                        ) || (
                            isAfter(slotEndUTC, bookingStart) &&
                            (isBefore(slotEndUTC, bookingEnd) || slotEndUTC.getTime() === bookingEnd.getTime())
                        );
                    });

                    if (!hasConflict) {
                        return true;
                    }
                }
            }

            slotStart = addMinutes(slotStart, 30); // 30-minute intervals
        }
    }

    return false;
}

export async function getAvailableSlots(
    therapistSlug: string,
    date: string,
    sessionDuration: number,
    timezone: string = bookingConfig.defaultTimezone
): Promise<AvailableSlotsResult | null> {
    const therapist = await getTherapistBySlug(therapistSlug);
    if (!therapist) return null;

    const ds = await getDataSource();
    const availabilityRepo = ds.getRepository(TherapistAvailability);
    const blockedDateRepo = ds.getRepository(BlockedDate);
    const bookingRepo = ds.getRepository(Booking);

    const targetDate = parseISO(date);
    const dayOfWeek = getDay(targetDate);

    const now = new Date();
    const minBookingTime = addHours(now, therapist.minBookingNotice);

    // Get availability for this day of week
    const dayAvailability = await availabilityRepo.find({
        where: { therapistId: therapist.id, dayOfWeek, isActive: true },
    });

    if (dayAvailability.length === 0) {
        return {
            date,
            slots: [],
            therapist: {
                id: therapist.id,
                name: therapist.name,
                slug: therapist.slug,
            },
        };
    }

    // Get blocked dates for this date
    const blockedDates = await blockedDateRepo.find({
        where: { therapistId: therapist.id },
    });

    // Get existing bookings for around this date
    const existingBookings = await bookingRepo.find({
        where: {
            therapistId: therapist.id,
            status: "confirmed",
        },
    });

    // Filter bookings to only include those on the target date
    const dayBookings = existingBookings.filter(booking => {
        const bookingDate = format(new Date(booking.startDatetime), "yyyy-MM-dd");
        return bookingDate === date;
    });

    const slots: TimeSlot[] = [];

    for (const availability of dayAvailability) {
        const startTime = parse(availability.startTime, "HH:mm:ss", targetDate);
        const endTime = parse(availability.endTime, "HH:mm:ss", targetDate);

        let slotStart = startTime;

        while (isBefore(addMinutes(slotStart, sessionDuration), endTime) ||
               addMinutes(slotStart, sessionDuration).getTime() === endTime.getTime()) {
            const slotEnd = addMinutes(slotStart, sessionDuration);
            const slotStartUTC = fromZonedTime(slotStart, timezone);
            const slotEndUTC = fromZonedTime(slotEnd, timezone);

            let available = true;

            // Check if slot is after minimum booking time
            if (!isAfter(slotStartUTC, minBookingTime)) {
                available = false;
            }

            // Check if slot is blocked
            if (available) {
                const isBlocked = blockedDates.some(bd => {
                    const blockedStart = new Date(bd.startDatetime);
                    const blockedEnd = new Date(bd.endDatetime);

                    if (bd.isAllDay && format(blockedStart, "yyyy-MM-dd") === date) {
                        return true;
                    }

                    return (
                        (isAfter(slotStartUTC, blockedStart) || slotStartUTC.getTime() === blockedStart.getTime()) &&
                        isBefore(slotStartUTC, blockedEnd)
                    ) || (
                        isAfter(slotEndUTC, blockedStart) &&
                        (isBefore(slotEndUTC, blockedEnd) || slotEndUTC.getTime() === blockedEnd.getTime())
                    );
                });

                if (isBlocked) {
                    available = false;
                }
            }

            // Check for booking conflicts
            if (available) {
                const hasConflict = dayBookings.some(booking => {
                    const bookingStart = addMinutes(new Date(booking.startDatetime), -therapist.bufferTime);
                    const bookingEnd = addMinutes(new Date(booking.endDatetime), therapist.bufferTime);
                    return (
                        (isAfter(slotStartUTC, bookingStart) || slotStartUTC.getTime() === bookingStart.getTime()) &&
                        isBefore(slotStartUTC, bookingEnd)
                    ) || (
                        isAfter(slotEndUTC, bookingStart) &&
                        (isBefore(slotEndUTC, bookingEnd) || slotEndUTC.getTime() === bookingEnd.getTime())
                    );
                });

                if (hasConflict) {
                    available = false;
                }
            }

            slots.push({
                start: slotStartUTC,
                end: slotEndUTC,
                startFormatted: format(slotStart, "h:mm a"),
                endFormatted: format(slotEnd, "h:mm a"),
                available,
            });

            slotStart = addMinutes(slotStart, 30);
        }
    }

    // Sort by start time and filter to only show available slots
    const sortedSlots = slots
        .sort((a, b) => a.start.getTime() - b.start.getTime());

    return {
        date,
        slots: sortedSlots,
        therapist: {
            id: therapist.id,
            name: therapist.name,
            slug: therapist.slug,
        },
    };
}
