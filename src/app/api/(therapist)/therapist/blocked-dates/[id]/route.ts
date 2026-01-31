import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { BlockedDate } from "@/entities/BlockedDate";
import { Therapist } from "@/entities/Therapist";
import { auth } from "@/lib/auth";
import type { AuthSession } from "@/types/auth";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({ headers: request.headers }) as AuthSession | null;
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const ds = await getDataSource();
        const blockedDateRepo = ds.getRepository(BlockedDate);
        const therapistRepo = ds.getRepository(Therapist);

        const blockedDate = await blockedDateRepo.findOne({
            where: { id },
        });

        if (!blockedDate) {
            return NextResponse.json(
                { error: "Blocked date not found" },
                { status: 404 }
            );
        }

        // Verify user has access
        const therapist = await therapistRepo.findOne({
            where: { id: blockedDate.therapistId },
        });

        if (therapist?.email !== session.user.email && session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await blockedDateRepo.remove(blockedDate);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting blocked date:", error);
        return NextResponse.json(
            { error: "Failed to delete blocked date" },
            { status: 500 }
        );
    }
}
