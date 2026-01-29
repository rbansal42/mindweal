import { Metadata } from "next";
import { AppDataSource } from "@/lib/db";
import { Booking } from "@/entities/Booking";
import { Therapist } from "@/entities/Therapist";
import MasterCalendar from "./MasterCalendar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Master Calendar | Admin | Mindweal by Pihu Suri",
    description: "View all therapists' schedules in one place",
};

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

async function getAllBookings() {
    const ds = await getDataSource();
    const bookingRepo = ds.getRepository(Booking);
    const therapistRepo = ds.getRepository(Therapist);

    const therapists = await therapistRepo.find({
        where: { isActive: true },
        order: { name: "ASC" },
    });

    const bookings = await bookingRepo.find({
        order: { startDatetime: "ASC" },
    });

    // Map bookings with therapist info
    const bookingsWithTherapists = bookings.map((booking) => {
        const therapist = therapists.find((t) => t.id === booking.therapistId);
        return {
            id: booking.id,
            title: booking.clientName,
            start: new Date(booking.startDatetime),
            end: new Date(booking.endDatetime),
            status: booking.status,
            meetingType: booking.meetingType,
            bookingReference: booking.bookingReference,
            therapist: therapist
                ? {
                      id: therapist.id,
                      name: therapist.name,
                      slug: therapist.slug,
                  }
                : null,
        };
    });

    return {
        therapists: therapists.map((t) => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
        })),
        bookings: bookingsWithTherapists,
    };
}

export default async function CalendarPage() {
    const data = await getAllBookings();

    return (
        <div className="space-y-3">
            <div>
                <h1 className="portal-title">Master Calendar</h1>
                <p className="text-gray-600 text-sm">
                    View all therapists&apos; schedules in one place
                </p>
            </div>

            <div className="portal-card p-4">
                <MasterCalendar
                    therapists={data.therapists}
                    bookings={data.bookings}
                />
            </div>
        </div>
    );
}
