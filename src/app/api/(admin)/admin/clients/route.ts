import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-middleware";
import { getDataSource } from "@/lib/db";
import { User } from "@/entities/User";
import { ClientProfile } from "@/entities/ClientProfile";
import { Therapist } from "@/entities/Therapist";
import { Booking } from "@/entities/Booking";
import type { AuthSession } from "@/types/auth";
import { In } from "typeorm";

export async function GET(request: NextRequest) {
  try {
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

    // 3. Get clients based on role
    let clients: User[];

    if (session.user.role === "therapist") {
      // Find therapist record
      const therapist = await ds.getRepository(Therapist).findOne({
        where: [{ userId: session.user.id }, { id: session.user.therapistId! }],
      });

      if (!therapist) {
        return NextResponse.json(
          { error: "Therapist profile not found" },
          { status: 404 }
        );
      }

      // Get distinct client IDs from bookings
      const bookings = await ds.getRepository(Booking).find({
        where: { therapistId: therapist.id },
        select: ["clientId"],
      });

      const clientIds = [
        ...new Set(bookings.map((b) => b.clientId).filter(Boolean)),
      ] as string[];

      if (clientIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: { clients: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } },
        });
      }

      // Fetch clients with profiles
      clients = await ds.getRepository(User).find({
        where: { id: In(clientIds), role: "client" },
        relations: ["clientProfile"],
        order: { createdAt: "DESC" },
      });
    } else {
      // Admin and reception see all clients
      clients = await ds.getRepository(User).find({
        where: { role: "client" },
        relations: ["clientProfile"],
        order: { createdAt: "DESC" },
      });
    }

    // 4. Get booking stats for each client
    const clientsWithStats = await Promise.all(
      clients.map(async (client) => {
        const bookings = await ds.getRepository(Booking).find({
          where: { clientId: client.id },
          relations: ["therapist"],
          order: { startDatetime: "DESC" },
        });

        const totalSessions = bookings.length;
        const lastSessionDate = bookings[0]?.startDatetime || null;
        const nextSession = bookings.find(
          (b) => b.status === "confirmed" && new Date(b.startDatetime) > new Date()
        );

        // Calculate primary therapist (most bookings with)
        const therapistCounts = new Map<string, number>();
        bookings.forEach((b) => {
          const count = therapistCounts.get(b.therapistId) || 0;
          therapistCounts.set(b.therapistId, count + 1);
        });

        let primaryTherapist = null;
        if (therapistCounts.size > 0) {
          const [therapistId] = Array.from(therapistCounts.entries()).sort(
            (a, b) => b[1] - a[1]
          )[0];
          const therapist = await ds.getRepository(Therapist).findOne({
            where: { id: therapistId },
            select: ["id", "name"],
          });
          primaryTherapist = therapist ? { id: therapist.id, name: therapist.name } : null;
        }

        return {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          createdAt: client.createdAt,
          profile: {
            emergencyContactName: client.clientProfile?.emergencyContactName || null,
            emergencyContactPhone: client.clientProfile?.emergencyContactPhone || null,
            emergencyContactRelationship:
              client.clientProfile?.emergencyContactRelationship || null,
            consentFormSigned: client.clientProfile?.consentFormSigned || false,
          },
          stats: {
            totalSessions,
            lastSessionDate,
            nextSessionDate: nextSession?.startDatetime || null,
            primaryTherapist,
          },
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        clients: clientsWithStats,
        pagination: {
          total: clientsWithStats.length,
          page: 1,
          limit: 50,
          pages: Math.ceil(clientsWithStats.length / 50),
        },
      },
    });
  } catch (error) {
    console.error("Get clients error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
