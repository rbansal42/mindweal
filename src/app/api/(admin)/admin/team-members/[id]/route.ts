import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { AuthSession } from "@/types/auth";
import { getDataSource } from "@/lib/db";
import { TeamMember } from "@/entities/TeamMember";
import { updateTeamMemberSchema } from "@/lib/validation";

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
        const repo = ds.getRepository(TeamMember);

        const teamMember = await repo.findOne({ where: { id } });
        if (!teamMember) {
            return NextResponse.json({ error: "Team member not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, teamMember });
    } catch (error) {
        console.error("Error fetching team member:", error);
        return NextResponse.json({ error: "Failed to fetch team member" }, { status: 500 });
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
        const validated = updateTeamMemberSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json({ error: "Validation failed", details: validated.error.flatten() }, { status: 400 });
        }

        const ds = await getDataSource();
        const repo = ds.getRepository(TeamMember);

        const teamMember = await repo.findOne({ where: { id } });
        if (!teamMember) {
            return NextResponse.json({ error: "Team member not found" }, { status: 404 });
        }

        // Note: Slug is not updatable
        Object.assign(teamMember, validated.data);
        await repo.save(teamMember);

        return NextResponse.json({ success: true, teamMember });
    } catch (error) {
        console.error("Error updating team member:", error);
        return NextResponse.json({ error: "Failed to update team member" }, { status: 500 });
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
        const repo = ds.getRepository(TeamMember);

        const teamMember = await repo.findOne({ where: { id } });
        if (!teamMember) {
            return NextResponse.json({ error: "Team member not found" }, { status: 404 });
        }

        // Soft delete: set isActive to false
        teamMember.isActive = false;
        await repo.save(teamMember);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting team member:", error);
        return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 });
    }
}
