// frontend/src/app/api/admin/job-postings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { AuthSession } from "@/types/auth";
import { getDataSource } from "@/lib/db";
import { JobPosting } from "@/entities/JobPosting";
import { updateJobPostingSchema } from "@/lib/validation";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: request.headers }) as AuthSession | null;
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const ds = await getDataSource();
        const repo = ds.getRepository(JobPosting);

        const jobPosting = await repo.findOne({ where: { id } });
        if (!jobPosting) {
            return NextResponse.json({ error: "Job posting not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, jobPosting });
    } catch (error) {
        console.error("Error fetching job posting:", error);
        return NextResponse.json({ error: "Failed to fetch job posting" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: request.headers }) as AuthSession | null;
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const validated = updateJobPostingSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json({ error: "Validation failed", details: validated.error.flatten() }, { status: 400 });
        }

        const ds = await getDataSource();
        const repo = ds.getRepository(JobPosting);

        const jobPosting = await repo.findOne({ where: { id } });
        if (!jobPosting) {
            return NextResponse.json({ error: "Job posting not found" }, { status: 404 });
        }

        // Update fields (slug is not updatable)
        Object.assign(jobPosting, validated.data);
        await repo.save(jobPosting);

        return NextResponse.json({ success: true, jobPosting });
    } catch (error) {
        console.error("Error updating job posting:", error);
        return NextResponse.json({ error: "Failed to update job posting" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: request.headers }) as AuthSession | null;
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const ds = await getDataSource();
        const repo = ds.getRepository(JobPosting);

        const jobPosting = await repo.findOne({ where: { id } });
        if (!jobPosting) {
            return NextResponse.json({ error: "Job posting not found" }, { status: 404 });
        }

        // Soft delete - set isActive to false
        jobPosting.isActive = false;
        await repo.save(jobPosting);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting job posting:", error);
        return NextResponse.json({ error: "Failed to delete job posting" }, { status: 500 });
    }
}
