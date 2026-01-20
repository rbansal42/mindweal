import { Metadata } from "next";
import { getServerSession } from "@/lib/auth-middleware";
import { AppDataSource } from "@/lib/db";
import { Therapist } from "@/entities/Therapist";
import { TherapistAvailability } from "@/entities/TherapistAvailability";
import { BlockedDate } from "@/entities/BlockedDate";
import AvailabilityManager from "./AvailabilityManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Availability | Therapist Portal | Mindweal by Pihu Suri",
    description: "Manage your weekly availability and blocked dates",
};

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

async function getTherapistAvailability(userEmail: string) {
    const ds = await getDataSource();
    const therapistRepo = ds.getRepository(Therapist);
    const availabilityRepo = ds.getRepository(TherapistAvailability);
    const blockedDateRepo = ds.getRepository(BlockedDate);

    const therapist = await therapistRepo.findOne({
        where: { email: userEmail },
    });

    if (!therapist) return null;

    const availability = await availabilityRepo.find({
        where: { therapistId: therapist.id },
        order: { dayOfWeek: "ASC", startTime: "ASC" },
    });

    const blockedDates = await blockedDateRepo.find({
        where: { therapistId: therapist.id },
        order: { startDatetime: "ASC" },
    });

    return { therapist, availability, blockedDates };
}

export default async function AvailabilityPage() {
    const session = await getServerSession();
    if (!session) return null;

    const data = await getTherapistAvailability(session.user.email);

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

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
                <p className="text-gray-600 mt-1">
                    Set your weekly schedule and block specific dates
                </p>
            </div>

            <AvailabilityManager
                therapistId={data.therapist.id}
                initialAvailability={data.availability.map((a) => ({
                    id: a.id,
                    dayOfWeek: a.dayOfWeek,
                    startTime: a.startTime,
                    endTime: a.endTime,
                    isActive: a.isActive,
                }))}
                initialBlockedDates={data.blockedDates.map((b) => ({
                    id: b.id,
                    startDatetime: b.startDatetime.toISOString(),
                    endDatetime: b.endDatetime.toISOString(),
                    reason: b.reason,
                    isAllDay: b.isAllDay,
                }))}
            />
        </div>
    );
}
