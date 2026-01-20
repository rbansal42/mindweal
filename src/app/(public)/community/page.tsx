import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Community",
    description: "Join our supportive community through various programs designed to connect, learn, and grow together.",
};

// Sample community programs - will be replaced with Strapi data
const communityPrograms = [
    {
        slug: "support-circles",
        name: "Support Circles",
        description: "Weekly group sessions where individuals share experiences and support each other in a safe, facilitated environment.",
        schedule: "Every Saturday, 10 AM",
    },
    {
        slug: "mindful-mornings",
        name: "Mindful Mornings",
        description: "Start your day with guided meditation and mindfulness exercises in a group setting.",
        schedule: "Mon, Wed, Fri - 7 AM",
    },
    {
        slug: "youth-connect",
        name: "Youth Connect",
        description: "A safe space for young adults (18-25) to discuss challenges, build connections, and develop coping skills.",
        schedule: "Every alternate Sunday",
    },
];

export default function CommunityPage() {
    return (
        <>
            {/* Hero Section */}
            <section className="section bg-gradient-to-br from-white via-[#f0fdf9] to-[#f5f3ff]">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold">
                            Join Our <span className="text-gradient-mixed">Community</span>
                        </h1>
                        <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                            Connect with others on similar journeys. Our community programs offer
                            support, understanding, and a sense of belonging.
                        </p>
                    </div>
                </div>
            </section>

            {/* Programs */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {communityPrograms.map((program) => (
                            <Link
                                key={program.slug}
                                href={`/community/${program.slug}`}
                                className="card group hover:border-[var(--secondary-violet)] border-2 border-transparent transition-all"
                            >
                                <div className="aspect-video bg-gradient-to-br from-[var(--secondary-violet)]/20 to-[var(--primary-teal)]/20 flex items-center justify-center">
                                    <span className="text-5xl">🤝</span>
                                </div>
                                <div className="card-body p-6">
                                    <h3 className="text-xl font-semibold">{program.name}</h3>
                                    <p className="text-gray-600 mt-2 text-sm">{program.description}</p>
                                    <div className="mt-4 flex items-center gap-2 text-sm text-[var(--secondary-violet)]">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {program.schedule}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section section-alt">
                <div className="container-custom text-center">
                    <h2 className="text-3xl font-bold">Want to Start a New Program?</h2>
                    <p className="mt-4 text-gray-600 max-w-xl mx-auto">
                        Have an idea for a community program? We&apos;re always looking to expand
                        our offerings. Get in touch with us!
                    </p>
                    <Link href="/contact" className="btn btn-primary mt-8 px-8 py-4">
                        Contact Us
                    </Link>
                </div>
            </section>
        </>
    );
}
