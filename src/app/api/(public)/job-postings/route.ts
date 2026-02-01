import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { JobPosting } from "@/entities/JobPosting";

export async function GET(request: NextRequest) {
    try {
        const ds = await getDataSource();
        const repo = ds.getRepository(JobPosting);

        const jobPostings = await repo.find({
            where: { status: "published", isActive: true },
            order: { createdAt: "DESC" },
        });

        return NextResponse.json({
            success: true,
            jobPostings: jobPostings.map(jp => ({
                id: jp.id,
                slug: jp.slug,
                title: jp.title,
                type: jp.type,
                department: jp.department,
                location: jp.location,
            })),
        });
    } catch (error) {
        console.error("Error fetching job postings:", error);
        return NextResponse.json({ error: "Failed to fetch job postings" }, { status: 500 });
    }
}
