import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { FAQ } from "@/entities/FAQ";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category") as "therapy" | "booking" | "programs" | "general" | null;

        const ds = await getDataSource();
        const repo = ds.getRepository(FAQ);

        const whereClause: Record<string, any> = { isActive: true };
        if (category) {
            whereClause.category = category;
        }

        const faqs = await repo.find({
            where: whereClause,
            order: { category: "ASC", displayOrder: "ASC" },
        });

        return NextResponse.json({ success: true, faqs });
    } catch (error) {
        console.error("Error fetching FAQs:", error);
        return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 });
    }
}
