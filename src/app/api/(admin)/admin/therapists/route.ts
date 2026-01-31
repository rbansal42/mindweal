// frontend/src/app/api/admin/therapists/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/db";
import { Therapist } from "@/entities/Therapist";
import { User } from "@/entities/User";
import { Account } from "@/entities/Account";
import { SessionType } from "@/entities/SessionType";
import { TherapistAvailability } from "@/entities/TherapistAvailability";
import { Specialization } from "@/entities/Specialization";
import { createTherapistSchema } from "@/lib/validation";
import { IsNull } from "typeorm";
import bcrypt from "bcryptjs";

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== "admin" && userRole !== "reception") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const ds = await getDataSource();
        const therapistRepo = ds.getRepository(Therapist);
        const sessionTypeRepo = ds.getRepository(SessionType);
        const specRepo = ds.getRepository(Specialization);

        const therapists = await therapistRepo.find({
            where: { deletedAt: IsNull() },
            order: { name: "ASC" },
        });

        // Enrich with session types and specialization names
        const enrichedTherapists = await Promise.all(therapists.map(async (t) => {
            const sessionTypes = await sessionTypeRepo.find({
                where: { therapistId: t.id, isActive: true }
            });

            let specializations: Specialization[] = [];
            if (t.specializationIds?.length) {
                specializations = await specRepo.findByIds(t.specializationIds);
            }

            return {
                ...t,
                sessionTypes,
                specializations,
            };
        }));

        return NextResponse.json({ success: true, therapists: enrichedTherapists });
    } catch (error) {
        console.error("Error fetching therapists:", error);
        return NextResponse.json({ error: "Failed to fetch therapists" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const validated = createTherapistSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json({ error: validated.error.flatten() }, { status: 400 });
        }

        const ds = await getDataSource();
        const therapistRepo = ds.getRepository(Therapist);
        const userRepo = ds.getRepository(User);
        const accountRepo = ds.getRepository(Account);
        const sessionTypeRepo = ds.getRepository(SessionType);
        const availabilityRepo = ds.getRepository(TherapistAvailability);

        // Check email uniqueness
        const existingUser = await userRepo.findOne({ where: { email: validated.data.email } });
        if (existingUser) {
            return NextResponse.json({ error: "Email already in use" }, { status: 409 });
        }

        // Generate unique slug
        let slug = generateSlug(validated.data.name);
        const existingSlug = await therapistRepo.findOne({ where: { slug } });
        if (existingSlug) {
            slug = `${slug}-${Date.now()}`;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validated.data.temporaryPassword, 10);

        // Create user
        const user = userRepo.create({
            email: validated.data.email,
            name: validated.data.name,
            emailVerified: new Date(),
            role: "therapist",
        });
        await userRepo.save(user);

        // Create credential account for Better Auth
        const credentialAccount = accountRepo.create({
            userId: user.id,
            accountId: user.id,
            providerId: "credential",
            password: hashedPassword,
        });
        await accountRepo.save(credentialAccount);

        // Create therapist
        const therapist = therapistRepo.create({
            userId: user.id,
            slug,
            name: validated.data.name,
            title: validated.data.title,
            email: validated.data.email,
            phone: validated.data.phone,
            bio: validated.data.bio,
            photoUrl: validated.data.photoUrl,
            specializationIds: validated.data.specializationIds,
            defaultSessionDuration: validated.data.defaultSessionDuration,
            bufferTime: validated.data.bufferTime,
            advanceBookingDays: validated.data.advanceBookingDays,
            minBookingNotice: validated.data.minBookingNotice,
            isActive: false, // Draft by default
        });
        await therapistRepo.save(therapist);

        // Create session types
        for (const st of validated.data.sessionTypes) {
            const sessionType = sessionTypeRepo.create({
                therapistId: therapist.id,
                ...st,
                isActive: true,
            });
            await sessionTypeRepo.save(sessionType);
        }

        // Create availability if provided
        if (validated.data.availability?.length) {
            for (const av of validated.data.availability) {
                const availability = availabilityRepo.create({
                    therapistId: therapist.id,
                    ...av,
                    isActive: true,
                });
                await availabilityRepo.save(availability);
            }
        }

        // TODO: Send welcome email with credentials

        return NextResponse.json({
            success: true,
            therapist: { ...therapist, user: { id: user.id, email: user.email } }
        }, { status: 201 });
    } catch (error) {
        console.error("Error creating therapist:", error);
        return NextResponse.json({ error: "Failed to create therapist" }, { status: 500 });
    }
}
