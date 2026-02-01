import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Program } from "@/entities/Program";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const ds = await getDataSource();
        const repo = ds.getRepository(Program);

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
                title: program.title,
                description: program.description,
                category: program.category,
                duration: program.duration,
                coverImage: program.coverImage,
                benefits: program.benefits,
            },
        });
    } catch (error) {
        console.error("Error fetching program:", error);
        return NextResponse.json({ error: "Failed to fetch program" }, { status: 500 });
    }
}
