import type { Metadata } from "next";
import Link from "next/link";
import { calcomConfig } from "@/config";

export const metadata: Metadata = {
    title: "Our Therapists",
    description: "Meet our experienced therapists and book a session that fits your schedule.",
};

// Sample therapists - will be replaced with Strapi data
const therapists = [
    {
        id: "dr-pihu-suri",
        name: "Dr. Pihu Suri",
        title: "Clinical Psychologist",
        specializations: ["Anxiety", "Depression", "Trauma", "Relationship Issues"],
        bio: "Dr. Suri is the founder of MindWeal with extensive experience in cognitive behavioral therapy and trauma-informed care.",
        calcomUsername: "dr-pihu-suri",
    },
    {
        id: "sarah-therapist",
        name: "Sarah Johnson",
        title: "Licensed Counselor",
        specializations: ["Stress Management", "Work-Life Balance", "Self-Esteem"],
        bio: "Sarah specializes in helping professionals navigate workplace challenges and build resilience.",
        calcomUsername: "sarah-johnson",
    },
    {
        id: "michael-therapist",
        name: "Michael Chen",
        title: "Psychotherapist",
        specializations: ["Mindfulness", "Anxiety", "Life Transitions"],
        bio: "Michael integrates mindfulness-based approaches with traditional therapy for holistic healing.",
        calcomUsername: "michael-chen",
    },
];

export default function TherapistsPage() {
    return (
        <>
            {/* Hero Section */}
            <section className="section bg-gradient-to-br from-white via-[#f0fdf9] to-[#f5f3ff]">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold">
                            Our <span className="text-gradient-mixed">Therapists</span>
                        </h1>
                        <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                            Our team of experienced therapists is here to support you.
                            Find the right match and book a session that fits your schedule.
                        </p>
                    </div>
                </div>
            </section>

            {/* Therapists Grid */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {therapists.map((therapist) => (
                            <div key={therapist.id} className="card group">
                                <div className="aspect-square bg-gradient-to-br from-[var(--primary-teal)]/20 to-[var(--primary-purple)]/20 flex items-center justify-center">
                                    <div className="w-32 h-32 rounded-full bg-white/80 flex items-center justify-center text-5xl">
                                        👤
                                    </div>
                                </div>
                                <div className="card-body p-6">
                                    <h3 className="text-xl font-semibold">{therapist.name}</h3>
                                    <p className="text-[var(--primary-teal)] text-sm font-medium mt-1">
                                        {therapist.title}
                                    </p>
                                    <p className="text-gray-600 mt-3 text-sm line-clamp-3">{therapist.bio}</p>

                                    <div className="mt-4">
                                        <p className="text-xs text-gray-500 mb-2">Specializations:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {therapist.specializations.slice(0, 3).map((spec, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                                >
                                                    {spec}
                                                </span>
                                            ))}
                                            {therapist.specializations.length > 3 && (
                                                <span className="px-2 py-1 text-gray-400 text-xs">
                                                    +{therapist.specializations.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-6 flex gap-3">
                                        <Link
                                            href={`/therapists/${therapist.id}`}
                                            className="btn btn-outline flex-1 py-2 text-sm"
                                        >
                                            View Profile
                                        </Link>
                                        <a
                                            href={`${calcomConfig.teamUrl}/${therapist.calcomUsername}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-primary flex-1 py-2 text-sm"
                                        >
                                            Book Session
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How Booking Works */}
            <section className="section section-alt">
                <div className="container-custom">
                    <h2 className="text-3xl font-bold text-center mb-12">How Booking Works</h2>
                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        {[
                            { step: "1", title: "Choose a Therapist", desc: "Browse our therapists and find someone who fits your needs." },
                            { step: "2", title: "Pick a Time", desc: "Select a convenient date and time from their availability." },
                            { step: "3", title: "Start Your Journey", desc: "Attend your session and begin your path to wellness." },
                        ].map((item) => (
                            <div key={item.step} className="text-center">
                                <div className="w-12 h-12 rounded-full bg-[var(--primary-teal)] text-white text-xl font-bold flex items-center justify-center mx-auto">
                                    {item.step}
                                </div>
                                <h3 className="text-lg font-semibold mt-4">{item.title}</h3>
                                <p className="text-gray-600 mt-2 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
