import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-middleware";
import { getDataSource } from "@/lib/db";
import { User } from "@/entities/User";
import { ClientProfile } from "@/entities/ClientProfile";
import { Therapist } from "@/entities/Therapist";
import { Booking } from "@/entities/Booking";
import { updateClientProfileSchema } from "@/lib/validation";
import type { AuthSession } from "@/types/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Auth check
    const session = (await getServerSession()) as AuthSession | null;
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Role check
    if (!["admin", "reception", "therapist"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ds = await getDataSource();

    // 3. Get client
    const client = await ds.getRepository(User).findOne({
      where: { id, role: "client" },
      relations: ["clientProfile"],
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // 4. For therapists, verify they have bookings with this client
    if (session.user.role === "therapist") {
      const therapist = await ds.getRepository(Therapist).findOne({
        where: [{ userId: session.user.id }, { id: session.user.therapistId! }],
      });

      if (!therapist) {
        return NextResponse.json(
          { error: "Therapist profile not found" },
          { status: 404 }
        );
      }

      const hasBooking = await ds.getRepository(Booking).findOne({
        where: {
          therapistId: therapist.id,
          clientId: id,
        },
      });

      if (!hasBooking) {
        return NextResponse.json(
          { error: "You don't have access to this client" },
          { status: 403 }
        );
      }

      // Get only this therapist's sessions
      const bookings = await ds.getRepository(Booking).find({
        where: { clientId: id, therapistId: therapist.id },
        relations: ["therapist", "sessionType"],
        order: { startDatetime: "DESC" },
      });

      return NextResponse.json({
        success: true,
        data: {
          client: {
            id: client.id,
            name: client.name,
            email: client.email,
            phone: client.phone,
            timezone: client.timezone,
            createdAt: client.createdAt,
          },
          profile: client.clientProfile || {
            emergencyContactName: null,
            emergencyContactPhone: null,
            emergencyContactRelationship: null,
            consentFormSigned: false,
          },
          sessionHistory: bookings.map((b) => ({
            id: b.id,
            bookingReference: b.bookingReference,
            startDatetime: b.startDatetime,
            endDatetime: b.endDatetime,
            status: b.status,
            meetingType: b.meetingType,
            therapist: { id: b.therapist.id, name: b.therapist.name },
            sessionType: b.sessionType
              ? { id: b.sessionType.id, name: b.sessionType.name, duration: b.sessionType.duration }
              : null,
          })),
          stats: {
            totalSessions: bookings.length,
            completed: bookings.filter((b) => b.status === "completed").length,
            cancelled: bookings.filter((b) => b.status === "cancelled").length,
            noShow: bookings.filter((b) => b.status === "no_show").length,
          },
        },
      });
    }

    // 5. Admin/reception see all sessions
    const bookings = await ds.getRepository(Booking).find({
      where: { clientId: id },
      relations: ["therapist", "sessionType"],
      order: { startDatetime: "DESC" },
    });

    return NextResponse.json({
      success: true,
      data: {
        client: {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          timezone: client.timezone,
          createdAt: client.createdAt,
        },
        profile: client.clientProfile || {
          emergencyContactName: null,
          emergencyContactPhone: null,
          emergencyContactRelationship: null,
          consentFormSigned: false,
        },
        sessionHistory: bookings.map((b) => ({
          id: b.id,
          bookingReference: b.bookingReference,
          startDatetime: b.startDatetime,
          endDatetime: b.endDatetime,
          status: b.status,
          meetingType: b.meetingType,
          therapist: { id: b.therapist.id, name: b.therapist.name },
          sessionType: b.sessionType
            ? { id: b.sessionType.id, name: b.sessionType.name, duration: b.sessionType.duration }
            : null,
        })),
        stats: {
          totalSessions: bookings.length,
          completed: bookings.filter((b) => b.status === "completed").length,
          cancelled: bookings.filter((b) => b.status === "cancelled").length,
          noShow: bookings.filter((b) => b.status === "no_show").length,
        },
      },
    });
  } catch (error) {
    console.error("Get client detail error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Auth check
    const session = (await getServerSession()) as AuthSession | null;
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Role check
    if (!["admin", "reception", "therapist"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ds = await getDataSource();

    // 3. Verify client exists
    const client = await ds.getRepository(User).findOne({
      where: { id, role: "client" },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // 4. For therapists, verify access
    if (session.user.role === "therapist") {
      const therapist = await ds.getRepository(Therapist).findOne({
        where: [{ userId: session.user.id }, { id: session.user.therapistId! }],
      });

      if (!therapist) {
        return NextResponse.json(
          { error: "Therapist profile not found" },
          { status: 404 }
        );
      }

      const hasBooking = await ds.getRepository(Booking).findOne({
        where: {
          therapistId: therapist.id,
          clientId: id,
        },
      });

      if (!hasBooking) {
        return NextResponse.json(
          { error: "You don't have access to this client" },
          { status: 403 }
        );
      }
    }

    // 5. Validate input
    const body = await request.json();
    const validated = updateClientProfileSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    // 6. Get or create profile
    let profile = await ds.getRepository(ClientProfile).findOne({
      where: { userId: id },
    });

    if (!profile) {
      // Lazy initialization
      profile = ds.getRepository(ClientProfile).create({
        userId: id,
        ...validated.data,
      });
    } else {
      // Update existing
      Object.assign(profile, validated.data);
    }

    await ds.getRepository(ClientProfile).save(profile);

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          emergencyContactName: profile.emergencyContactName,
          emergencyContactPhone: profile.emergencyContactPhone,
          emergencyContactRelationship: profile.emergencyContactRelationship,
          consentFormSigned: profile.consentFormSigned,
        },
      },
    });
  } catch (error) {
    console.error("Update client profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
