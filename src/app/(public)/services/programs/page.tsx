import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Programs",
    description: "Explore our therapeutic programs designed to help you develop lasting coping strategies and achieve your mental health goals.",
};

// Sample programs - will be replaced with Strapi data
const programs = [
    {
        slug: "anxiety-management",
        title: "Anxiety Management Program",
        description: "A comprehensive 8-week program to understand, manage, and overcome anxiety through evidence-based techniques.",
        duration: "8 weeks",
        benefits: ["Understand anxiety triggers", "Learn coping techniques", "Build resilience"],
    },
    {
        slug: "stress-relief",
        title: "Stress Relief & Mindfulness",
        description: "Learn practical mindfulness techniques and stress management strategies for everyday life.",
        duration: "6 weeks",
        benefits: ["Mindfulness practices", "Breathing techniques", "Work-life balance"],
    },
    {
        slug: "emotional-wellness",
        title: "Emotional Wellness Journey",
        description: "A holistic program focusing on emotional intelligence, self-awareness, and emotional regulation.",
        duration: "10 weeks",
        benefits: ["Emotional awareness", "Healthy expression", "Self-compassion"],
    },
];

export default function ProgramsPage() {
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
                            Therapeutic <span className="text-gradient-mixed">Programs</span>
                        </h1>
                        <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                            Structured programs designed to help you develop lasting skills and
                            achieve meaningful progress in your mental health journey.
                        </p>
                    </div>
                </div>
            </section>

            {/* Programs List */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="grid gap-8">
                        {programs.map((program) => (
                            <Link
                                key={program.slug}
                                href={`/services/programs/${program.slug}`}
                                className="card group flex flex-col md:flex-row overflow-hidden hover:border-[var(--primary-purple)] border-2 border-transparent transition-all"
                            >
                                <div className="md:w-1/3 aspect-video md:aspect-auto bg-gradient-to-br from-[var(--primary-purple)]/20 to-[var(--primary-teal)]/20 flex items-center justify-center">
                                    <span className="text-6xl">📋</span>
                                </div>
                                <div className="card-body p-8 flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="px-3 py-1 bg-[var(--primary-purple)]/10 text-[var(--primary-purple)] text-sm rounded-full font-medium">
                                            {program.duration}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-bold">{program.title}</h2>
                                    <p className="text-gray-600 mt-3">{program.description}</p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {program.benefits.map((benefit, i) => (
                                            <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                                                {benefit}
                                            </span>
                                        ))}
                                    </div>
                                    <span className="text-[var(--primary-purple)] font-medium inline-flex items-center mt-6">
                                        Learn More
                                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-12 text-center text-gray-500">
                        More programs coming soon. Contact us to learn about upcoming offerings!
                    </div>
                </div>
            </section>
        </>
    );
}
