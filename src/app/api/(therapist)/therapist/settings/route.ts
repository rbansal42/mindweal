import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Therapist } from "@/entities/Therapist";
import { auth } from "@/lib/auth";
import { therapistSettingsSchema } from "@/lib/validation";
import type { AuthSession } from "@/types/auth";

export async function PATCH(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers }) as AuthSession | null;
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validated = therapistSettingsSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validated.error.flatten() },
                { status: 400 }
            );
        }

        const {
            therapistId,
            defaultSessionDuration,
            bufferTime,
            advanceBookingDays,
            minBookingNotice,
        } = validated.data;

        const ds = await getDataSource();
        const therapistRepo = ds.getRepository(Therapist);

        const therapist = await therapistRepo.findOne({
            where: { id: therapistId },
        });

        if (!therapist) {
            return NextResponse.json(
                { error: "Therapist not found" },
                { status: 404 }
            );
        }

        // Verify user has access
        if (therapist.email !== session.user.email && session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Update settings
        if (defaultSessionDuration) therapist.defaultSessionDuration = defaultSessionDuration;
        if (bufferTime !== undefined) therapist.bufferTime = bufferTime;
        if (advanceBookingDays) therapist.advanceBookingDays = advanceBookingDays;
        if (minBookingNotice) therapist.minBookingNotice = minBookingNotice;

        await therapistRepo.save(therapist);

        return NextResponse.json({
            success: true,
            settings: {
                defaultSessionDuration: therapist.defaultSessionDuration,
                bufferTime: therapist.bufferTime,
                advanceBookingDays: therapist.advanceBookingDays,
                minBookingNotice: therapist.minBookingNotice,
            },
        });
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json(
            { error: "Failed to update settings" },
            { status: 500 }
        );
    }
}
