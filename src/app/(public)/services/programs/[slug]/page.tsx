import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AppDataSource } from "@/lib/db";
import { Program } from "@/entities/Program";

export const dynamic = "force-dynamic";

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

async function getProgram(slug: string): Promise<Program | null> {
    const ds = await getDataSource();
    const programRepo = ds.getRepository(Program);
    return programRepo.findOne({
        where: { slug, status: "published", isActive: true },
    });
}

async function getAllProgramSlugs(): Promise<{ slug: string }[]> {
    const ds = await getDataSource();
    const programRepo = ds.getRepository(Program);
    const programs = await programRepo.find({
        where: { status: "published", isActive: true },
        select: ["slug"],
    });
    return programs.map((program) => ({ slug: program.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const program = await getProgram(slug);

    if (!program) {
        return { title: "Program Not Found" };
    }

    // Strip HTML tags for description
    const plainDescription = program.description.replace(/<[^>]*>/g, "").substring(0, 160);

    return {
        title: program.title,
        description: plainDescription,
    };
}

export async function generateStaticParams() {
    try {
        return await getAllProgramSlugs();
    } catch {
        // Database not available during build - return empty array
        return [];
    }
}

export default async function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const program = await getProgram(slug);

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
                        <span className="inline-block px-3 py-1 bg-[var(--primary-teal)]/10 text-[var(--primary-teal)] text-sm rounded-full font-medium mb-4">
                            {program.duration}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold">
                            <span className="text-gradient-mixed">{program.title}</span>
                        </h1>
                    </div>
                </div>
            </section>

            {/* Cover Image */}
            {program.coverImage && (
                <section className="bg-white pt-8">
                    <div className="container-custom">
                        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl">
                            <Image
                                src={program.coverImage}
                                alt={program.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* Content */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            <div
                                className="prose prose-teal max-w-none"
                                dangerouslySetInnerHTML={{ __html: program.description }}
                            />
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="card p-6 sticky top-24">
                                {program.benefits && program.benefits.length > 0 && (
                                    <>
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
                                    </>
                                )}
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
