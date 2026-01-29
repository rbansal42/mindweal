import { NextResponse } from "next/server";
import { AppDataSource } from "@/lib/db";
import { TeamMember } from "@/entities/TeamMember";

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

export async function GET() {
    try {
        const ds = await getDataSource();
        const repo = ds.getRepository(TeamMember);

        const teamMembers = await repo.find({
            where: { isActive: true },
            order: { displayOrder: "ASC", createdAt: "ASC" },
        });

        return NextResponse.json({ success: true, teamMembers });
    } catch (error) {
        console.error("Error fetching team members:", error);
        return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
    }
}
