import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { appConfig } from "@/config";

export const metadata: Metadata = {
    title: "Our Team",
    description: `Meet the dedicated professionals behind ${appConfig.name}. Our team of experienced therapists and mental health experts.`,
};

interface TeamMember {
    id: string;
    name: string;
    slug: string;
    role: string;
    qualifications: string | null;
    bio: string;
    photoUrl: string | null;
    areasOfExpertise: string[] | null;
    quote: string | null;
    displayOrder: number;
}

async function getTeamMembers(): Promise<TeamMember[]> {
    try {
        const res = await fetch(`${appConfig.url}/api/team-members`, {
            next: { revalidate: 60 }, // Revalidate every 60 seconds
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.data || [];
    } catch {
        return [];
    }
}

export default async function TeamPage() {
    const teamMembers = await getTeamMembers();

    return (
        <>
            {/* Hero Section */}
            <section className="section bg-gradient-to-br from-white via-[#f0fdf9] to-[#f5f3ff]">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold">
                            Meet Our <span className="text-gradient-mixed">Team</span>
                        </h1>
                        <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                            Our team of dedicated professionals is committed to supporting you on your
                            journey to mental wellness. Each member brings unique expertise and a shared
                            passion for helping others thrive.
                        </p>
                    </div>
                </div>
            </section>

            {/* Team Grid */}
            <section className="section bg-white">
                <div className="container-custom">
                    {teamMembers.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-8">
                            {teamMembers.map((member) => (
                                <Link
                                    key={member.id}
                                    href={`/team/${member.slug}`}
                                    className="card group hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex flex-col sm:flex-row gap-6 p-6">
                                        {/* Photo */}
                                        <div className="flex-shrink-0">
                                            {member.photoUrl ? (
                                                <Image
                                                    src={member.photoUrl}
                                                    alt={member.name}
                                                    width={160}
                                                    height={160}
                                                    className="w-40 h-40 object-cover rounded-xl"
                                                />
                                            ) : (
                                                <div className="w-40 h-40 bg-gradient-to-br from-[var(--primary-teal)]/20 to-[var(--secondary-green)]/20 rounded-xl flex items-center justify-center">
                                                    <span className="text-5xl text-[var(--primary-teal)]">
                                                        {member.name.charAt(0)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold group-hover:text-[var(--primary-teal)] transition-colors">
                                                {member.name}
                                            </h3>
                                            <p className="text-[var(--primary-teal)] text-sm font-medium mt-1">
                                                {member.role}
                                            </p>
                                            {member.qualifications && (
                                                <p className="text-gray-500 text-sm mt-1">
                                                    {member.qualifications}
                                                </p>
                                            )}
                                            <p className="text-gray-600 mt-3 text-sm line-clamp-3">
                                                {member.bio}
                                            </p>

                                            {member.areasOfExpertise && member.areasOfExpertise.length > 0 && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {member.areasOfExpertise.slice(0, 4).map((area, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                                        >
                                                            {area}
                                                        </span>
                                                    ))}
                                                    {member.areasOfExpertise.length > 4 && (
                                                        <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                                                            +{member.areasOfExpertise.length - 4} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            <span className="inline-flex items-center mt-4 text-[var(--primary-teal)] text-sm font-medium group-hover:gap-2 transition-all">
                                                View Profile
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">
                                Team information coming soon. Check back later!
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Quote Section */}
            <section className="section bg-gradient-to-br from-[var(--primary-teal)] to-[var(--secondary-green)] text-white">
                <div className="container-custom text-center">
                    <h2 className="text-3xl font-bold">Join Our Community</h2>
                    <p className="mt-4 text-xl opacity-90 max-w-2xl mx-auto">
                        We believe in creating a supportive environment where everyone can find
                        the help they need to untangle, heal, and thrive.
                    </p>
                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        <Link href="/therapists" className="btn bg-white text-[var(--primary-teal)] hover:bg-gray-100 text-lg px-8 py-4">
                            Book a Session
                        </Link>
                        <Link href="/contact" className="btn border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-4">
                            Get in Touch
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
