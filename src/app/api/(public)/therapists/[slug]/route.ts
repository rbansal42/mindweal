import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/lib/db";
import { Therapist } from "@/entities/Therapist";
import { SessionType } from "@/entities/SessionType";

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const ds = await getDataSource();
        const therapistRepo = ds.getRepository(Therapist);
        const sessionTypeRepo = ds.getRepository(SessionType);

        const therapist = await therapistRepo.findOne({
            where: { slug, isActive: true },
        });

        if (!therapist) {
            return NextResponse.json(
                { error: "Therapist not found" },
                { status: 404 }
            );
        }

        // Fetch session types separately
        const sessionTypes = await sessionTypeRepo.find({
            where: { therapistId: therapist.id, isActive: true },
        });

        return NextResponse.json({
            therapist: {
                id: therapist.id,
                name: therapist.name,
                slug: therapist.slug,
                title: therapist.title,
                bio: therapist.bio,
                photoUrl: therapist.photoUrl,
                defaultSessionDuration: therapist.defaultSessionDuration,
                advanceBookingDays: therapist.advanceBookingDays,
                minBookingNotice: therapist.minBookingNotice,
                sessionTypes: sessionTypes.map(st => ({
                    id: st.id,
                    name: st.name,
                    duration: st.duration,
                    meetingType: st.meetingType,
                    price: st.price,
                    description: st.description,
                    color: st.color,
                })),
            },
        });
    } catch (error) {
        console.error("Error fetching therapist:", error);
        return NextResponse.json(
            { error: "Failed to fetch therapist" },
            { status: 500 }
        );
    }
}
