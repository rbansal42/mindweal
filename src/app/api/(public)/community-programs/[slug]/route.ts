import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { CommunityProgram } from "@/entities/CommunityProgram";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const ds = await getDataSource();
        const repo = ds.getRepository(CommunityProgram);

        const program = await repo.findOne({
            where: { slug, status: "published", isActive: true },
        });

        if (!program) {
            return NextResponse.json({ error: "Program not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            program: {
                id: program.id,
                slug: program.slug,
                name: program.name,
                description: program.description,
                schedule: program.schedule,
                coverImage: program.coverImage,
            },
        });
    } catch (error) {
        console.error("Error fetching community program:", error);
        return NextResponse.json({ error: "Failed to fetch community program" }, { status: 500 });
    }
}
