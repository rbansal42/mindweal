import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { CommunityProgram } from "@/entities/CommunityProgram";

export async function GET(request: NextRequest) {
    try {
        const ds = await getDataSource();
        const repo = ds.getRepository(CommunityProgram);

        const programs = await repo.find({
            where: { status: "published", isActive: true },
            order: { createdAt: "DESC" },
        });

        return NextResponse.json({
            success: true,
            programs: programs.map(p => ({
                id: p.id,
                slug: p.slug,
                name: p.name,
                description: p.description,
                schedule: p.schedule,
                coverImage: p.coverImage,
            })),
        });
    } catch (error) {
        console.error("Error fetching community programs:", error);
        return NextResponse.json({ error: "Failed to fetch community programs" }, { status: 500 });
    }
}
