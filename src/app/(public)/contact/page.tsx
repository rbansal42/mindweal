import type { Metadata } from "next";
import { Mail, Clock, Link as LinkIcon, AlertTriangle } from "lucide-react";
import { WhatsAppIcon, InstagramIcon, LinkedInIcon } from "@/components/icons";
import { appConfig, socialLinks } from "@/config";
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
                                        <Mail className="w-6 h-6 text-[var(--primary-teal)]" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Email</h4>
                                        <a href={`mailto:${socialLinks.email}`} className="text-[var(--primary-teal)] hover:underline">
                                            {socialLinks.email}
                                        </a>
                                    </div>
                                </div>

                                {/* Phone / WhatsApp */}
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-[var(--secondary-green)]/10 flex items-center justify-center flex-shrink-0">
                                        <WhatsAppIcon size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">WhatsApp</h4>
                                        <a 
                                            href={`https://wa.me/91${socialLinks.phone.replace(/\D/g, '').slice(-10)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[var(--secondary-green)] hover:underline"
                                        >
                                            {socialLinks.phone}
                                        </a>
                                    </div>
                                </div>

                                {/* Social Links */}
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-[var(--primary-teal)]/10 flex items-center justify-center flex-shrink-0">
                                        <LinkIcon className="w-6 h-6 text-[var(--primary-teal)]" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Social Media</h4>
                                        <div className="flex gap-4 mt-2">
                                            <a
                                                href={socialLinks.instagram}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-600 hover:text-[var(--primary-teal)] transition-colors"
                                            >
                                                <InstagramIcon size={24} />
                                            </a>
                                            <a
                                                href={socialLinks.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-600 hover:text-[var(--primary-teal)] transition-colors"
                                            >
                                                <LinkedInIcon size={24} />
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Hours */}
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-[var(--primary-teal)]/10 flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-6 h-6 text-[var(--primary-teal)]" />
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
                                    <AlertTriangle className="w-5 h-5" />
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
