import { Metadata } from "next";
import { getServerSession } from "@/lib/auth-middleware";
import { AppDataSource } from "@/lib/db";
import { Therapist } from "@/entities/Therapist";
import { SessionType } from "@/entities/SessionType";
import { Specialization } from "@/entities/Specialization";
import { In } from "typeorm";
import TherapistSettingsForm from "./TherapistSettingsForm";

export const metadata: Metadata = {
    title: "Settings | Therapist Portal | Mindweal by Pihu Suri",
    description: "Manage your booking preferences and session types",
};

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

async function getTherapistSettings(userEmail: string) {
    const ds = await getDataSource();
    const therapistRepo = ds.getRepository(Therapist);
    const sessionTypeRepo = ds.getRepository(SessionType);
    const specializationRepo = ds.getRepository(Specialization);

    const therapist = await therapistRepo.findOne({
        where: { email: userEmail },
    });

    if (!therapist) return null;

    const sessionTypes = await sessionTypeRepo.find({
        where: { therapistId: therapist.id },
        order: { name: "ASC" },
    });

    // Fetch specializations if therapist has any
    let specializations: Specialization[] = [];
    if (therapist.specializationIds && therapist.specializationIds.length > 0) {
        specializations = await specializationRepo.find({
            where: { id: In(therapist.specializationIds), isActive: true },
        });
    }

    return { therapist, sessionTypes, specializations };
}

export default async function SettingsPage() {
    const session = await getServerSession();
    if (!session) return null;

    const data = await getTherapistSettings(session.user.email);

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
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-1">
                    Manage your booking preferences and session types
                </p>
            </div>

            <TherapistSettingsForm
                therapist={{
                    id: data.therapist.id,
                    name: data.therapist.name,
                    title: data.therapist.title,
                    email: data.therapist.email,
                    phone: data.therapist.phone,
                    bio: data.therapist.bio,
                    photoUrl: data.therapist.photoUrl,
                    slug: data.therapist.slug,
                    defaultSessionDuration: data.therapist.defaultSessionDuration,
                    bufferTime: data.therapist.bufferTime,
                    advanceBookingDays: data.therapist.advanceBookingDays,
                    minBookingNotice: data.therapist.minBookingNotice,
                }}
                sessionTypes={data.sessionTypes.map((st) => ({
                    id: st.id,
                    name: st.name,
                    duration: st.duration,
                    meetingType: st.meetingType,
                    price: st.price,
                    description: st.description,
                    isActive: st.isActive,
                    color: st.color,
                }))}
                specializations={data.specializations.map((spec) => ({
                    id: spec.id,
                    name: spec.name,
                }))}
            />
        </div>
    );
}
