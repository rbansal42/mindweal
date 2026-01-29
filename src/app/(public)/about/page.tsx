import type { Metadata } from "next";
import Link from "next/link";
import { Zap, Eye, Heart, Lock, Star, Users } from "lucide-react";
import { appConfig } from "@/config";
import { Placeholder } from "@/components/Placeholder";

export const metadata: Metadata = {
    title: "About Us",
    description: `Learn about ${appConfig.name} by Pihu Suri - our mission, vision, and commitment to mental wellness.`,
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
                        <p className="text-lg text-gray-500 font-medium mt-2">{appConfig.founder}</p>
                        <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                            {appConfig.tagline} — A safe space for healing, growth, and transformation.
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
                                    MindWeal by Pihu Suri began with a simple belief: everyone deserves access 
                                    to compassionate, professional mental health support. What started as a 
                                    personal mission to break the stigma around mental health has grown into 
                                    a thriving practice dedicated to helping individuals untangle their thoughts, 
                                    heal from their struggles, and thrive in life.
                                </p>
                                <p>
                                    Founded by Pihu Suri, a passionate clinical psychologist, MindWeal has 
                                    impacted over 1,400 lives through individual therapy, trained over 1,000 
                                    professionals in Psychological First Aid, guided 300+ individuals in career 
                                    decisions, and mentored 10+ aspiring psychologists who are now practicing 
                                    professionals.
                                </p>
                                <p>
                                    We understand that seeking help for mental health can feel daunting. 
                                    That&apos;s why we&apos;ve built a practice centered on empathy, professionalism, 
                                    and genuine care for every individual who walks through our doors or 
                                    connects with us online.
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-[var(--primary-teal)]/20 to-[var(--secondary-green)]/20 flex items-center justify-center">
                                <div className="text-center">
                                    <Placeholder text="MindWeal" className="rounded-2xl" />
                                    <p className="mt-4 text-gray-600 font-medium">Untangle | Heal | Thrive</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Name MindWeal */}
            <section className="section section-alt">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-6">The Name &ldquo;MindWeal&rdquo;</h2>
                        <div className="text-gray-600 space-y-4">
                            <p className="text-lg">
                                The word <strong>&ldquo;Weal&rdquo;</strong> means <em>well-being, prosperity, and happiness</em>.
                            </p>
                            <p>
                                MindWeal represents our commitment to nurturing the well-being of the mind. 
                                We believe that mental wellness is the foundation of a fulfilling life, and 
                                our name reflects our dedication to helping you achieve that state of inner 
                                peace, balance, and prosperity.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="card">
                            <div className="card-body p-10">
                                <div className="w-14 h-14 rounded-xl bg-[var(--primary-teal)]/10 flex items-center justify-center mb-6">
                                    <Zap className="w-7 h-7 text-[var(--primary-teal)]" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                                <p className="text-gray-600">
                                    To provide accessible, compassionate, and evidence-based mental health 
                                    services that empower individuals to understand themselves better, 
                                    overcome their challenges, and build resilience for a fulfilling life. 
                                    We are committed to breaking the stigma around mental health and creating 
                                    a supportive community where healing is possible.
                                </p>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-body p-10">
                                <div className="w-14 h-14 rounded-xl bg-[var(--secondary-green)]/10 flex items-center justify-center mb-6">
                                    <Eye className="w-7 h-7 text-[var(--secondary-green)]" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                                <p className="text-gray-600">
                                    A world where mental wellness is prioritized, stigma is eliminated, 
                                    and everyone has access to the support they need to thrive emotionally 
                                    and psychologically. We envision communities that embrace mental health 
                                    as an integral part of overall well-being.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Values */}
            <section className="section section-alt">
                <div className="container-custom">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold">Our Core Values</h2>
                        <p className="mt-4 text-gray-600">
                            The principles that guide everything we do at MindWeal.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { 
                                icon: <Heart className="w-8 h-8 text-[var(--primary-teal)]" />, 
                                title: "Compassion", 
                                desc: "We approach every interaction with empathy, warmth, and genuine care for your well-being." 
                            },
                            { 
                                icon: <Lock className="w-8 h-8 text-[var(--primary-teal)]" />, 
                                title: "Confidentiality", 
                                desc: "Your privacy is sacred. Everything shared in our space stays protected and secure." 
                            },
                            { 
                                icon: <Star className="w-8 h-8 text-[var(--primary-teal)]" />, 
                                title: "Excellence", 
                                desc: "We maintain the highest professional standards, using evidence-based practices in our work." 
                            },
                            { 
                                icon: <Users className="w-8 h-8 text-[var(--primary-teal)]" />, 
                                title: "Inclusivity", 
                                desc: "We welcome everyone, regardless of background, identity, or circumstances." 
                            },
                        ].map((value, index) => (
                            <div key={index} className="text-center">
                                <div className="mb-4">{value.icon}</div>
                                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                                <p className="text-gray-600 text-sm">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Founder Message */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gradient-to-br from-[var(--primary-teal)]/5 to-[var(--secondary-green)]/5 rounded-2xl p-8 md:p-12">
                            <h2 className="text-3xl font-bold mb-6">A Message from the Founder</h2>
                            <div className="space-y-4 text-gray-600">
                                <p>
                                    Mental health is not a destination but a journey — one that requires 
                                    patience, support, and the right guidance. I founded MindWeal with the 
                                    belief that every person deserves access to quality mental health care, 
                                    delivered with compassion and without judgment.
                                </p>
                                <p>
                                    Over the years, I&apos;ve had the privilege of walking alongside hundreds 
                                    of individuals through their darkest moments and watching them emerge 
                                    stronger, more resilient, and more connected to themselves. This work 
                                    is deeply personal to me, and I&apos;m committed to making mental health 
                                    support accessible to as many people as possible.
                                </p>
                                <p>
                                    Whether you&apos;re seeking therapy, looking to train as a mental health 
                                    professional, or simply want to learn more about psychological well-being, 
                                    you&apos;ve come to the right place. Welcome to MindWeal.
                                </p>
                            </div>
                            <div className="mt-8 flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary-teal)] to-[var(--secondary-green)] flex items-center justify-center text-white text-2xl font-bold">
                                    P
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Pihu Suri</p>
                                    <p className="text-sm text-gray-500">Founder, MindWeal</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Impact Stats */}
            <section className="py-16 bg-gradient-to-r from-[var(--primary-teal)] to-[var(--secondary-green)] text-white">
                <div className="container-custom">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: "1,400+", label: "Lives Impacted" },
                            { value: "1,000+", label: "PFA Trainees" },
                            { value: "300+", label: "Career Guidance" },
                            { value: "10+", label: "Mentees Practicing" },
                        ].map((stat, index) => (
                            <div key={index}>
                                <div className="text-4xl md:text-5xl font-bold">{stat.value}</div>
                                <p className="mt-2 opacity-90">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section bg-white">
                <div className="container-custom text-center">
                    <h2 className="text-3xl font-bold">Meet Our Team</h2>
                    <p className="mt-4 text-xl text-gray-600 max-w-xl mx-auto">
                        Get to know the dedicated professionals behind MindWeal who are committed 
                        to supporting your mental wellness journey.
                    </p>
                    <Link href="/team" className="btn btn-primary mt-8 px-8 py-4">
                        View Our Team
                    </Link>
                </div>
            </section>
        </>
    );
}
