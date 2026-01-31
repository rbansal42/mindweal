import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { TeamMember } from "@/entities/TeamMember";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const ds = await getDataSource();
        const teamMemberRepo = ds.getRepository(TeamMember);

        const member = await teamMemberRepo.findOne({
            where: { slug, isActive: true },
        });

        if (!member) {
            return NextResponse.json(
                { success: false, error: "Team member not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: member });
    } catch (error) {
        console.error("Error fetching team member:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch team member" },
            { status: 500 }
        );
    }
}
