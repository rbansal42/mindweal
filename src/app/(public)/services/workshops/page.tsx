import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calendar } from "lucide-react";
import { MoreThanOrEqual } from "typeorm";
import { AppDataSource } from "@/lib/db";
import { Workshop } from "@/entities/Workshop";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Workshops",
    description: "Join our interactive workshops on stress management, mindfulness, communication skills, and more.",
};

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(new Date(date));
}

async function getWorkshops(): Promise<Workshop[]> {
    const ds = await getDataSource();
    const workshopRepo = ds.getRepository(Workshop);

    const workshops = await workshopRepo.find({
        where: {
            status: "published",
            isActive: true,
            date: MoreThanOrEqual(new Date()),
        },
        order: { date: "ASC" },
    });

    return workshops;
}

export default async function WorkshopsPage() {
    const workshops = await getWorkshops();

    return (
        <>
            {/* Hero Section */}
            <section className="section bg-gradient-to-br from-white via-[#f0fdf9] to-[#f5f3ff]">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <Link href="/services" className="text-[var(--primary-teal)] hover:underline mb-4 inline-block">
                            &larr; Back to Services
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-bold">
                            <span className="text-gradient-mixed">Workshops</span>
                        </h1>
                        <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                            Interactive group sessions designed to teach practical skills
                            and foster a sense of community.
                        </p>
                    </div>
                </div>
            </section>

            {/* Workshops List */}
            <section className="section bg-white">
                <div className="container-custom">
                    {workshops.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No upcoming workshops at the moment.</p>
                            <p className="text-gray-400 mt-2">Please check back soon for new workshops!</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {workshops.map((workshop) => (
                                <Link
                                    key={workshop.id}
                                    href={`/services/workshops/${workshop.slug}`}
                                    className="card group hover:border-[var(--secondary-green)] border-2 border-transparent transition-all"
                                >
                                    <div className="aspect-video bg-gradient-to-br from-[var(--secondary-green)]/20 to-[var(--primary-teal)]/20 flex items-center justify-center overflow-hidden">
                                        {workshop.coverImage ? (
                                            <Image
                                                src={workshop.coverImage}
                                                alt={workshop.title}
                                                width={400}
                                                height={225}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-5xl">🎯</span>
                                        )}
                                    </div>
                                    <div className="card-body p-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                            <Calendar className="w-4 h-4" />
                                            {formatDate(workshop.date)}
                                        </div>
                                        <h3 className="text-xl font-semibold">{workshop.title}</h3>
                                        <div
                                            className="text-gray-600 mt-2 text-sm line-clamp-2 prose prose-sm prose-teal max-w-none"
                                            dangerouslySetInnerHTML={{
                                                __html: workshop.description.substring(0, 150) + (workshop.description.length > 150 ? "..." : ""),
                                            }}
                                        />
                                        <div className="mt-4 flex items-center justify-between text-sm">
                                            <span className="text-gray-500">{workshop.duration}</span>
                                            <span className="text-[var(--secondary-green)] font-medium">
                                                {workshop.capacity} spots
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="mt-12 text-center text-gray-500">
                        New workshops are added regularly. Follow us for updates!
                    </div>
                </div>
            </section>
        </>
    );
}
