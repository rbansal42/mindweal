import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { 
    ChevronLeft, 
    Mail, 
    MapPin, 
    GraduationCap, 
    Briefcase, 
    Lightbulb, 
    Heart, 
    FlaskConical, 
    ClipboardList, 
    Zap, 
    Star 
} from "lucide-react";
import { appConfig } from "@/config";

interface TeamMember {
    id: string;
    name: string;
    slug: string;
    role: string;
    qualifications: string | null;
    bio: string;
    photoUrl: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
    educationalQualifications: string[] | null;
    professionalExperience: string[] | null;
    areasOfExpertise: string[] | null;
    therapeuticApproach: string | null;
    therapyModalities: string[] | null;
    servicesOffered: string[] | null;
    focusAreas: string[] | null;
    professionalValues: string[] | null;
    quote: string | null;
}

async function getTeamMember(slug: string): Promise<TeamMember | null> {
    try {
        const res = await fetch(`${appConfig.url}/api/team-members/${slug}`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.data || null;
    } catch {
        return null;
    }
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const member = await getTeamMember(slug);

    if (!member) {
        return {
            title: "Team Member Not Found",
        };
    }

    return {
        title: `${member.name} - ${member.role}`,
        description: member.bio.substring(0, 160),
    };
}

export default async function TeamMemberPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const member = await getTeamMember(slug);

    if (!member) {
        notFound();
    }

    return (
        <>
            {/* Hero Section */}
            <section className="section bg-gradient-to-br from-white via-[#f0fdf9] to-[#f5f3ff]">
                <div className="container-custom">
                    <Link
                        href="/team"
                        className="inline-flex items-center text-[var(--primary-teal)] hover:underline mb-8"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Team
                    </Link>

                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Photo */}
                        <div className="flex-shrink-0">
                            {member.photoUrl ? (
                                <Image
                                    src={member.photoUrl}
                                    alt={member.name}
                                    width={300}
                                    height={300}
                                    className="w-64 h-64 lg:w-72 lg:h-72 object-cover rounded-2xl shadow-lg"
                                />
                            ) : (
                                <div className="w-64 h-64 lg:w-72 lg:h-72 bg-gradient-to-br from-[var(--primary-teal)]/20 to-[var(--secondary-green)]/20 rounded-2xl shadow-lg flex items-center justify-center">
                                    <span className="text-8xl text-[var(--primary-teal)]">
                                        {member.name.charAt(0)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1">
                            <h1 className="text-4xl md:text-5xl font-bold">{member.name}</h1>
                            <p className="text-xl text-[var(--primary-teal)] font-medium mt-2">
                                {member.role}
                            </p>
                            {member.qualifications && (
                                <p className="text-gray-600 mt-2">{member.qualifications}</p>
                            )}

                            {member.quote && (
                                <blockquote className="mt-6 pl-4 border-l-4 border-[var(--primary-teal)] italic text-gray-600">
                                    &ldquo;{member.quote}&rdquo;
                                </blockquote>
                            )}

                            {/* Contact Info */}
                            <div className="mt-8 flex flex-wrap gap-4">
                                {member.email && (
                                    <a
                                        href={`mailto:${member.email}`}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <Mail className="w-5 h-5 text-[var(--primary-teal)]" />
                                        <span className="text-sm">{member.email}</span>
                                    </a>
                                )}
                                {member.location && (
                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                                        <MapPin className="w-5 h-5 text-[var(--primary-teal)]" />
                                        <span className="text-sm text-gray-600">{member.location}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bio Section */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="max-w-4xl">
                        <h2 className="text-2xl font-bold mb-6">About</h2>
                        <div className="prose prose-lg text-gray-600">
                            {member.bio.split('\n').map((paragraph, i) => (
                                <p key={i}>{paragraph}</p>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Details Grid */}
            <section className="section section-alt">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Educational Qualifications */}
                        {member.educationalQualifications && member.educationalQualifications.length > 0 && (
                            <div className="card p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-[var(--primary-teal)]" />
                                    Education
                                </h3>
                                <ul className="space-y-2">
                                    {member.educationalQualifications.map((qual, i) => (
                                        <li key={i} className="text-gray-600 text-sm flex items-start gap-2">
                                            <span className="text-[var(--primary-teal)] mt-1">•</span>
                                            {qual}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Professional Experience */}
                        {member.professionalExperience && member.professionalExperience.length > 0 && (
                            <div className="card p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-[var(--primary-teal)]" />
                                    Experience
                                </h3>
                                <ul className="space-y-2">
                                    {member.professionalExperience.map((exp, i) => (
                                        <li key={i} className="text-gray-600 text-sm flex items-start gap-2">
                                            <span className="text-[var(--primary-teal)] mt-1">•</span>
                                            {exp}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Areas of Expertise */}
                        {member.areasOfExpertise && member.areasOfExpertise.length > 0 && (
                            <div className="card p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Lightbulb className="w-5 h-5 text-[var(--primary-teal)]" />
                                    Areas of Expertise
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {member.areasOfExpertise.map((area, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 bg-[var(--primary-teal)]/10 text-[var(--primary-teal)] text-sm rounded-full"
                                        >
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Therapeutic Approach */}
                        {member.therapeuticApproach && (
                            <div className="card p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-[var(--primary-teal)]" />
                                    Therapeutic Approach
                                </h3>
                                <p className="text-gray-600 text-sm">{member.therapeuticApproach}</p>
                            </div>
                        )}

                        {/* Therapy Modalities */}
                        {member.therapyModalities && member.therapyModalities.length > 0 && (
                            <div className="card p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <FlaskConical className="w-5 h-5 text-[var(--primary-teal)]" />
                                    Therapy Modalities
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {member.therapyModalities.map((modality, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                                        >
                                            {modality}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Services Offered */}
                        {member.servicesOffered && member.servicesOffered.length > 0 && (
                            <div className="card p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <ClipboardList className="w-5 h-5 text-[var(--primary-teal)]" />
                                    Services Offered
                                </h3>
                                <ul className="space-y-2">
                                    {member.servicesOffered.map((service, i) => (
                                        <li key={i} className="text-gray-600 text-sm flex items-start gap-2">
                                            <span className="text-[var(--primary-teal)] mt-1">•</span>
                                            {service}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Focus Areas */}
                        {member.focusAreas && member.focusAreas.length > 0 && (
                            <div className="card p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-[var(--primary-teal)]" />
                                    Focus Areas
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {member.focusAreas.map((area, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 bg-[var(--secondary-green)]/10 text-[var(--secondary-green)] text-sm rounded-full"
                                        >
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Professional Values */}
                        {member.professionalValues && member.professionalValues.length > 0 && (
                            <div className="card p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Star className="w-5 h-5 text-[var(--primary-teal)]" />
                                    Professional Values
                                </h3>
                                <ul className="space-y-2">
                                    {member.professionalValues.map((value, i) => (
                                        <li key={i} className="text-gray-600 text-sm flex items-start gap-2">
                                            <span className="text-[var(--primary-teal)] mt-1">•</span>
                                            {value}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section bg-gradient-to-br from-[var(--primary-teal)] to-[var(--secondary-green)] text-white">
                <div className="container-custom text-center">
                    <h2 className="text-3xl font-bold">Ready to Start Your Journey?</h2>
                    <p className="mt-4 text-xl opacity-90 max-w-2xl mx-auto">
                        Take the first step towards a healthier mind. Our team is here to support you every step of the way.
                    </p>
                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        <Link href="/therapists" className="btn bg-white text-[var(--primary-teal)] hover:bg-gray-100 text-lg px-8 py-4">
                            Book a Session
                        </Link>
                        <Link href="/contact" className="btn border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-4">
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
