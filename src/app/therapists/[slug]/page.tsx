import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { calcomConfig } from "@/config";

// Sample therapists data - will be replaced with Strapi fetch
const therapists = [
    {
        slug: "dr-pihu-suri",
        name: "Dr. Pihu Suri",
        title: "Founder & Clinical Psychologist",
        bio: `Dr. Pihu Suri is the founder of MindWeal with over a decade of experience in clinical psychology. Her approach combines evidence-based techniques with compassionate care, helping clients navigate anxiety, depression, trauma, and relationship challenges.

## Education & Training

- Ph.D. in Clinical Psychology, NIMHANS Bangalore
- M.A. Psychology, Delhi University
- Certified in Cognitive Behavioral Therapy (CBT)
- Advanced training in Trauma-Focused Therapy

## Clinical Approach

Dr. Suri believes in creating a safe, non-judgmental space where clients can explore their thoughts and feelings. Her therapeutic approach is integrative, drawing from CBT, psychodynamic therapy, and mindfulness-based techniques.

She has a special interest in working with young adults navigating career transitions and relationship difficulties.`,
        specializations: ["Anxiety", "Depression", "Trauma", "Relationship Issues", "Young Adult Therapy"],
        calcomUsername: "dr-pihu-suri",
        education: ["Ph.D. Clinical Psychology - NIMHANS", "M.A. Psychology - Delhi University"],
        languages: ["English", "Hindi"],
    },
    {
        slug: "sarah-johnson",
        name: "Sarah Johnson",
        title: "Licensed Counselor",
        bio: `Sarah Johnson is a licensed counselor specializing in workplace stress and career-related mental health. With her background in organizational psychology, she brings a unique perspective to helping professionals thrive.

## Background

Sarah spent several years in the corporate world before transitioning to mental health counseling. This experience gives her deep insight into the challenges professionals face in high-pressure work environments.

## Specializations

She works primarily with:
- Professionals experiencing burnout
- Individuals navigating career transitions
- Those seeking better work-life balance
- People dealing with workplace anxiety and imposter syndrome`,
        specializations: ["Stress Management", "Work-Life Balance", "Self-Esteem", "Career Counseling", "Burnout"],
        calcomUsername: "sarah-johnson",
        education: ["M.A. Counseling Psychology - Christ University", "B.A. Psychology - St. Xavier's College"],
        languages: ["English", "Hindi", "Kannada"],
    },
    {
        slug: "michael-chen",
        name: "Michael Chen",
        title: "Psychotherapist",
        bio: `Michael Chen is a psychotherapist who integrates mindfulness-based approaches with traditional therapy for holistic healing. His gentle, presence-focused approach helps clients develop deeper self-awareness and emotional regulation skills.

## Training & Approach

Michael trained in Mindfulness-Based Stress Reduction (MBSR) and has extensive experience in acceptance and commitment therapy (ACT). He believes that by cultivating present-moment awareness, individuals can break free from unhelpful patterns and live more fulfilling lives.

## Areas of Focus

- Life transitions and adjustments
- Anxiety and panic disorders
- Mindfulness and meditation guidance
- Emotional regulation challenges`,
        specializations: ["Mindfulness", "Anxiety", "Life Transitions", "Emotional Regulation", "Meditation"],
        calcomUsername: "michael-chen",
        education: ["M.Phil Clinical Psychology - RCI Registered", "MBSR Certification - UMass Medical School"],
        languages: ["English", "Mandarin", "Hindi"],
    },
];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const therapist = therapists.find((t) => t.slug === slug);

    if (!therapist) {
        return { title: "Therapist Not Found" };
    }

    return {
        title: `${therapist.name} - ${therapist.title}`,
        description: `Book a session with ${therapist.name}. ${therapist.specializations.slice(0, 3).join(", ")}.`,
    };
}

export async function generateStaticParams() {
    return therapists.map((therapist) => ({
        slug: therapist.slug,
    }));
}

export default async function TherapistDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const therapist = therapists.find((t) => t.slug === slug);

    if (!therapist) {
        notFound();
    }

    return (
        <>
            {/* Hero Section */}
            <section className="section bg-gradient-to-br from-white via-[#f0fdf9] to-[#f5f3ff]">
                <div className="container-custom">
                    <Link href="/therapists" className="text-[var(--primary-teal)] hover:underline mb-4 inline-block">
                        ← Back to All Therapists
                    </Link>
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-white/80 border-4 border-white shadow-lg flex items-center justify-center text-6xl md:text-8xl flex-shrink-0">
                            👤
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold">{therapist.name}</h1>
                            <p className="text-[var(--primary-teal)] text-lg font-medium mt-2">{therapist.title}</p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {therapist.specializations.map((spec, index) => (
                                    <span key={index} className="px-3 py-1 bg-white/80 text-gray-600 text-sm rounded-full">
                                        {spec}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            <div className="prose prose-gray max-w-none">
                                {therapist.bio.split('\n\n').map((paragraph, index) => {
                                    if (paragraph.startsWith('## ')) {
                                        return <h2 key={index} className="text-2xl font-bold mt-8 mb-4">{paragraph.replace('## ', '')}</h2>;
                                    }
                                    if (paragraph.startsWith('- ')) {
                                        return (
                                            <ul key={index} className="list-disc list-inside space-y-2 text-gray-600">
                                                {paragraph.split('\n').map((item, i) => (
                                                    <li key={i}>{item.replace('- ', '')}</li>
                                                ))}
                                            </ul>
                                        );
                                    }
                                    return <p key={index} className="text-gray-600 leading-relaxed">{paragraph}</p>;
                                })}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="card p-6 sticky top-24">
                                <h3 className="text-lg font-semibold mb-4">Book a Session</h3>

                                <a
                                    href={`${calcomConfig.teamUrl}/${therapist.calcomUsername}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary w-full mb-6"
                                >
                                    Schedule Appointment
                                </a>

                                <hr className="my-6" />

                                <div className="space-y-4 text-sm">
                                    <div>
                                        <p className="text-gray-500 font-medium mb-2">Education</p>
                                        <ul className="space-y-1 text-gray-600">
                                            {therapist.education.map((edu, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <span className="text-[var(--primary-teal)]">•</span>
                                                    {edu}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <p className="text-gray-500 font-medium mb-2">Languages</p>
                                        <p className="text-gray-600">{therapist.languages.join(", ")}</p>
                                    </div>
                                </div>

                                <hr className="my-6" />

                                <p className="text-xs text-gray-400 text-center">
                                    Sessions available online and in-person
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
