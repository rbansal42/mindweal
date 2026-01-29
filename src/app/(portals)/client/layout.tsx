import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-middleware";
import ClientSidebar from "./ClientSidebar";

export default async function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession();

    if (!session) {
        redirect("/auth/login?callbackUrl=/client");
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex">
                <ClientSidebar user={session.user} />
                <main className="flex-1 p-3 lg:p-4">{children}</main>
            </div>
        </div>
    );
}
