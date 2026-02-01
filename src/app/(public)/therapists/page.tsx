import type { Metadata } from "next";
import Link from "next/link";
import { In } from "typeorm";
import { getDataSource } from "@/lib/db";
import { Therapist } from "@/entities/Therapist";
import { Specialization } from "@/entities/Specialization";

export const revalidate = 60;

export const metadata: Metadata = {
    title: "Our Therapists",
    description: "Meet our experienced therapists and book a session that fits your schedule.",
};

type TherapistWithSpecializations = Therapist & { specializations: Specialization[] };

async function getTherapists(): Promise<TherapistWithSpecializations[]> {
    const ds = await getDataSource();
    const therapistRepo = ds.getRepository(Therapist);
    const specRepo = ds.getRepository(Specialization);

    const therapists = await therapistRepo.find({
        where: { isActive: true },
        order: { name: "ASC" },
    });

    // Fetch specializations for all therapists
    const therapistsWithSpecs: TherapistWithSpecializations[] = await Promise.all(
        therapists.map(async (therapist) => {
            let specializations: Specialization[] = [];
            if (therapist.specializationIds?.length) {
                specializations = await specRepo.find({
                    where: { id: In(therapist.specializationIds), isActive: true },
                });
            }
            return { ...therapist, specializations };
        })
    );

    return therapistsWithSpecs;
}

export default async function TherapistsPage() {
    const therapists = await getTherapists();
    return (
        <>
            {/* Hero Section */}
            <section className="section bg-gradient-to-br from-white via-[#f0fdf9] to-[#f5f3ff]">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold">
                            Our <span className="text-gradient-mixed">Therapists</span>
                        </h1>
                        <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                            Our team of experienced therapists is here to support you.
                            Find the right match and book a session that fits your schedule.
                        </p>
                    </div>
                </div>
            </section>

            {/* Therapists Grid */}
            <section className="section bg-white">
                <div className="container-custom">
                    {therapists.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-500 text-lg">No therapists available at the moment.</p>
                            <p className="text-gray-400 mt-2">Please check back soon.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {therapists.map((therapist) => (
                                <div key={therapist.id} className="card group">
                                    <div className="aspect-square bg-gradient-to-br from-[var(--primary-teal)]/20 to-[var(--secondary-green)]/20 flex items-center justify-center">
                                        {therapist.photoUrl ? (
                                            <img
                                                src={therapist.photoUrl}
                                                alt={therapist.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-32 h-32 rounded-full bg-white/80 flex items-center justify-center text-5xl">
                                                👤
                                            </div>
                                        )}
                                    </div>
                                    <div className="card-body p-6">
                                        <h3 className="text-xl font-semibold">{therapist.name}</h3>
                                        <p className="text-[var(--primary-teal)] text-sm font-medium mt-1">
                                            {therapist.title}
                                        </p>
                                        <p className="text-gray-600 mt-3 text-sm line-clamp-3">{therapist.bio}</p>

                                        {therapist.specializations?.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-1">
                                                {therapist.specializations.slice(0, 3).map(spec => (
                                                    <span key={spec.id} className="px-2 py-0.5 bg-[var(--primary-teal)]/10 text-[var(--primary-teal)] text-xs rounded-full">
                                                        {spec.name}
                                                    </span>
                                                ))}
                                                {therapist.specializations.length > 3 && (
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                                                        +{therapist.specializations.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-6 flex gap-3">
                                            <Link
                                                href={`/therapists/${therapist.slug}`}
                                                className="btn btn-outline flex-1 py-2 text-sm"
                                            >
                                                View Profile
                                            </Link>
                                            <Link
                                                href={`/book/${therapist.slug}`}
                                                className="btn btn-primary flex-1 py-2 text-sm"
                                            >
                                                Book Session
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* How Booking Works */}
            <section className="section section-alt">
                <div className="container-custom">
                    <h2 className="text-3xl font-bold text-center mb-12">How Booking Works</h2>
                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        {[
                            { step: "1", title: "Choose a Therapist", desc: "Browse our therapists and find someone who fits your needs." },
                            { step: "2", title: "Pick a Time", desc: "Select a convenient date and time from their availability." },
                            { step: "3", title: "Start Your Journey", desc: "Attend your session and begin your path to wellness." },
                        ].map((item) => (
                            <div key={item.step} className="text-center">
                                <div className="w-12 h-12 rounded-full bg-[var(--primary-teal)] text-white text-xl font-bold flex items-center justify-center mx-auto">
                                    {item.step}
                                </div>
                                <h3 className="text-lg font-semibold mt-4">{item.title}</h3>
                                <p className="text-gray-600 mt-2 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
