import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getServerSession } from "@/lib/auth-middleware";
import { getDataSource } from "@/lib/db";
import { User } from "@/entities/User";
import { Therapist } from "@/entities/Therapist";
import { Booking } from "@/entities/Booking";
import type { AuthSession } from "@/types/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  return {
    title: "Client Details | Admin | Mindweal by Pihu Suri",
  };
}

async function getClientData(id: string, session: AuthSession) {
  const ds = await getDataSource();

  const client = await ds.getRepository(User).findOne({
    where: { id, role: "client" },
    relations: ["clientProfile"],
  });

  if (!client) {
    return null;
  }

  // For therapists, verify access
  if (session.user.role === "therapist") {
    const therapist = await ds.getRepository(Therapist).findOne({
      where: [{ userId: session.user.id }, { id: session.user.therapistId! }],
    });

    if (!therapist) {
      return null;
    }

    const hasBooking = await ds.getRepository(Booking).findOne({
      where: {
        therapistId: therapist.id,
        clientId: id,
      },
    });

    if (!hasBooking) {
      return null;
    }

    // Get only this therapist's sessions
    const bookings = await ds.getRepository(Booking).find({
      where: { clientId: id, therapistId: therapist.id },
      relations: ["therapist", "sessionType"],
      order: { startDatetime: "DESC" },
    });

    return { client, bookings, isTherapist: true };
  }

  // Admin/reception see all sessions
  const bookings = await ds.getRepository(Booking).find({
    where: { clientId: id },
    relations: ["therapist", "sessionType"],
    order: { startDatetime: "DESC" },
  });

  return { client, bookings, isTherapist: false };
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = (await getServerSession()) as AuthSession | null;

  if (!session) {
    return null;
  }

  const data = await getClientData(id, session);

  if (!data) {
    notFound();
  }

  const { client, bookings, isTherapist } = data;

  const stats = {
    total: bookings.length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    noShow: bookings.filter((b) => b.status === "no_show").length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return "portal-badge portal-badge-success";
      case "completed":
        return "portal-badge portal-badge-success";
      case "pending":
        return "portal-badge portal-badge-warning";
      case "cancelled":
        return "portal-badge";
      case "no_show":
        return "portal-badge";
      default:
        return "portal-badge";
    }
  };

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return "📹";
      case "in_person":
        return "🏢";
      case "phone":
        return "📞";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/admin/clients"
            className="text-sm text-gray-600 hover:text-primary mb-2 inline-block"
          >
            ← Back to Clients
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="portal-title">{client.name}</h1>
            {client.clientProfile?.consentFormSigned && (
              <span className="portal-badge portal-badge-success">
                ✓ Consent Signed
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm">
            {client.email} • {client.phone || "No phone"}
          </p>
          <p className="text-gray-500 text-xs">
            Client since {format(new Date(client.createdAt), "MMMM d, yyyy")}
          </p>
        </div>
        <Link
          href={`/admin/clients/${id}/edit`}
          className="portal-btn portal-btn-primary"
        >
          Edit Profile
        </Link>
      </div>

      {/* Emergency Contact */}
      <div className="portal-card p-4">
        <h2 className="font-semibold mb-2">Emergency Contact</h2>
        {client.clientProfile?.emergencyContactName ? (
          <div className="text-sm space-y-1">
            <p>
              <span className="font-medium">
                {client.clientProfile.emergencyContactName}
              </span>
              {client.clientProfile.emergencyContactRelationship && (
                <span className="text-gray-600">
                  {" "}
                  ({client.clientProfile.emergencyContactRelationship})
                </span>
              )}
            </p>
            {client.clientProfile.emergencyContactPhone && (
              <p className="text-gray-600">
                {client.clientProfile.emergencyContactPhone}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No emergency contact on file</p>
        )}
      </div>

      {/* Session Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="portal-card p-3">
          <div className="text-xs text-gray-600">Total Sessions</div>
          <div className="text-2xl font-semibold text-primary">{stats.total}</div>
        </div>
        <div className="portal-card p-3">
          <div className="text-xs text-gray-600">Completed</div>
          <div className="text-2xl font-semibold text-green-600">
            {stats.completed}
          </div>
        </div>
        <div className="portal-card p-3">
          <div className="text-xs text-gray-600">Cancelled</div>
          <div className="text-2xl font-semibold text-gray-600">
            {stats.cancelled}
          </div>
        </div>
        <div className="portal-card p-3">
          <div className="text-xs text-gray-600">No Show</div>
          <div className="text-2xl font-semibold text-gray-600">
            {stats.noShow}
          </div>
        </div>
      </div>

      {/* Session History */}
      <div className="portal-card overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold">Session History</h2>
          {isTherapist && (
            <p className="text-xs text-gray-500 mt-1">
              Showing only your sessions with this client
            </p>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Therapist</th>
                <th>Session Type</th>
                <th className="text-center">Duration</th>
                <th className="text-center">Meeting</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No sessions recorded yet
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="text-sm">
                      {format(new Date(booking.startDatetime), "MMM d, yyyy 'at' h:mm a")}
                    </td>
                    <td>{booking.therapist.name}</td>
                    <td className="text-sm">
                      {booking.sessionType?.name || "—"}
                    </td>
                    <td className="text-center text-sm">
                      {booking.sessionType?.duration
                        ? `${booking.sessionType.duration} min`
                        : "—"}
                    </td>
                    <td className="text-center">{getMeetingTypeIcon(booking.meetingType)}</td>
                    <td>
                      <span className={getStatusBadge(booking.status)}>
                        {booking.status.replace("_", " ")}
                      </span>
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
