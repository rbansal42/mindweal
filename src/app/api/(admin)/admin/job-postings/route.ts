// frontend/src/app/api/admin/job-postings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AppDataSource } from "@/lib/db";
import { JobPosting } from "@/entities/JobPosting";
import { createJobPostingSchema } from "@/lib/validation";
import slugify from "slugify";

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");

        const ds = await getDataSource();
        const repo = ds.getRepository(JobPosting);

        const whereClause: Record<string, any> = {};
        if (status && (status === "draft" || status === "published")) {
            whereClause.status = status;
        }

        const jobPostings = await repo.find({
            where: whereClause,
            order: { updatedAt: "DESC" },
        });

        return NextResponse.json({ success: true, jobPostings });
    } catch (error) {
        console.error("Error fetching job postings:", error);
        return NextResponse.json({ error: "Failed to fetch job postings" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const validated = createJobPostingSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json({ error: "Validation failed", details: validated.error.flatten() }, { status: 400 });
        }

        const ds = await getDataSource();
        const repo = ds.getRepository(JobPosting);

        // Generate slug from title
        let baseSlug = slugify(validated.data.title, { lower: true, strict: true });
        let slug = baseSlug;
        let counter = 1;

        // Check for uniqueness and append number if needed
        while (await repo.findOne({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        const jobPosting = repo.create({
            ...validated.data,
            slug,
        });
        await repo.save(jobPosting);

        return NextResponse.json({ success: true, jobPosting }, { status: 201 });
    } catch (error) {
        console.error("Error creating job posting:", error);
        return NextResponse.json({ error: "Failed to create job posting" }, { status: 500 });
    }
}
