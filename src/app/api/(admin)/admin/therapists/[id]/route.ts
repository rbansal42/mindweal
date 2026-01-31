// frontend/src/app/api/admin/therapists/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { AuthSession } from "@/types/auth";
import { getDataSource } from "@/lib/db";
import { Therapist } from "@/entities/Therapist";
import { SessionType } from "@/entities/SessionType";
import { TherapistAvailability } from "@/entities/TherapistAvailability";
import { Booking } from "@/entities/Booking";
import { Specialization } from "@/entities/Specialization";
import { updateTherapistSchema } from "@/lib/validation";
import { IsNull, MoreThanOrEqual } from "typeorm";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: request.headers }) as AuthSession | null;
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "admin" && session.user.role !== "reception") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const ds = await getDataSource();
        const therapistRepo = ds.getRepository(Therapist);
        const sessionTypeRepo = ds.getRepository(SessionType);
        const availabilityRepo = ds.getRepository(TherapistAvailability);
        const bookingRepo = ds.getRepository(Booking);
        const specRepo = ds.getRepository(Specialization);

        const therapist = await therapistRepo.findOne({ where: { id, deletedAt: IsNull() } });
        if (!therapist) {
            return NextResponse.json({ error: "Therapist not found" }, { status: 404 });
        }

        const sessionTypes = await sessionTypeRepo.find({
            where: { therapistId: id },
            order: { name: "ASC" }
        });

        const availability = await availabilityRepo.find({
            where: { therapistId: id },
            order: { dayOfWeek: "ASC", startTime: "ASC" }
        });

        const upcomingBookings = await bookingRepo.find({
            where: {
                therapistId: id,
                status: "confirmed",
                startDatetime: MoreThanOrEqual(new Date())
            },
            order: { startDatetime: "ASC" },
            take: 10
        });

        const totalBookings = await bookingRepo.count({ where: { therapistId: id } });
        const completedBookings = await bookingRepo.count({ where: { therapistId: id, status: "completed" } });

        let specializations: Specialization[] = [];
        if (therapist.specializationIds?.length) {
            specializations = await specRepo.findByIds(therapist.specializationIds);
        }

        return NextResponse.json({
            success: true,
            therapist: {
                ...therapist,
                sessionTypes,
                availability,
                specializations,
                stats: {
                    totalBookings,
                    completedBookings,
                    upcomingCount: upcomingBookings.length,
                },
                upcomingBookings,
            }
        });
    } catch (error) {
        console.error("Error fetching therapist:", error);
        return NextResponse.json({ error: "Failed to fetch therapist" }, { status: 500 });
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
        const validated = updateTherapistSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json({ error: validated.error.flatten() }, { status: 400 });
        }

        const ds = await getDataSource();
        const therapistRepo = ds.getRepository(Therapist);

        const therapist = await therapistRepo.findOne({ where: { id, deletedAt: IsNull() } });
        if (!therapist) {
            return NextResponse.json({ error: "Therapist not found" }, { status: 404 });
        }

        Object.assign(therapist, validated.data);
        await therapistRepo.save(therapist);

        return NextResponse.json({ success: true, therapist });
    } catch (error) {
        console.error("Error updating therapist:", error);
        return NextResponse.json({ error: "Failed to update therapist" }, { status: 500 });
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
        const therapistRepo = ds.getRepository(Therapist);

        const therapist = await therapistRepo.findOne({ where: { id, deletedAt: IsNull() } });
        if (!therapist) {
            return NextResponse.json({ error: "Therapist not found" }, { status: 404 });
        }

        // Soft delete
        therapist.deletedAt = new Date();
        therapist.isActive = false;
        await therapistRepo.save(therapist);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting therapist:", error);
        return NextResponse.json({ error: "Failed to delete therapist" }, { status: 500 });
    }
}
