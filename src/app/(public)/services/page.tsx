import type { Metadata } from "next";
import Link from "next/link";
import { appConfig } from "@/config";

export const metadata: Metadata = {
    title: "Our Services",
    description: `Explore ${appConfig.name}'s mental health services including individual therapy, programs, and workshops.`,
};

export default function ServicesPage() {
    return (
        <>
            {/* Hero Section */}
            <section className="section bg-gradient-to-br from-white via-[#f0fdf9] to-[#f5f3ff]">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold">
                            Our <span className="text-gradient-mixed">Services</span>
                        </h1>
                        <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                            Comprehensive mental health support tailored to your unique needs.
                            From individual therapy to group workshops, we&apos;re here to help.
                        </p>
                    </div>
                </div>
            </section>

            {/* Services Overview */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Individual Therapy */}
                        <Link href="/therapists" className="card group p-8 hover:border-[var(--primary-teal)] border-2 border-transparent transition-all">
                            <div className="w-16 h-16 rounded-2xl bg-[var(--primary-teal)]/10 flex items-center justify-center mb-6 group-hover:bg-[var(--primary-teal)] transition-colors">
                                <svg className="w-8 h-8 text-[var(--primary-teal)] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold mb-3">Individual Therapy</h2>
                            <p className="text-gray-600 mb-4">
                                One-on-one sessions with experienced therapists. Get personalized
                                support for anxiety, depression, trauma, relationship issues, and more.
                            </p>
                            <span className="text-[var(--primary-teal)] font-medium inline-flex items-center">
                                Book a Session
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                        </Link>

                        {/* Programs */}
                        <Link href="/services/programs" className="card group p-8 hover:border-[var(--primary-purple)] border-2 border-transparent transition-all">
                            <div className="w-16 h-16 rounded-2xl bg-[var(--primary-purple)]/10 flex items-center justify-center mb-6 group-hover:bg-[var(--primary-purple)] transition-colors">
                                <svg className="w-8 h-8 text-[var(--primary-purple)] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold mb-3">Therapeutic Programs</h2>
                            <p className="text-gray-600 mb-4">
                                Structured programs designed to help you develop lasting coping
                                strategies, build resilience, and achieve specific mental health goals.
                            </p>
                            <span className="text-[var(--primary-purple)] font-medium inline-flex items-center">
                                Explore Programs
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                        </Link>

                        {/* Workshops */}
                        <Link href="/services/workshops" className="card group p-8 hover:border-[var(--secondary-green)] border-2 border-transparent transition-all">
                            <div className="w-16 h-16 rounded-2xl bg-[var(--secondary-green)]/10 flex items-center justify-center mb-6 group-hover:bg-[var(--secondary-green)] transition-colors">
                                <svg className="w-8 h-8 text-[var(--secondary-green)] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold mb-3">Workshops</h2>
                            <p className="text-gray-600 mb-4">
                                Interactive group sessions on topics like stress management,
                                mindfulness, communication skills, and emotional intelligence.
                            </p>
                            <span className="text-[var(--secondary-green)] font-medium inline-flex items-center">
                                View Workshops
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                        </Link>

                        {/* Community */}
                        <Link href="/community" className="card group p-8 hover:border-[var(--secondary-violet)] border-2 border-transparent transition-all">
                            <div className="w-16 h-16 rounded-2xl bg-[var(--secondary-violet)]/10 flex items-center justify-center mb-6 group-hover:bg-[var(--secondary-violet)] transition-colors">
                                <svg className="w-8 h-8 text-[var(--secondary-violet)] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold mb-3">Community Programs</h2>
                            <p className="text-gray-600 mb-4">
                                Join our supportive community through various programs designed
                                to connect, learn, and grow together in a safe environment.
                            </p>
                            <span className="text-[var(--secondary-violet)] font-medium inline-flex items-center">
                                Join Community
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
