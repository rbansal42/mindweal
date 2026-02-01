import { NextRequest, NextResponse } from "next/server";
import { In } from "typeorm";
import { getDataSource } from "@/lib/db";
import { Therapist } from "@/entities/Therapist";
import { Specialization } from "@/entities/Specialization";

export async function GET(request: NextRequest) {
    try {
        const ds = await getDataSource();
        const therapistRepo = ds.getRepository(Therapist);
        const specRepo = ds.getRepository(Specialization);

        const therapists = await therapistRepo.find({
            where: { isActive: true },
            order: { name: "ASC" },
        });

        // Fetch specializations for all therapists
        const therapistsWithSpecs = await Promise.all(
            therapists.map(async (therapist) => {
                let specializations: Specialization[] = [];
                if (therapist.specializationIds?.length) {
                    specializations = await specRepo.find({
                        where: { id: In(therapist.specializationIds), isActive: true },
                    });
                }
                return {
                    id: therapist.id,
                    slug: therapist.slug,
                    name: therapist.name,
                    title: therapist.title,
                    bio: therapist.bio,
                    photoUrl: therapist.photoUrl,
                    specializations: specializations.map(spec => ({
                        id: spec.id,
                        name: spec.name,
                    })),
                };
            })
        );

        return NextResponse.json({
            success: true,
            therapists: therapistsWithSpecs,
        });
    } catch (error) {
        console.error("Error fetching therapists:", error);
        return NextResponse.json({ error: "Failed to fetch therapists" }, { status: 500 });
    }
}
