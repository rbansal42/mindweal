import { Metadata } from "next";
import { getServerSession } from "@/lib/auth-middleware";
import { AppDataSource } from "@/lib/db";
import { Booking } from "@/entities/Booking";
import { Therapist } from "@/entities/Therapist";
import ScheduleCalendar from "./ScheduleCalendar";

export const metadata: Metadata = {
    title: "Schedule | Therapist Portal | Mindweal by Pihu Suri",
    description: "View and manage your schedule",
};

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

async function getTherapistSchedule(userEmail: string) {
    const ds = await getDataSource();
    const therapistRepo = ds.getRepository(Therapist);
    const bookingRepo = ds.getRepository(Booking);

    const therapist = await therapistRepo.findOne({
        where: { email: userEmail },
    });

    if (!therapist) return null;

    const bookings = await bookingRepo.find({
        where: { therapistId: therapist.id },
        order: { startDatetime: "ASC" },
    });

    return { therapist, bookings };
}

export default async function SchedulePage() {
    const session = await getServerSession();
    if (!session) return null;

    const data = await getTherapistSchedule(session.user.email);

    if (!data) {
        return (
            <div className="max-w-4xl mx-auto text-center py-12">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Therapist Profile Not Found
                </h1>
                <p className="text-gray-600">
                    Your account is not linked to a therapist profile.
                </p>
            </div>
        );
    }

    const { bookings } = data;

    const events = bookings.map((booking) => ({
        id: booking.id,
        title: booking.clientName,
        start: new Date(booking.startDatetime),
        end: new Date(booking.endDatetime),
        status: booking.status,
        meetingType: booking.meetingType,
        meetingLink: booking.meetingLink,
        bookingReference: booking.bookingReference,
    }));

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
                <p className="text-gray-600 mt-1">
                    View your appointments in calendar view
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
                <ScheduleCalendar events={events} />
            </div>
        </div>
    );
}
