import { Metadata } from "next";
import { AppDataSource } from "@/lib/db";
import { Therapist } from "@/entities/Therapist";
import { SessionType } from "@/entities/SessionType";
import NewBookingForm from "./NewBookingForm";

export const metadata: Metadata = {
    title: "Create Booking | Admin | Mindweal by Pihu Suri",
    description: "Create a new booking for a client",
};

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

async function getTherapistsWithSessions() {
    const ds = await getDataSource();
    const therapistRepo = ds.getRepository(Therapist);
    const sessionTypeRepo = ds.getRepository(SessionType);

    const therapists = await therapistRepo.find({
        where: { isActive: true },
        order: { name: "ASC" },
    });

    const therapistsWithSessions = await Promise.all(
        therapists.map(async (therapist) => {
            const sessionTypes = await sessionTypeRepo.find({
                where: { therapistId: therapist.id, isActive: true },
            });
            return {
                id: therapist.id,
                name: therapist.name,
                slug: therapist.slug,
                sessionTypes: sessionTypes.map((st) => ({
                    id: st.id,
                    name: st.name,
                    duration: st.duration,
                    meetingType: st.meetingType,
                    price: st.price,
                })),
            };
        })
    );

    return therapistsWithSessions;
}

export default async function NewBookingPage() {
    const therapists = await getTherapistsWithSessions();

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                    Create New Booking
                </h1>
                <p className="text-gray-600 mt-1">
                    Schedule a session for a client
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
                <NewBookingForm therapists={therapists} />
            </div>
        </div>
    );
}
