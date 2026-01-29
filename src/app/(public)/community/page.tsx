import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Clock, Handshake } from "lucide-react";
import { AppDataSource } from "@/lib/db";
import { CommunityProgram } from "@/entities/CommunityProgram";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Community",
    description: "Join our supportive community through various programs designed to connect, learn, and grow together.",
};

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

async function getCommunityPrograms(): Promise<CommunityProgram[]> {
    const ds = await getDataSource();
    const communityProgramRepo = ds.getRepository(CommunityProgram);
    return communityProgramRepo.find({
        where: { status: "published", isActive: true },
        order: { createdAt: "DESC" },
    });
}

export default async function CommunityPage() {
    const communityPrograms = await getCommunityPrograms();

    return (
        <>
            {/* Hero Section */}
            <section className="section bg-gradient-to-br from-white via-[#f0fdf9] to-[#f5f3ff]">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold">
                            Join Our <span className="text-gradient-mixed">Community</span>
                        </h1>
                        <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                            Connect with others on similar journeys. Our community programs offer
                            support, understanding, and a sense of belonging.
                        </p>
                    </div>
                </div>
            </section>

            {/* Programs */}
            <section className="section bg-white">
                <div className="container-custom">
                    {communityPrograms.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {communityPrograms.map((program) => (
                                <Link
                                    key={program.slug}
                                    href={`/community/${program.slug}`}
                                    className="card group hover:border-[var(--secondary-violet)] border-2 border-transparent transition-all"
                                >
                                    <div className="aspect-video bg-gradient-to-br from-[var(--secondary-violet)]/20 to-[var(--primary-teal)]/20 flex items-center justify-center overflow-hidden">
                                        {program.coverImage ? (
                                            <Image
                                                src={program.coverImage}
                                                alt={program.name}
                                                width={400}
                                                height={225}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Handshake className="w-12 h-12 text-[var(--primary-teal)]" />
                                        )}
                                    </div>
                                    <div className="card-body p-6">
                                        <h3 className="text-xl font-semibold">{program.name}</h3>
                                        <div
                                            className="text-gray-600 mt-2 text-sm line-clamp-3 prose prose-teal max-w-none prose-sm"
                                            dangerouslySetInnerHTML={{
                                                __html: program.description.substring(0, 200) + (program.description.length > 200 ? "..." : ""),
                                            }}
                                        />
                                        <div className="mt-4 flex items-center gap-2 text-sm text-[var(--secondary-violet)]">
                                            <Clock className="w-4 h-4" />
                                            {program.schedule}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-xl text-gray-500">
                                No community programs are currently available.
                            </p>
                            <p className="mt-2 text-gray-400">
                                Check back soon for upcoming programs!
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="section section-alt">
                <div className="container-custom text-center">
                    <h2 className="text-3xl font-bold">Want to Start a New Program?</h2>
                    <p className="mt-4 text-gray-600 max-w-xl mx-auto">
                        Have an idea for a community program? We&apos;re always looking to expand
                        our offerings. Get in touch with us!
                    </p>
                    <Link href="/contact" className="btn btn-primary mt-8 px-8 py-4">
                        Contact Us
                    </Link>
                </div>
            </section>
        </>
    );
}
