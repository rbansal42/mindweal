import { Metadata } from "next";
import { AppDataSource } from "@/lib/db";
import { FAQ } from "@/entities/FAQ";
import { FAQAccordion } from "./FAQAccordion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Frequently Asked Questions | MindWeal by Pihu Suri",
    description: "Find answers to common questions about therapy services, booking, programs, and more at MindWeal.",
};

const CATEGORY_LABELS: Record<string, string> = {
    therapy: "Therapy Services",
    booking: "Booking & Sessions",
    programs: "Programs & Training",
    general: "General",
};

const CATEGORY_ORDER = ["therapy", "booking", "programs", "general"];

async function getFAQs() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    const repo = AppDataSource.getRepository(FAQ);
    return repo.find({
        where: { isActive: true },
        order: { category: "ASC", displayOrder: "ASC" },
    });
}

export default async function FAQPage() {
    const faqs = await getFAQs();

    // Group FAQs by category
    const groupedFAQs = CATEGORY_ORDER.reduce((acc, category) => {
        const categoryFaqs = faqs.filter((faq) => faq.category === category);
        if (categoryFaqs.length > 0) {
            acc[category] = categoryFaqs;
        }
        return acc;
    }, {} as Record<string, typeof faqs>);

    const hasAnyFAQs = Object.keys(groupedFAQs).length > 0;

    return (
        <>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-white via-[#f0fdf9] to-[#f5f3ff] py-16 md:py-24">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold">
                            Frequently Asked{" "}
                            <span className="text-gradient-primary">Questions</span>
                        </h1>
                        <p className="mt-4 text-lg text-gray-600">
                            Find answers to common questions about our therapy services,
                            booking process, programs, and more. If you can&apos;t find what
                            you&apos;re looking for, feel free to contact us.
                        </p>
                    </div>
                </div>
            </section>

            {/* FAQ Content */}
            <section className="section bg-white">
                <div className="container-custom">
                    {!hasAnyFAQs ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">
                                FAQs are being updated. Please check back soon or contact us
                                directly.
                            </p>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-12">
                            {CATEGORY_ORDER.map((category) => {
                                const categoryFaqs = groupedFAQs[category];
                                if (!categoryFaqs) return null;

                                return (
                                    <div key={category}>
                                        <h2 className="text-2xl font-bold mb-6 text-gray-900">
                                            {CATEGORY_LABELS[category]}
                                        </h2>
                                        <FAQAccordion faqs={categoryFaqs} />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Contact CTA */}
            <section className="section section-alt">
                <div className="container-custom text-center">
                    <h2 className="text-2xl md:text-3xl font-bold">
                        Still have questions?
                    </h2>
                    <p className="mt-4 text-gray-600 max-w-xl mx-auto">
                        We&apos;re here to help. Reach out to us and we&apos;ll get back to
                        you as soon as possible.
                    </p>
                    <div className="mt-8">
                        <a
                            href="/contact"
                            className="btn btn-primary px-8 py-3"
                        >
                            Contact Us
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
}
