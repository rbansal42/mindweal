import type { Metadata } from "next";
import { appConfig } from "@/config";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
    title: "Contact Us",
    description: `Get in touch with ${appConfig.name}. We're here to help you on your mental wellness journey.`,
};

export default function ContactPage() {
    return (
        <>
            {/* Hero Section */}
            <section className="section bg-gradient-to-br from-white via-[#f0fdf9] to-[#f5f3ff]">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold">
                            Get in <span className="text-gradient-mixed">Touch</span>
                        </h1>
                        <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                            Have questions or ready to start your journey? We&apos;re here to help.
                            Reach out and we&apos;ll get back to you as soon as possible.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-16">
                        {/* Contact Form */}
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                            <ContactForm />
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Contact Information</h2>

                            <div className="space-y-6">
                                {/* Email */}
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-[var(--primary-teal)]/10 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-[var(--primary-teal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Email</h4>
                                        <a href="mailto:hello@mindweal.in" className="text-[var(--primary-teal)] hover:underline">
                                            hello@mindweal.in
                                        </a>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-[var(--primary-purple)]/10 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-[var(--primary-purple)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Phone</h4>
                                        <p className="text-gray-600">+91 XXXXXXXXXX</p>
                                    </div>
                                </div>

                                {/* Hours */}
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-[var(--secondary-green)]/10 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-[var(--secondary-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Working Hours</h4>
                                        <p className="text-gray-600">Mon - Sat: 9:00 AM - 7:00 PM</p>
                                        <p className="text-gray-600">Sunday: By Appointment</p>
                                    </div>
                                </div>
                            </div>

                            {/* Emergency Note */}
                            <div className="mt-10 p-6 bg-red-50 rounded-xl border border-red-100">
                                <h4 className="font-semibold text-red-800 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    In Case of Emergency
                                </h4>
                                <p className="mt-2 text-red-700 text-sm">
                                    If you or someone you know is in immediate danger or experiencing a mental health crisis,
                                    please contact emergency services or visit our{" "}
                                    <a href="/resources/emergency-helplines" className="underline">
                                        emergency helplines page
                                    </a>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
