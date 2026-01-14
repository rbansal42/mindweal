import type { Metadata } from "next";
import { appConfig } from "@/config";

export const metadata: Metadata = {
    title: "Our Team",
    description: `Meet the dedicated professionals behind ${appConfig.name}. Our team of experienced therapists and mental health experts.`,
};

// Sample team data - will be replaced with Strapi data
const teamMembers = [
    {
        name: "Dr. Pihu Suri",
        role: "Founder & Clinical Psychologist",
        bio: "With over a decade of experience in clinical psychology, Dr. Suri founded MindWeal with a vision to make mental health care accessible and stigma-free.",
        specializations: ["Anxiety", "Depression", "Trauma"],
    },
];

export default function TeamPage() {
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
                            journey to mental wellness.
                        </p>
                    </div>
                </div>
            </section>

            {/* Team Grid */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {teamMembers.map((member, index) => (
                            <div key={index} className="card group">
                                <div className="aspect-[4/3] bg-gradient-to-br from-[var(--primary-teal)]/20 to-[var(--primary-purple)]/20 flex items-center justify-center">
                                    <div className="w-24 h-24 rounded-full bg-white/80 flex items-center justify-center text-4xl">
                                        👤
                                    </div>
                                </div>
                                <div className="card-body p-6">
                                    <h3 className="text-xl font-semibold">{member.name}</h3>
                                    <p className="text-[var(--primary-teal)] text-sm font-medium mt-1">
                                        {member.role}
                                    </p>
                                    <p className="text-gray-600 mt-3 text-sm">{member.bio}</p>
                                    {member.specializations && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {member.specializations.map((spec, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                                >
                                                    {spec}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Placeholder for more team members */}
                    <div className="mt-12 text-center">
                        <p className="text-gray-500">
                            More team members coming soon. Check back later!
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
}
