import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// Sample programs data - will be replaced with Strapi fetch
const programs = [
    {
        slug: "anxiety-management",
        title: "Anxiety Management Program",
        description: `A comprehensive 8-week program designed to help you understand, manage, and overcome anxiety through evidence-based techniques.

This program combines cognitive-behavioral therapy (CBT) techniques with mindfulness practices to provide you with a robust toolkit for managing anxiety in daily life.

## What You'll Learn

- Understanding the root causes of anxiety
- Identifying personal triggers and patterns
- Breathing and relaxation techniques
- Cognitive restructuring methods
- Building long-term resilience

## Program Structure

The 8-week program includes:
- Weekly 90-minute group sessions
- Individual check-ins
- Take-home exercises and journaling
- Access to our digital resource library`,
        duration: "8 weeks",
        benefits: ["Understand anxiety triggers", "Learn coping techniques", "Build resilience", "Join a supportive community"],
    },
    {
        slug: "stress-relief",
        title: "Stress Relief & Mindfulness",
        description: `Learn practical mindfulness techniques and stress management strategies for everyday life.

In today's fast-paced world, stress has become a constant companion. This 6-week program teaches you to recognize stress patterns and develop sustainable practices for inner calm.

## Program Highlights

- Daily mindfulness practices
- Body-based stress release techniques
- Work-life balance strategies
- Sleep hygiene improvement
- Communication skills for boundary setting`,
        duration: "6 weeks",
        benefits: ["Mindfulness practices", "Breathing techniques", "Work-life balance", "Better sleep"],
    },
    {
        slug: "emotional-wellness",
        title: "Emotional Wellness Journey",
        description: `A holistic program focusing on emotional intelligence, self-awareness, and emotional regulation.

This transformative 10-week journey helps you develop a deeper understanding of your emotional landscape and build healthier relationships with yourself and others.

## What's Included

- Emotional intelligence assessment
- Weekly group therapy sessions
- Journaling and reflection exercises
- One-on-one support sessions
- Community support network`,
        duration: "10 weeks",
        benefits: ["Emotional awareness", "Healthy expression", "Self-compassion", "Relationship skills"],
    },
];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const program = programs.find((p) => p.slug === slug);

    if (!program) {
        return { title: "Program Not Found" };
    }

    return {
        title: program.title,
        description: program.description.substring(0, 160),
    };
}

export async function generateStaticParams() {
    return programs.map((program) => ({
        slug: program.slug,
    }));
}

export default async function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const program = programs.find((p) => p.slug === slug);

    if (!program) {
        notFound();
    }

    return (
        <>
            {/* Hero Section */}
            <section className="section bg-gradient-to-br from-white via-[#f0fdf9] to-[#f5f3ff]">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <Link href="/services/programs" className="text-[var(--primary-teal)] hover:underline mb-4 inline-block">
                            ← Back to Programs
                        </Link>
                        <span className="inline-block px-3 py-1 bg-[var(--primary-purple)]/10 text-[var(--primary-purple)] text-sm rounded-full font-medium mb-4">
                            {program.duration}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold">
                            <span className="text-gradient-mixed">{program.title}</span>
                        </h1>
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
                                {program.description.split('\n\n').map((paragraph, index) => {
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
                                <h3 className="text-lg font-semibold mb-4">Program Benefits</h3>
                                <ul className="space-y-3">
                                    {program.benefits.map((benefit, index) => (
                                        <li key={index} className="flex items-center gap-3 text-gray-600">
                                            <span className="w-6 h-6 rounded-full bg-[var(--primary-teal)]/10 flex items-center justify-center text-[var(--primary-teal)]">
                                                ✓
                                            </span>
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                                <hr className="my-6" />
                                <p className="text-sm text-gray-500 mb-4">Duration: {program.duration}</p>
                                <Link href="/contact" className="btn btn-primary w-full">
                                    Enquire About This Program
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
