import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Heart, TrendingUp, Users } from "lucide-react";
import { getDataSource } from "@/lib/db";
import { JobPosting } from "@/entities/JobPosting";

export const revalidate = 300;

export const metadata: Metadata = {
    title: "Join Us",
    description: "Explore career opportunities at MindWeal. Join our team of dedicated mental health professionals.",
};

async function getJobPostings(): Promise<JobPosting[]> {
    const ds = await getDataSource();
    const jobPostingRepo = ds.getRepository(JobPosting);
    return jobPostingRepo.find({
        where: { status: "published", isActive: true },
        order: { createdAt: "DESC" },
    });
}

function formatJobType(type: "full-time" | "part-time" | "contract"): string {
    switch (type) {
        case "full-time":
            return "Full-time";
        case "part-time":
            return "Part-time";
        case "contract":
            return "Contract";
    }
}

export default async function JoinUsPage() {
    const jobPostings = await getJobPostings();
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
                            { icon: <Heart className="w-8 h-8 text-[var(--primary-teal)]" />, title: "Meaningful Work", desc: "Make a real difference in people's mental health journeys." },
                            { icon: <TrendingUp className="w-8 h-8 text-[var(--primary-teal)]" />, title: "Growth", desc: "Continuous learning opportunities and professional development." },
                            { icon: <Users className="w-8 h-8 text-[var(--primary-teal)]" />, title: "Supportive Culture", desc: "Work with a team that practices what we preach about wellbeing." },
                        ].map((item, index) => (
                            <div key={index} className="text-center p-6">
                                <div className="flex justify-center mb-4">{item.icon}</div>
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
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-semibold">{job.title}</h3>
                                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--primary-teal)]/10 text-[var(--primary-teal)]">
                                                {formatJobType(job.type)}
                                            </span>
                                        </div>
                                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                            <span>{job.department}</span>
                                            <span>•</span>
                                            <span>{job.location}</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[var(--primary-teal)]" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">
                            No positions available at the moment. Check back soon!
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
