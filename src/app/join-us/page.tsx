import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Join Us",
    description: "Explore career opportunities at MindWeal. Join our team of dedicated mental health professionals.",
};

// Sample job postings - will be replaced with Strapi data
const jobPostings = [
    {
        slug: "clinical-psychologist",
        title: "Clinical Psychologist",
        department: "Clinical",
        type: "Full-time",
        location: "Hybrid",
    },
    {
        slug: "counselor",
        title: "Licensed Counselor",
        department: "Clinical",
        type: "Part-time",
        location: "On-site",
    },
    {
        slug: "program-coordinator",
        title: "Program Coordinator",
        department: "Operations",
        type: "Full-time",
        location: "On-site",
    },
];

export default function JoinUsPage() {
    return (
        <>
            {/* Hero Section */}
            <section className="section bg-gradient-to-br from-white via-[#f0fdf9] to-[#f5f3ff]">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold">
                            Join Our <span className="text-gradient-mixed">Team</span>
                        </h1>
                        <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                            Be part of a team that&apos;s making a real difference in people&apos;s lives.
                            We&apos;re always looking for passionate mental health professionals.
                        </p>
                    </div>
                </div>
            </section>

            {/* Why Join Us */}
            <section className="section bg-white">
                <div className="container-custom">
                    <h2 className="text-3xl font-bold mb-12 text-center">Why Join MindWeal?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: "💚", title: "Meaningful Work", desc: "Make a real difference in people's mental health journeys." },
                            { icon: "📈", title: "Growth", desc: "Continuous learning opportunities and professional development." },
                            { icon: "🤝", title: "Supportive Culture", desc: "Work with a team that practices what we preach about wellbeing." },
                        ].map((item, index) => (
                            <div key={index} className="text-center p-6">
                                <div className="text-4xl mb-4">{item.icon}</div>
                                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Open Positions */}
            <section className="section section-alt">
                <div className="container-custom">
                    <h2 className="text-3xl font-bold mb-12 text-center">Open Positions</h2>

                    {jobPostings.length > 0 ? (
                        <div className="space-y-4 max-w-3xl mx-auto">
                            {jobPostings.map((job) => (
                                <Link
                                    key={job.slug}
                                    href={`/join-us/apply?position=${job.slug}`}
                                    className="card flex items-center justify-between p-6 hover:border-[var(--primary-teal)] border-2 border-transparent transition-all"
                                >
                                    <div>
                                        <h3 className="text-lg font-semibold">{job.title}</h3>
                                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                            <span>{job.department}</span>
                                            <span>•</span>
                                            <span>{job.type}</span>
                                            <span>•</span>
                                            <span>{job.location}</span>
                                        </div>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-[var(--primary-teal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">
                            No open positions at the moment. Check back soon!
                        </p>
                    )}

                    <div className="mt-12 text-center">
                        <p className="text-gray-600 mb-4">
                            Don&apos;t see a role that fits? Send us your resume anyway!
                        </p>
                        <Link href="/join-us/apply" className="btn btn-primary">
                            Submit Application
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
