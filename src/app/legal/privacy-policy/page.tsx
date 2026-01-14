import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "MindWeal's privacy policy - how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
    return (
        <section className="section bg-white">
            <div className="container-custom">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
                    <p className="text-gray-500 mb-8">Last updated: January 2026</p>

                    <div className="prose prose-gray max-w-none">
                        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
                        <p className="text-gray-600 mb-4">
                            MindWeal (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
                            This Privacy Policy explains how we collect, use, disclose, and safeguard
                            your information when you visit our website or use our services.
                        </p>

                        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
                        <p className="text-gray-600 mb-4">We may collect information about you in various ways:</p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li>Personal information you provide (name, email, phone number)</li>
                            <li>Health information related to therapy services</li>
                            <li>Payment information for services</li>
                            <li>Usage data and analytics</li>
                        </ul>

                        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Use of Your Information</h2>
                        <p className="text-gray-600 mb-4">We use the information we collect to:</p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li>Provide and maintain our services</li>
                            <li>Schedule and manage appointments</li>
                            <li>Communicate with you about our services</li>
                            <li>Improve our website and services</li>
                            <li>Comply with legal obligations</li>
                        </ul>

                        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Confidentiality</h2>
                        <p className="text-gray-600 mb-4">
                            All personal and health information shared during therapy sessions is
                            kept strictly confidential in accordance with professional ethics and
                            applicable laws. Information will only be disclosed with your written
                            consent or when required by law.
                        </p>

                        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Data Security</h2>
                        <p className="text-gray-600 mb-4">
                            We implement appropriate technical and organizational measures to protect
                            your personal information against unauthorized access, alteration,
                            disclosure, or destruction.
                        </p>

                        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Your Rights</h2>
                        <p className="text-gray-600 mb-4">You have the right to:</p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li>Access your personal information</li>
                            <li>Correct inaccurate data</li>
                            <li>Request deletion of your data</li>
                            <li>Withdraw consent at any time</li>
                        </ul>

                        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Contact Us</h2>
                        <p className="text-gray-600 mb-4">
                            If you have questions about this Privacy Policy, please contact us at{" "}
                            <a href="mailto:privacy@mindweal.in" className="text-[var(--primary-teal)] hover:underline">
                                privacy@mindweal.in
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
