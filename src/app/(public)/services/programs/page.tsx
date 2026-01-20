import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AppDataSource } from "@/lib/db";
import { Program } from "@/entities/Program";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Programs",
    description: "Explore our therapeutic programs designed to help you develop lasting coping strategies and achieve your mental health goals.",
};

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

async function getPrograms(): Promise<Program[]> {
    const ds = await getDataSource();
    const programRepo = ds.getRepository(Program);
    return programRepo.find({
        where: { status: "published", isActive: true },
        order: { createdAt: "DESC" },
    });
}

export default async function ProgramsPage() {
    const programs = await getPrograms();
    return (
        <>
            {/* Hero Section */}
            <section className="section bg-gradient-to-br from-white via-[#f0fdf9] to-[#f5f3ff]">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <Link href="/services" className="text-[var(--primary-teal)] hover:underline mb-4 inline-block">
                            ← Back to Services
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-bold">
                            Therapeutic <span className="text-gradient-mixed">Programs</span>
                        </h1>
                        <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                            Structured programs designed to help you develop lasting skills and
                            achieve meaningful progress in your mental health journey.
                        </p>
                    </div>
                </div>
            </section>

            {/* Programs List */}
            <section className="section bg-white">
                <div className="container-custom">
                    {programs.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No programs available at the moment.</p>
                            <p className="text-gray-400 mt-2">Please check back soon for upcoming programs.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-8">
                                {programs.map((program) => (
                                    <Link
                                        key={program.slug}
                                        href={`/services/programs/${program.slug}`}
                                        className="card group flex flex-col md:flex-row overflow-hidden hover:border-[var(--primary-teal)] border-2 border-transparent transition-all"
                                    >
                                        <div className="md:w-1/3 aspect-video md:aspect-auto bg-gradient-to-br from-[var(--primary-teal)]/20 to-[var(--secondary-green)]/20 flex items-center justify-center relative min-h-[200px]">
                                            {program.coverImage ? (
                                                <Image
                                                    src={program.coverImage}
                                                    alt={program.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <span className="text-6xl">📋</span>
                                            )}
                                        </div>
                                        <div className="card-body p-8 flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="px-3 py-1 bg-[var(--primary-teal)]/10 text-[var(--primary-teal)] text-sm rounded-full font-medium">
                                                    {program.duration}
                                                </span>
                                            </div>
                                            <h2 className="text-2xl font-bold">{program.title}</h2>
                                            <div
                                                className="prose prose-teal max-w-none mt-3 text-gray-600 line-clamp-3"
                                                dangerouslySetInnerHTML={{ __html: program.description }}
                                            />
                                            {program.benefits && program.benefits.length > 0 && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {program.benefits.map((benefit, i) => (
                                                        <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                                                            {benefit}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <span className="text-[var(--primary-teal)] font-medium inline-flex items-center mt-6">
                                                Learn More
                                                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            <div className="mt-12 text-center text-gray-500">
                                More programs coming soon. Contact us to learn about upcoming offerings!
                            </div>
                        </>
                    )}
                </div>
            </section>
        </>
    );
}
