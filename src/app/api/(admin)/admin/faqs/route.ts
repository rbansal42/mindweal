import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { AuthSession } from "@/types/auth";
import { getDataSource } from "@/lib/db";
import { FAQ } from "@/entities/FAQ";
import { createFAQSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers }) as AuthSession | null;
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category") as "therapy" | "booking" | "programs" | "general" | null;
        const activeOnly = searchParams.get("activeOnly") === "true";

        const ds = await getDataSource();
        const repo = ds.getRepository(FAQ);

        const whereClause: Record<string, any> = {};
        if (category) {
            whereClause.category = category;
        }
        if (activeOnly) {
            whereClause.isActive = true;
        }

        const faqs = await repo.find({
            where: whereClause,
            order: { category: "ASC", displayOrder: "ASC", createdAt: "DESC" },
        });

        return NextResponse.json({ success: true, faqs });
    } catch (error) {
        console.error("Error fetching FAQs:", error);
        return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers }) as AuthSession | null;
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const validated = createFAQSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json({ error: "Validation failed", details: validated.error.flatten() }, { status: 400 });
        }

        const ds = await getDataSource();
        const repo = ds.getRepository(FAQ);

        const faq = repo.create(validated.data);
        await repo.save(faq);

        return NextResponse.json({ success: true, faq }, { status: 201 });
    } catch (error) {
        console.error("Error creating FAQ:", error);
        return NextResponse.json({ error: "Failed to create FAQ" }, { status: 500 });
    }
}
