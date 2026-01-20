import type { Metadata } from "next";
import Link from "next/link";
import { appConfig } from "@/config";

export const metadata: Metadata = {
    title: "About Us",
    description: `Learn about ${appConfig.name} - our mission, vision, and commitment to mental wellness.`,
};

export default function AboutPage() {
    return (
        <>
            {/* Hero Section */}
            <section className="section bg-gradient-to-br from-white via-[#f0fdf9] to-[#f5f3ff]">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold">
                            About <span className="text-gradient-mixed">{appConfig.name}</span>
                        </h1>
                        <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                            {appConfig.tagline} — We are dedicated to making mental health care
                            accessible, compassionate, and effective for everyone.
                        </p>
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-bold">Our Story</h2>
                            <div className="mt-6 space-y-4 text-gray-600">
                                <p>
                                    MindWeal was founded with a simple yet powerful vision: to create a safe
                                    space where individuals can untangle their thoughts, heal their minds,
                                    and thrive in life.
                                </p>
                                <p>
                                    We understand that seeking help for mental health can feel daunting.
                                    That&apos;s why we&apos;ve built a practice centered on empathy, professionalism,
                                    and genuine care for every individual who walks through our doors.
                                </p>
                                <p>
                                    Our team of experienced therapists brings together diverse expertise
                                    and a shared commitment to helping you navigate life&apos;s challenges
                                    with resilience and hope.
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-[var(--primary-teal)]/20 to-[var(--primary-purple)]/20 flex items-center justify-center">
                                <span className="text-6xl">🧠💚</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="section section-alt">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="card">
                            <div className="card-body p-10">
                                <div className="w-14 h-14 rounded-xl bg-[var(--primary-teal)]/10 flex items-center justify-center mb-6">
                                    <svg className="w-7 h-7 text-[var(--primary-teal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                                <p className="text-gray-600">
                                    To provide accessible, compassionate, and evidence-based mental health
                                    services that empower individuals to overcome challenges and lead
                                    fulfilling lives.
                                </p>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-body p-10">
                                <div className="w-14 h-14 rounded-xl bg-[var(--primary-purple)]/10 flex items-center justify-center mb-6">
                                    <svg className="w-7 h-7 text-[var(--primary-purple)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                                <p className="text-gray-600">
                                    A world where mental wellness is prioritized, stigma is eliminated,
                                    and everyone has the support they need to thrive emotionally
                                    and psychologically.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Values */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold">Our Core Values</h2>
                        <p className="mt-4 text-gray-600">
                            The principles that guide everything we do at MindWeal.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: "💚", title: "Compassion", desc: "We approach every interaction with empathy and understanding." },
                            { icon: "🔒", title: "Confidentiality", desc: "Your privacy and trust are sacred to us." },
                            { icon: "⭐", title: "Excellence", desc: "We maintain the highest standards in our practice." },
                            { icon: "🤝", title: "Inclusivity", desc: "We welcome everyone, regardless of background." },
                        ].map((value, index) => (
                            <div key={index} className="text-center">
                                <div className="text-4xl mb-4">{value.icon}</div>
                                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                                <p className="text-gray-600 text-sm">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section bg-gradient-to-br from-[var(--primary-teal)] to-[var(--secondary-green)] text-white">
                <div className="container-custom text-center">
                    <h2 className="text-3xl font-bold">Meet Our Team</h2>
                    <p className="mt-4 text-xl opacity-90 max-w-xl mx-auto">
                        Get to know the dedicated professionals behind MindWeal.
                    </p>
                    <Link href="/team" className="btn bg-white text-[var(--primary-teal)] hover:bg-gray-100 mt-8 px-8 py-4">
                        View Our Team
                    </Link>
                </div>
            </section>
        </>
    );
}
