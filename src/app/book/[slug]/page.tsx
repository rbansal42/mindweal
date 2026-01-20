import { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppDataSource } from "@/lib/db";
import { Therapist } from "@/entities/Therapist";
import { SessionType } from "@/entities/SessionType";
import BookingClient from "./BookingClient";

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

async function getTherapistWithSessions(slug: string) {
    const ds = await getDataSource();
    const therapistRepo = ds.getRepository(Therapist);
    const sessionTypeRepo = ds.getRepository(SessionType);

    const therapist = await therapistRepo.findOne({
        where: { slug, isActive: true },
    });

    if (!therapist) return null;

    const sessionTypes = await sessionTypeRepo.find({
        where: { therapistId: therapist.id, isActive: true },
    });

    return { therapist, sessionTypes };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const data = await getTherapistWithSessions(slug);

    if (!data) {
        return {
            title: "Therapist Not Found | Mindweal by Pihu Suri",
        };
    }

    return {
        title: `Book a Session with ${data.therapist.name} | Mindweal by Pihu Suri`,
        description: `Schedule a therapy session with ${data.therapist.name}. ${data.therapist.title}`,
    };
}

export default async function BookingPage({ params }: PageProps) {
    const { slug } = await params;
    const data = await getTherapistWithSessions(slug);

    if (!data) {
        notFound();
    }

    const { therapist, sessionTypes } = data;

    return (
        <BookingClient
            therapist={{
                id: therapist.id,
                name: therapist.name,
                slug: therapist.slug,
                title: therapist.title,
                bio: therapist.bio,
                photoUrl: therapist.photoUrl,
                defaultSessionDuration: therapist.defaultSessionDuration,
            }}
            sessionTypes={sessionTypes.map(st => ({
                id: st.id,
                name: st.name,
                duration: st.duration,
                meetingType: st.meetingType,
                price: st.price,
                description: st.description,
                color: st.color,
            }))}
        />
    );
}
