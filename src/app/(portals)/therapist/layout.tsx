import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-middleware";
import TherapistSidebar from "./TherapistSidebar";
import { AppDataSource } from "@/lib/db";
import { Therapist } from "@/entities/Therapist";

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

async function getTherapistProfile(userEmail: string) {
    const ds = await getDataSource();
    const therapistRepo = ds.getRepository(Therapist);
    return therapistRepo.findOne({ where: { email: userEmail } });
}

export default async function TherapistLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession();

    if (!session) {
        redirect("/auth/login?callbackUrl=/therapist");
    }

    // Check if user is a therapist
    const userRole = (session.user as any).role;
    if (userRole !== "therapist" && userRole !== "admin") {
        // Try to find therapist by email
        const therapist = await getTherapistProfile(session.user.email);
        if (!therapist) {
            redirect("/client");
        }
    }

    const therapist = await getTherapistProfile(session.user.email);

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex">
                <TherapistSidebar
                    user={session.user}
                    therapist={
                        therapist
                            ? {
                                  id: therapist.id,
                                  name: therapist.name,
                                  slug: therapist.slug,
                              }
                            : null
                    }
                />
                <main className="flex-1 p-3 lg:p-4">{children}</main>
            </div>
        </div>
    );
}
