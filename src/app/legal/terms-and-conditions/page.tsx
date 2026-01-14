import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms & Conditions",
    description: "MindWeal's terms and conditions for using our services.",
};

export default function TermsPage() {
    return (
        <section className="section bg-white">
            <div className="container-custom">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl font-bold mb-8">Terms & Conditions</h1>
                    <p className="text-gray-500 mb-8">Last updated: January 2026</p>

                    <div className="prose prose-gray max-w-none">
                        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
                        <p className="text-gray-600 mb-4">
                            By accessing or using MindWeal&apos;s services, you agree to be bound by
                            these Terms and Conditions. If you do not agree, please do not use our services.
                        </p>

                        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Services</h2>
                        <p className="text-gray-600 mb-4">
                            MindWeal provides mental health services including individual therapy,
                            group workshops, and community programs. Our services are not intended
                            to replace emergency medical care.
                        </p>

                        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Appointments</h2>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li>Appointments must be booked through our official channels</li>
                            <li>Cancellations require at least 24 hours notice</li>
                            <li>Late cancellations may incur a fee</li>
                            <li>No-shows may result in charges</li>
                        </ul>

                        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Payment</h2>
                        <p className="text-gray-600 mb-4">
                            Payment terms and fees will be communicated before services begin.
                            We accept various payment methods as specified during booking.
                        </p>

                        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Confidentiality</h2>
                        <p className="text-gray-600 mb-4">
                            We maintain strict confidentiality in accordance with professional
                            ethics and applicable laws. Exceptions include situations where
                            disclosure is required by law or to prevent harm.
                        </p>

                        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Limitations</h2>
                        <p className="text-gray-600 mb-4">
                            Our services are not a substitute for emergency medical care or
                            psychiatric treatment. In case of emergency, please contact
                            emergency services immediately.
                        </p>

                        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Intellectual Property</h2>
                        <p className="text-gray-600 mb-4">
                            All content on this website is the property of MindWeal and may not
                            be reproduced without permission.
                        </p>

                        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Changes to Terms</h2>
                        <p className="text-gray-600 mb-4">
                            We reserve the right to modify these terms at any time. Continued use
                            of our services constitutes acceptance of updated terms.
                        </p>

                        <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contact</h2>
                        <p className="text-gray-600 mb-4">
                            For questions about these terms, please contact us at{" "}
                            <a href="mailto:legal@mindweal.in" className="text-[var(--primary-teal)] hover:underline">
                                legal@mindweal.in
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
