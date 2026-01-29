import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calendar } from "lucide-react";
import { notFound } from "next/navigation";
import { AppDataSource } from "@/lib/db";
import { Workshop } from "@/entities/Workshop";

export const dynamic = "force-dynamic";

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(new Date(date));
}

function formatTime(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(new Date(date));
}

async function getWorkshop(slug: string): Promise<Workshop | null> {
    const ds = await getDataSource();
    const workshopRepo = ds.getRepository(Workshop);

    const workshop = await workshopRepo.findOne({
        where: {
            slug,
            status: "published",
            isActive: true,
        },
    });

    return workshop;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const workshop = await getWorkshop(slug);

    if (!workshop) {
        return { title: "Workshop Not Found" };
    }

    // Strip HTML tags for description
    const plainDescription = workshop.description.replace(/<[^>]*>/g, "").substring(0, 160);

    return {
        title: workshop.title,
        description: plainDescription,
    };
}

export async function generateStaticParams() {
    try {
        const ds = await getDataSource();
        const workshopRepo = ds.getRepository(Workshop);

        const workshops = await workshopRepo.find({
            where: { status: "published", isActive: true },
            select: ["slug"],
        });

        return workshops.map((workshop) => ({
            slug: workshop.slug,
        }));
    } catch {
        // Database not available during build - return empty array
        return [];
    }
}

export default async function WorkshopDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const workshop = await getWorkshop(slug);

    if (!workshop) {
        notFound();
    }

    const isPastWorkshop = new Date(workshop.date) < new Date();

    return (
        <>
            {/* Hero Section */}
            <section className="section bg-gradient-to-br from-white via-[#f0fdf9] to-[#f5f3ff]">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <Link href="/services/workshops" className="text-[var(--primary-teal)] hover:underline mb-4 inline-block">
                            &larr; Back to Workshops
                        </Link>
                        <div className="flex flex-wrap gap-3 mb-4">
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--secondary-green)]/10 text-[var(--secondary-green)] text-sm rounded-full font-medium">
                                <Calendar className="w-4 h-4" />
                                {formatDate(workshop.date)}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                                {workshop.duration}
                            </span>
                            {isPastWorkshop && (
                                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full">
                                    Past Workshop
                                </span>
                            )}
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
                            {workshop.coverImage && (
                                <div className="mb-8 rounded-lg overflow-hidden">
                                    <Image
                                        src={workshop.coverImage}
                                        alt={workshop.title}
                                        width={800}
                                        height={450}
                                        className="w-full h-auto object-cover"
                                    />
                                </div>
                            )}
                            <div
                                className="prose prose-teal max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600"
                                dangerouslySetInnerHTML={{ __html: workshop.description }}
                            />
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="card p-6 sticky top-24">
                                <h3 className="text-lg font-semibold mb-4">Workshop Details</h3>

                                <div className="space-y-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Date</p>
                                        <p className="font-medium">{formatDate(workshop.date)}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500">Time</p>
                                        <p className="font-medium">{formatTime(workshop.date)}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500">Duration</p>
                                        <p className="font-medium">{workshop.duration}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500">Capacity</p>
                                        <p className="font-medium text-[var(--secondary-green)]">
                                            {workshop.capacity} spots
                                        </p>
                                    </div>
                                </div>

                                <hr className="my-6" />

                                {isPastWorkshop ? (
                                    <div className="text-center text-gray-500">
                                        <p>This workshop has already taken place.</p>
                                        <Link href="/services/workshops" className="text-[var(--primary-teal)] hover:underline mt-2 inline-block">
                                            View upcoming workshops
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        <Link href="/contact" className="btn btn-primary w-full">
                                            Register for Workshop
                                        </Link>
                                        <p className="text-xs text-gray-400 text-center mt-3">
                                            Limited spots available
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
