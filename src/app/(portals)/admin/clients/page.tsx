import { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { getServerSession } from "@/lib/auth-middleware";
import { getDataSource } from "@/lib/db";
import { User } from "@/entities/User";
import { Therapist } from "@/entities/Therapist";
import { Booking } from "@/entities/Booking";
import type { AuthSession } from "@/types/auth";
import { In } from "typeorm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Clients | Admin | Mindweal by Pihu Suri",
  description: "Manage client records and session history",
};

async function getClients(session: AuthSession) {
  const ds = await getDataSource();

  let clients: User[];

  if (session.user.role === "therapist") {
    const therapist = await ds.getRepository(Therapist).findOne({
      where: [{ userId: session.user.id }, { id: session.user.therapistId! }],
    });

    if (!therapist) {
      return [];
    }

    const bookings = await ds.getRepository(Booking).find({
      where: { therapistId: therapist.id },
      select: ["clientId"],
    });

    const clientIds = [
      ...new Set(bookings.map((b) => b.clientId).filter(Boolean)),
    ] as string[];

    if (clientIds.length === 0) {
      return [];
    }

    clients = await ds.getRepository(User).find({
      where: { id: In(clientIds), role: "client" },
      relations: ["clientProfile"],
      order: { createdAt: "DESC" },
    });
  } else {
    clients = await ds.getRepository(User).find({
      where: { role: "client" },
      relations: ["clientProfile"],
      order: { createdAt: "DESC" },
    });
  }

  // Get booking stats for each client
  const clientsWithStats = await Promise.all(
    clients.map(async (client) => {
      const bookings = await ds.getRepository(Booking).find({
        where: { clientId: client.id },
        order: { startDatetime: "DESC" },
      });

      const totalSessions = bookings.length;
      const lastSessionDate = bookings[0]?.startDatetime || null;
      const nextSession = bookings.find(
        (b) => b.status === "confirmed" && new Date(b.startDatetime) > new Date()
      );

      return {
        ...client,
        stats: {
          totalSessions,
          lastSessionDate,
          nextSessionDate: nextSession?.startDatetime || null,
        },
      };
    })
  );

  return clientsWithStats;
}

export default async function ClientsPage() {
  const session = (await getServerSession()) as AuthSession | null;

  if (!session) {
    return null;
  }

  const clients = await getClients(session);

  const stats = {
    total: clients.length,
    consentSigned: clients.filter((c) => c.clientProfile?.consentFormSigned).length,
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="portal-title">Clients</h1>
          <p className="text-gray-600 text-sm">
            Manage client records and session history
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div className="portal-card p-3">
          <div className="text-xs text-gray-600">Total Clients</div>
          <div className="text-2xl font-semibold text-primary">{stats.total}</div>
        </div>
        <div className="portal-card p-3">
          <div className="text-xs text-gray-600">Consent Signed</div>
          <div className="text-2xl font-semibold text-green-600">
            {stats.consentSigned}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="portal-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th className="text-center">Sessions</th>
                <th>Last Session</th>
                <th>Next Session</th>
                <th className="text-center">Consent</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    No clients found
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id}>
                    <td className="font-medium">{client.name}</td>
                    <td className="text-sm text-gray-600">{client.email}</td>
                    <td className="text-sm text-gray-600">
                      {client.phone || "—"}
                    </td>
                    <td className="text-center">{client.stats.totalSessions}</td>
                    <td className="text-sm">
                      {client.stats.lastSessionDate
                        ? format(new Date(client.stats.lastSessionDate), "MMM d, yyyy")
                        : "—"}
                    </td>
                    <td className="text-sm">
                      {client.stats.nextSessionDate
                        ? format(new Date(client.stats.nextSessionDate), "MMM d, yyyy")
                        : "None scheduled"}
                    </td>
                    <td className="text-center">
                      {client.clientProfile?.consentFormSigned ? (
                        <span className="portal-badge portal-badge-success">✓</span>
                      ) : (
                        <span className="portal-badge portal-badge-warning">—</span>
                      )}
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="portal-btn portal-btn-outline text-xs"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
