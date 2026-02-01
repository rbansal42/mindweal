import type { Metadata } from "next";
import Link from "next/link";
import { User, Package, Users, Heart, ChevronRight } from "lucide-react";
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
                                <User className="w-8 h-8 text-[var(--primary-teal)] group-hover:text-white transition-colors" strokeWidth={1.5} />
                            </div>
                            <h2 className="text-2xl font-bold mb-3">Individual Therapy</h2>
                            <p className="text-gray-600 mb-4">
                                One-on-one sessions with experienced therapists. Get personalized
                                support for anxiety, depression, trauma, relationship issues, and more.
                            </p>
                            <span className="text-[var(--primary-teal)] font-medium inline-flex items-center">
                                Book a Session
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </span>
                        </Link>

                        {/* Programs */}
                        <Link href="/services/programs" className="card group p-8 hover:border-[var(--primary-purple)] border-2 border-transparent transition-all">
                            <div className="w-16 h-16 rounded-2xl bg-[var(--primary-purple)]/10 flex items-center justify-center mb-6 group-hover:bg-[var(--primary-purple)] transition-colors">
                                <Package className="w-8 h-8 text-[var(--primary-purple)] group-hover:text-white transition-colors" strokeWidth={1.5} />
                            </div>
                            <h2 className="text-2xl font-bold mb-3">Therapeutic Programs</h2>
                            <p className="text-gray-600 mb-4">
                                Structured programs designed to help you develop lasting coping
                                strategies, build resilience, and achieve specific mental health goals.
                            </p>
                            <span className="text-[var(--primary-purple)] font-medium inline-flex items-center">
                                Explore Programs
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </span>
                        </Link>

                        {/* Workshops */}
                        <Link href="/services/workshops" className="card group p-8 hover:border-[var(--secondary-green)] border-2 border-transparent transition-all">
                            <div className="w-16 h-16 rounded-2xl bg-[var(--secondary-green)]/10 flex items-center justify-center mb-6 group-hover:bg-[var(--secondary-green)] transition-colors">
                                <Users className="w-8 h-8 text-[var(--secondary-green)] group-hover:text-white transition-colors" strokeWidth={1.5} />
                            </div>
                            <h2 className="text-2xl font-bold mb-3">Workshops</h2>
                            <p className="text-gray-600 mb-4">
                                Interactive group sessions on topics like stress management,
                                mindfulness, communication skills, and emotional intelligence.
                            </p>
                            <span className="text-[var(--secondary-green)] font-medium inline-flex items-center">
                                View Workshops
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </span>
                        </Link>

                        {/* Community */}
                        <Link href="/community" className="card group p-8 hover:border-[var(--secondary-violet)] border-2 border-transparent transition-all">
                            <div className="w-16 h-16 rounded-2xl bg-[var(--secondary-violet)]/10 flex items-center justify-center mb-6 group-hover:bg-[var(--secondary-violet)] transition-colors">
                                <Heart className="w-8 h-8 text-[var(--secondary-violet)] group-hover:text-white transition-colors" strokeWidth={1.5} />
                            </div>
                            <h2 className="text-2xl font-bold mb-3">Community Programs</h2>
                            <p className="text-gray-600 mb-4">
                                Join our supportive community through various programs designed
                                to connect, learn, and grow together in a safe environment.
                            </p>
                            <span className="text-[var(--secondary-violet)] font-medium inline-flex items-center">
                                Join Community
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </span>
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
