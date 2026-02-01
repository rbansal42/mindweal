import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { In } from "typeorm";
import { getDataSource } from "@/lib/db";
import { Therapist } from "@/entities/Therapist";
import { SessionType } from "@/entities/SessionType";
import { Specialization } from "@/entities/Specialization";

export const revalidate = 60;

async function getTherapistWithSessions(slug: string) {
    const ds = await getDataSource();
    const therapistRepo = ds.getRepository(Therapist);
    const sessionTypeRepo = ds.getRepository(SessionType);
    const specRepo = ds.getRepository(Specialization);

    const therapist = await therapistRepo.findOne({
        where: { slug, isActive: true },
    });

    if (!therapist) return null;

    const sessionTypes = await sessionTypeRepo.find({
        where: { therapistId: therapist.id, isActive: true },
    });

    // Fetch specializations for this therapist
    let specializations: Specialization[] = [];
    if (therapist.specializationIds?.length) {
        specializations = await specRepo.find({
            where: { id: In(therapist.specializationIds), isActive: true },
        });
    }

    return { therapist, sessionTypes, specializations };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const data = await getTherapistWithSessions(slug);

    if (!data) {
        return { title: "Therapist Not Found | Mindweal by Pihu Suri" };
    }

    return {
        title: `${data.therapist.name} - ${data.therapist.title} | Mindweal by Pihu Suri`,
        description: `Book a session with ${data.therapist.name}. ${data.therapist.title}.`,
    };
}

export default async function TherapistDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const data = await getTherapistWithSessions(slug);

    if (!data) {
        notFound();
    }

    const { therapist, sessionTypes, specializations } = data;

    return (
        <>
            {/* Hero Section */}
            <section className="section bg-gradient-to-br from-white via-[#f0fdf9] to-[#f5f3ff]">
                <div className="container-custom">
                    <Link href="/therapists" className="text-[var(--primary-teal)] hover:underline mb-4 inline-block">
                        ← Back to All Therapists
                    </Link>
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {therapist.photoUrl ? (
                            <img
                                src={therapist.photoUrl}
                                alt={therapist.name}
                                className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white shadow-lg object-cover flex-shrink-0"
                            />
                        ) : (
                            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-white/80 border-4 border-white shadow-lg flex items-center justify-center text-6xl md:text-8xl flex-shrink-0">
                                👤
                            </div>
                        )}
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold">{therapist.name}</h1>
                            <p className="text-[var(--primary-teal)] text-lg font-medium mt-2">{therapist.title}</p>
                            {specializations.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {specializations.map((spec) => (
                                        <span key={spec.id} className="px-3 py-1 bg-white/80 text-[var(--primary-teal)] text-sm rounded-full font-medium">
                                            {spec.name}
                                        </span>
                                    ))}
                                </div>
                            )}
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

                                <Link
                                    href={`/book/${therapist.slug}`}
                                    className="btn btn-primary w-full mb-6"
                                >
                                    Schedule Appointment
                                </Link>

                                {sessionTypes.length > 0 && (
                                    <>
                                        <hr className="my-6" />
                                        <div className="space-y-4 text-sm">
                                            <p className="text-gray-500 font-medium mb-2">Available Sessions</p>
                                            <ul className="space-y-3">
                                                {sessionTypes.map((session) => (
                                                    <li key={session.id} className="flex justify-between items-center">
                                                        <span className="text-gray-600">
                                                            {session.name} ({session.duration} min)
                                                        </span>
                                                        {session.price && (
                                                            <span className="text-[var(--primary-teal)] font-medium">
                                                                ₹{session.price}
                                                            </span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </>
                                )}

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
