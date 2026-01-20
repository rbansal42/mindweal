import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// Sample workshops data - will be replaced with Strapi fetch
const workshops = [
    {
        slug: "mindfulness-basics",
        title: "Mindfulness Basics",
        description: `An introductory workshop to mindfulness meditation and its benefits for mental health.

This hands-on workshop introduces you to the foundational practices of mindfulness meditation. Whether you're completely new to meditation or looking to deepen your practice, this session provides practical tools you can use immediately.

## What You'll Experience

- Guided breathing exercises
- Body scan meditation
- Mindful movement introduction
- Tips for establishing a daily practice

## Who Is This For

This workshop is perfect for beginners who want to:
- Reduce daily stress and anxiety
- Improve focus and concentration
- Sleep better at night
- Develop emotional resilience`,
        date: "January 25, 2026",
        time: "10:00 AM - 12:00 PM",
        duration: "2 hours",
        capacity: 20,
        spotsLeft: 8,
        facilitator: "Dr. Pihu Suri",
    },
    {
        slug: "stress-at-work",
        title: "Managing Stress at Work",
        description: `Learn practical techniques to handle workplace stress and maintain work-life balance.

The modern workplace can be a significant source of stress. This workshop provides actionable strategies to manage workplace pressures while maintaining your mental health and productivity.

## Workshop Agenda

- Identifying workplace stressors
- Boundary setting techniques
- Micro-breaks and desk exercises
- Communication strategies with colleagues
- Creating a personal action plan

## Takeaways

Participants will leave with:
- A personalized stress management toolkit
- Practical exercises for the workplace
- Resources for continued learning`,
        date: "February 8, 2026",
        time: "2:00 PM - 5:00 PM",
        duration: "3 hours",
        capacity: 15,
        spotsLeft: 5,
        facilitator: "Sarah Johnson",
    },
    {
        slug: "communication-skills",
        title: "Effective Communication",
        description: `Develop better communication skills for healthier relationships and conflict resolution.

Strong communication is the foundation of healthy relationships. This workshop teaches evidence-based communication techniques that foster understanding, reduce conflict, and deepen connections.

## Topics Covered

- Active listening skills
- Non-violent communication (NVC)
- Expressing needs effectively
- Handling difficult conversations
- Building empathy and understanding

## Interactive Exercises

This is a highly interactive workshop with:
- Role-playing scenarios
- Partner exercises
- Group discussions
- Real-life case studies`,
        date: "February 22, 2026",
        time: "10:00 AM - 12:30 PM",
        duration: "2.5 hours",
        capacity: 12,
        spotsLeft: 3,
        facilitator: "Michael Chen",
    },
];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const workshop = workshops.find((w) => w.slug === slug);

    if (!workshop) {
        return { title: "Workshop Not Found" };
    }

    return {
        title: workshop.title,
        description: workshop.description.substring(0, 160),
    };
}

export async function generateStaticParams() {
    return workshops.map((workshop) => ({
        slug: workshop.slug,
    }));
}

export default async function WorkshopDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const workshop = workshops.find((w) => w.slug === slug);

    if (!workshop) {
        notFound();
    }

    return (
        <>
            {/* Hero Section */}
            <section className="section bg-gradient-to-br from-white via-[#f0fdf9] to-[#f5f3ff]">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <Link href="/services/workshops" className="text-[var(--primary-teal)] hover:underline mb-4 inline-block">
                            ← Back to Workshops
                        </Link>
                        <div className="flex flex-wrap gap-3 mb-4">
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--secondary-green)]/10 text-[var(--secondary-green)] text-sm rounded-full font-medium">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {workshop.date}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                                {workshop.duration}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold">
                            <span className="text-gradient-mixed">{workshop.title}</span>
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
                                {workshop.description.split('\n\n').map((paragraph, index) => {
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
                                <h3 className="text-lg font-semibold mb-4">Workshop Details</h3>

                                <div className="space-y-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Date & Time</p>
                                        <p className="font-medium">{workshop.date}</p>
                                        <p className="text-gray-600">{workshop.time}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500">Duration</p>
                                        <p className="font-medium">{workshop.duration}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500">Facilitator</p>
                                        <p className="font-medium">{workshop.facilitator}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500">Availability</p>
                                        <p className="font-medium text-[var(--secondary-green)]">
                                            {workshop.spotsLeft} spots left
                                        </p>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                            <div
                                                className="bg-[var(--secondary-green)] h-2 rounded-full"
                                                style={{ width: `${((workshop.capacity - workshop.spotsLeft) / workshop.capacity) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <hr className="my-6" />

                                <Link href="/contact" className="btn btn-primary w-full">
                                    Register for Workshop
                                </Link>

                                <p className="text-xs text-gray-400 text-center mt-3">
                                    Limited spots available
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
