import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Workshops",
    description: "Join our interactive workshops on stress management, mindfulness, communication skills, and more.",
};

// Sample workshops - will be replaced with Strapi data
const workshops = [
    {
        slug: "mindfulness-basics",
        title: "Mindfulness Basics",
        description: "An introductory workshop to mindfulness meditation and its benefits for mental health.",
        date: "January 25, 2026",
        duration: "2 hours",
        capacity: 20,
    },
    {
        slug: "stress-at-work",
        title: "Managing Stress at Work",
        description: "Learn practical techniques to handle workplace stress and maintain work-life balance.",
        date: "February 8, 2026",
        duration: "3 hours",
        capacity: 15,
    },
    {
        slug: "communication-skills",
        title: "Effective Communication",
        description: "Develop better communication skills for healthier relationships and conflict resolution.",
        date: "February 22, 2026",
        duration: "2.5 hours",
        capacity: 12,
    },
];

export default function WorkshopsPage() {
    return (
        <>
            {/* Hero Section */}
            <section className="section bg-gradient-to-br from-white via-[#f0fdf9] to-[#f5f3ff]">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <Link href="/services" className="text-[var(--primary-teal)] hover:underline mb-4 inline-block">
                            ← Back to Services
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-bold">
                            <span className="text-gradient-mixed">Workshops</span>
                        </h1>
                        <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                            Interactive group sessions designed to teach practical skills
                            and foster a sense of community.
                        </p>
                    </div>
                </div>
            </section>

            {/* Workshops List */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {workshops.map((workshop) => (
                            <Link
                                key={workshop.slug}
                                href={`/services/workshops/${workshop.slug}`}
                                className="card group hover:border-[var(--secondary-green)] border-2 border-transparent transition-all"
                            >
                                <div className="aspect-video bg-gradient-to-br from-[var(--secondary-green)]/20 to-[var(--primary-teal)]/20 flex items-center justify-center">
                                    <span className="text-5xl">🎯</span>
                                </div>
                                <div className="card-body p-6">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {workshop.date}
                                    </div>
                                    <h3 className="text-xl font-semibold">{workshop.title}</h3>
                                    <p className="text-gray-600 mt-2 text-sm">{workshop.description}</p>
                                    <div className="mt-4 flex items-center justify-between text-sm">
                                        <span className="text-gray-500">{workshop.duration}</span>
                                        <span className="text-[var(--secondary-green)] font-medium">
                                            {workshop.capacity} spots
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-12 text-center text-gray-500">
                        New workshops are added regularly. Follow us for updates!
                    </div>
                </div>
            </section>
        </>
    );
}
