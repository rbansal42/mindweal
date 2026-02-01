import { NextRequest, NextResponse } from "next/server";
import { MoreThanOrEqual } from "typeorm";
import { getDataSource } from "@/lib/db";
import { Workshop } from "@/entities/Workshop";

export async function GET(request: NextRequest) {
    try {
        const ds = await getDataSource();
        const repo = ds.getRepository(Workshop);

        const workshops = await repo.find({
            where: {
                status: "published",
                isActive: true,
                date: MoreThanOrEqual(new Date()),
            },
            order: { date: "ASC" },
        });

        return NextResponse.json({
            success: true,
            workshops: workshops.map(w => ({
                id: w.id,
                slug: w.slug,
                title: w.title,
                description: w.description,
                date: w.date,
                duration: w.duration,
                capacity: w.capacity,
                coverImage: w.coverImage,
            })),
        });
    } catch (error) {
        console.error("Error fetching workshops:", error);
        return NextResponse.json({ error: "Failed to fetch workshops" }, { status: 500 });
    }
}
