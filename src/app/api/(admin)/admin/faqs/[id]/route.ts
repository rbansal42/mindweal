import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { AuthSession } from "@/types/auth";
import { getDataSource } from "@/lib/db";
import { FAQ } from "@/entities/FAQ";
import { updateFAQSchema } from "@/lib/validation";

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
        const repo = ds.getRepository(FAQ);

        const faq = await repo.findOne({ where: { id } });
        if (!faq) {
            return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, faq });
    } catch (error) {
        console.error("Error fetching FAQ:", error);
        return NextResponse.json({ error: "Failed to fetch FAQ" }, { status: 500 });
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
        const validated = updateFAQSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json({ error: "Validation failed", details: validated.error.flatten() }, { status: 400 });
        }

        const ds = await getDataSource();
        const repo = ds.getRepository(FAQ);

        const faq = await repo.findOne({ where: { id } });
        if (!faq) {
            return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
        }

        Object.assign(faq, validated.data);
        await repo.save(faq);

        return NextResponse.json({ success: true, faq });
    } catch (error) {
        console.error("Error updating FAQ:", error);
        return NextResponse.json({ error: "Failed to update FAQ" }, { status: 500 });
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
        const repo = ds.getRepository(FAQ);

        const faq = await repo.findOne({ where: { id } });
        if (!faq) {
            return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
        }

        // Soft delete: set isActive to false
        faq.isActive = false;
        await repo.save(faq);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting FAQ:", error);
        return NextResponse.json({ error: "Failed to delete FAQ" }, { status: 500 });
    }
}
