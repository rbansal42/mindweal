import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// Sample community programs data - will be replaced with Strapi fetch
const communityPrograms = [
    {
        slug: "support-circles",
        name: "Support Circles",
        description: `Weekly group sessions where individuals share experiences and support each other in a safe, facilitated environment.

## About Support Circles

Support Circles are small, intimate group sessions designed to create a safe space for individuals to share their experiences, challenges, and victories. Led by trained facilitators, these sessions foster connection, reduce isolation, and build a sense of community.

## What Happens in a Session

Each session typically includes:
- Check-in round
- Open sharing time
- Facilitated discussion on a theme
- Mindfulness or grounding exercise
- Closing reflection

## Who Can Join

Support Circles are open to anyone who:
- Is seeking connection with others on similar journeys
- Wants a supportive, non-judgmental environment
- Is committed to maintaining group confidentiality
- Is currently stable and not in acute crisis

## Guidelines

- Confidentiality is paramount
- No advice-giving unless requested
- Active listening and respect for all
- Regular attendance encouraged`,
        schedule: "Every Saturday, 10:00 AM - 11:30 AM",
        facilitator: "Dr. Pihu Suri",
        groupSize: "6-10 participants",
        location: "Online (Zoom)",
    },
    {
        slug: "mindful-mornings",
        name: "Mindful Mornings",
        description: `Start your day with guided meditation and mindfulness exercises in a group setting.

## About Mindful Mornings

Mindful Mornings is a community program designed to help you establish a consistent morning mindfulness practice. By starting your day with intention and awareness, you set a positive tone for everything that follows.

## What to Expect

Each session includes:
- Short centering exercise
- 15-20 minute guided meditation
- Brief reflection or journaling prompt
- Optional sharing

## Benefits

Regular participants report:
- Improved focus throughout the day
- Reduced morning anxiety
- Better emotional regulation
- Increased sense of calm and groundedness

## Practical Details

- No prior meditation experience needed
- Join from home, no travel required
- Sessions are drop-in; attend when you can`,
        schedule: "Mon, Wed, Fri - 7:00 AM - 7:30 AM",
        facilitator: "Michael Chen",
        groupSize: "Open (drop-in)",
        location: "Online (Zoom)",
    },
    {
        slug: "youth-connect",
        name: "Youth Connect",
        description: `A safe space for young adults (18-25) to discuss challenges, build connections, and develop coping skills.

## About Youth Connect

Youth Connect is specifically designed for young adults navigating the unique challenges of this life stage—career decisions, relationship dynamics, identity formation, and more. This is a peer-support group facilitated by a trained professional.

## Discussion Topics

Sessions often explore themes like:
- Academic and career pressures
- Social media and mental health
- Relationship and boundary setting
- Identity and self-discovery
- Managing anxiety and stress

## Community Guidelines

- Respect diverse perspectives
- Maintain confidentiality
- Active participation encouraged
- Phones on silent during sessions

## Who It's For

This program is for young adults aged 18-25 who want to:
- Connect with peers facing similar challenges
- Develop healthy coping strategies
- Build a supportive network
- Explore personal growth in a safe environment`,
        schedule: "Every alternate Sunday, 4:00 PM - 5:30 PM",
        facilitator: "Sarah Johnson",
        groupSize: "8-12 participants",
        location: "Hybrid (Online + In-person)",
    },
];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const program = communityPrograms.find((p) => p.slug === slug);

    if (!program) {
        return { title: "Program Not Found" };
    }

    return {
        title: program.name,
        description: program.description.substring(0, 160),
    };
}

export async function generateStaticParams() {
    return communityPrograms.map((program) => ({
        slug: program.slug,
    }));
}

export default async function CommunityProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const program = communityPrograms.find((p) => p.slug === slug);

    if (!program) {
        notFound();
    }

    return (
        <>
            {/* Hero Section */}
            <section className="section bg-gradient-to-br from-white via-[#f0fdf9] to-[#f5f3ff]">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <Link href="/community" className="text-[var(--primary-teal)] hover:underline mb-4 inline-block">
                            ← Back to Community Programs
                        </Link>
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--secondary-violet)]/10 text-[var(--secondary-violet)] text-sm rounded-full font-medium mb-4">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Community Program
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold">
                            <span className="text-gradient-mixed">{program.name}</span>
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
                                <h3 className="text-lg font-semibold mb-4">Program Details</h3>

                                <div className="space-y-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Schedule</p>
                                        <p className="font-medium">{program.schedule}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500">Facilitator</p>
                                        <p className="font-medium">{program.facilitator}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500">Group Size</p>
                                        <p className="font-medium">{program.groupSize}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500">Location</p>
                                        <p className="font-medium">{program.location}</p>
                                    </div>
                                </div>

                                <hr className="my-6" />

                                <Link href="/contact" className="btn btn-primary w-full">
                                    Join This Program
                                </Link>

                                <p className="text-xs text-gray-400 text-center mt-3">
                                    Contact us to register or learn more
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
