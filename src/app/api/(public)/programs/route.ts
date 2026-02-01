import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Program } from "@/entities/Program";

export async function GET(request: NextRequest) {
    try {
        const ds = await getDataSource();
        const repo = ds.getRepository(Program);

        const programs = await repo.find({
            where: { status: "published", isActive: true },
            order: { createdAt: "DESC" },
        });

        return NextResponse.json({
            success: true,
            programs: programs.map(p => ({
                id: p.id,
                slug: p.slug,
                title: p.title,
                description: p.description,
                category: p.category,
                coverImage: p.coverImage,
                duration: p.duration,
                benefits: p.benefits,
            })),
        });
    } catch (error) {
        console.error("Error fetching programs:", error);
        return NextResponse.json({ error: "Failed to fetch programs" }, { status: 500 });
    }
}
