import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Users } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";
import { appConfig } from "@/config";

type CommunityProgram = {
    id: string;
    slug: string;
    name: string;
    description: string;
    schedule: string;
    coverImage: string | null;
};

async function getCommunityProgram(slug: string): Promise<CommunityProgram | null> {
    const res = await fetch(`${appConfig.url}/api/community-programs/${slug}`, {
        next: { revalidate: 300 },
    });

    if (!res.ok) {
        return null;
    }

    const data = await res.json();
    return data.program || null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const program = await getCommunityProgram(slug);

    if (!program) {
        return { title: "Program Not Found" };
    }

    // Strip HTML tags for description
    const plainDescription = program.description.replace(/<[^>]*>/g, "").substring(0, 160);

    return {
        title: program.name,
        description: plainDescription,
    };
}

export default async function CommunityProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const program = await getCommunityProgram(slug);

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
                            <Users className="w-4 h-4" />
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
                            {program.coverImage && (
                                <div className="mb-8 rounded-lg overflow-hidden">
                                    <Image
                                        src={program.coverImage}
                                        alt={program.name}
                                        width={800}
                                        height={450}
                                        className="w-full h-auto object-cover"
                                    />
                                </div>
                            )}
                            <div
                                className="prose prose-teal max-w-none"
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(program.description) }}
                            />
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
