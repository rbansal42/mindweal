import type { Metadata } from "next";
import { Clock, Languages, Building, Heart, CheckCircle } from "lucide-react";
import { socialLinks } from "@/config";

export const metadata: Metadata = {
    title: "Emergency Helplines",
    description: "Mental health crisis resources and emergency helplines in India. Get immediate help when you need it most.",
};

const helplines = [
    {
        name: "MindWeal by Pihu Suri",
        number: socialLinks.phone,
        description: "Reach out to us for support and guidance",
        hours: "Mon-Sat, 9 AM - 7 PM",
        languages: "English, Hindi",
        type: "primary",
    },
    {
        name: "Tele-MANAS",
        number: "14416 / 1-800-891-4416",
        description: "Government of India mental health helpline",
        hours: "24 hours, 7 days",
        languages: "Multiple languages",
        type: "government",
    },
    {
        name: "Kiran Mental Health Helpline",
        number: "1800-599-0019",
        description: "Ministry of Social Justice & Empowerment helpline",
        hours: "24 hours, 7 days",
        languages: "13 languages",
        type: "government",
    },
    {
        name: "iCall (TISS)",
        number: "9152987821",
        description: "Psychosocial helpline for suicide prevention and emotional support",
        hours: "Mon-Sat, 8 AM - 10 PM",
        languages: "English, Hindi, Marathi",
        type: "ngo",
    },
    {
        name: "Vandrevala Foundation",
        number: "1860-2662-345",
        description: "24/7 mental health support helpline",
        hours: "24 hours, 7 days",
        languages: "English, Hindi, and regional languages",
        type: "ngo",
    },
    {
        name: "NIMHANS",
        number: "080-46110007",
        description: "National Institute of Mental Health helpline",
        hours: "24 hours, 7 days",
        languages: "English, Hindi, Kannada",
        type: "government",
    },
    {
        name: "AASRA",
        number: "9820466726",
        description: "Crisis intervention and suicide prevention",
        hours: "24 hours, 7 days",
        languages: "English, Hindi",
        type: "ngo",
    },
    {
        name: "Snehi",
        number: "044-24640050",
        description: "Emotional support and crisis intervention",
        hours: "24 hours, 7 days",
        languages: "English, Hindi, Tamil",
        type: "ngo",
    },
];

export default function EmergencyHelplinesPage() {
    return (
        <>
            {/* Hero Section */}
            <section className="section bg-gradient-to-br from-red-50 to-orange-50">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold text-red-800">
                            Emergency Helplines
                        </h1>
                        <p className="mt-6 text-xl text-red-700 leading-relaxed">
                            If you or someone you know is in immediate danger or experiencing
                            a mental health crisis, please reach out to one of these helplines.
                            You are not alone — help is available.
                        </p>
                    </div>
                </div>
            </section>

            {/* Emergency Notice */}
            <section className="py-6 bg-red-600 text-white">
                <div className="container-custom text-center">
                    <p className="font-semibold">
                        For immediate emergencies, call 112 (India Emergency Number)
                    </p>
                </div>
            </section>

            {/* MindWeal Contact */}
            <section className="py-8 bg-[var(--primary-teal)]/10">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-[var(--primary-teal)]">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-[var(--primary-teal)]">MindWeal by Pihu Suri</h3>
                                    <p className="text-gray-600 mt-1">Reach out to us for support and guidance</p>
                                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            Mon-Sat, 9 AM - 7 PM
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <a
                                        href={`tel:${socialLinks.phone.replace(/\D/g, '')}`}
                                        className="btn btn-primary whitespace-nowrap"
                                    >
                                        Call {socialLinks.phone}
                                    </a>
                                    <a
                                        href={`https://wa.me/91${socialLinks.phone.replace(/\D/g, '').slice(-10)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn bg-green-500 hover:bg-green-600 text-white whitespace-nowrap"
                                    >
                                        WhatsApp
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Government Helplines */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <Building className="w-4 h-4 text-blue-600" />
                            </span>
                            Government Helplines
                        </h2>
                        <div className="grid gap-4">
                            {helplines.filter(h => h.type === 'government').map((helpline, index) => (
                                <div key={index} className="card p-6 border-l-4 border-blue-500">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div>
                                            <h3 className="text-xl font-semibold">{helpline.name}</h3>
                                            <p className="text-gray-600 mt-1">{helpline.description}</p>
                                            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {helpline.hours}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Languages className="w-4 h-4" />
                                                    {helpline.languages}
                                                </span>
                                            </div>
                                        </div>
                                        <a
                                            href={`tel:${helpline.number.replace(/[^0-9]/g, "")}`}
                                            className="btn btn-primary whitespace-nowrap"
                                        >
                                            {helpline.number}
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* NGO Helplines */}
            <section className="section section-alt">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-[var(--primary-teal)]/10 flex items-center justify-center">
                                <Heart className="w-4 h-4 text-[var(--primary-teal)]" />
                            </span>
                            NGO & Non-Profit Helplines
                        </h2>
                        <div className="grid gap-4">
                            {helplines.filter(h => h.type === 'ngo').map((helpline, index) => (
                                <div key={index} className="card p-6 border-l-4 border-[var(--primary-teal)]">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div>
                                            <h3 className="text-xl font-semibold">{helpline.name}</h3>
                                            <p className="text-gray-600 mt-1">{helpline.description}</p>
                                            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {helpline.hours}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Languages className="w-4 h-4" />
                                                    {helpline.languages}
                                                </span>
                                            </div>
                                        </div>
                                        <a
                                            href={`tel:${helpline.number.replace(/[^0-9]/g, "")}`}
                                            className="btn btn-primary whitespace-nowrap"
                                        >
                                            {helpline.number}
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Remember Section */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto">
                        <div className="p-8 bg-gradient-to-br from-[var(--primary-teal)]/5 to-[var(--secondary-green)]/5 rounded-2xl">
                            <h3 className="font-bold text-xl text-gray-800 mb-4">Remember</h3>
                            <ul className="text-gray-600 space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className="text-[var(--primary-teal)] mt-1">
                                        <CheckCircle className="w-5 h-5" />
                                    </span>
                                    <span><strong>You are not alone.</strong> Help is available and reaching out is a sign of strength.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[var(--primary-teal)] mt-1">
                                        <CheckCircle className="w-5 h-5" />
                                    </span>
                                    <span><strong>It&apos;s okay to ask for help.</strong> Mental health struggles are valid and treatable.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[var(--primary-teal)] mt-1">
                                        <CheckCircle className="w-5 h-5" />
                                    </span>
                                    <span><strong>All helplines are confidential.</strong> Your privacy is protected.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[var(--primary-teal)] mt-1">
                                        <CheckCircle className="w-5 h-5" />
                                    </span>
                                    <span><strong>In immediate danger?</strong> Call 112 for emergency services.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
