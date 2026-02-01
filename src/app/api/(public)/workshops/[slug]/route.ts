import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Workshop } from "@/entities/Workshop";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const ds = await getDataSource();
        const repo = ds.getRepository(Workshop);

        const workshop = await repo.findOne({
            where: { slug, status: "published", isActive: true },
        });

        if (!workshop) {
            return NextResponse.json({ error: "Workshop not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            workshop: {
                id: workshop.id,
                slug: workshop.slug,
                title: workshop.title,
                description: workshop.description,
                date: workshop.date,
                duration: workshop.duration,
                capacity: workshop.capacity,
                coverImage: workshop.coverImage,
            },
        });
    } catch (error) {
        console.error("Error fetching workshop:", error);
        return NextResponse.json({ error: "Failed to fetch workshop" }, { status: 500 });
    }
}
