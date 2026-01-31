import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Therapist } from "@/entities/Therapist";
import { SessionType } from "@/entities/SessionType";

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

        const sessionTypes = await sessionTypeRepo.find({
            where: { therapistId: therapist.id, isActive: true },
            order: { name: "ASC" },
        });

        return NextResponse.json({
            sessionTypes: sessionTypes.map(st => ({
                id: st.id,
                name: st.name,
                duration: st.duration,
                meetingType: st.meetingType,
                price: st.price,
                description: st.description,
                color: st.color,
            })),
        });
    } catch (error) {
        console.error("Error fetching session types:", error);
        return NextResponse.json(
            { error: "Failed to fetch session types" },
            { status: 500 }
        );
    }
}
