import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Emergency Helplines",
    description: "Mental health crisis resources and emergency helplines in India.",
};

const helplines = [
    {
        name: "Vandrevala Foundation",
        number: "1860-2662-345",
        description: "24/7 mental health support helpline",
        hours: "24 hours, 7 days",
        languages: "English, Hindi, and regional languages",
    },
    {
        name: "iCall",
        number: "9152987821",
        description: "Psychosocial helpline by TISS",
        hours: "Mon-Sat, 8 AM - 10 PM",
        languages: "English, Hindi, Marathi",
    },
    {
        name: "NIMHANS",
        number: "080-46110007",
        description: "National Institute of Mental Health helpline",
        hours: "24 hours, 7 days",
        languages: "English, Hindi, Kannada",
    },
    {
        name: "Snehi",
        number: "044-24640050",
        description: "Emotional support and crisis intervention",
        hours: "24 hours, 7 days",
        languages: "English, Hindi, Tamil",
    },
    {
        name: "AASRA",
        number: "9820466726",
        description: "Crisis intervention and suicide prevention",
        hours: "24 hours, 7 days",
        languages: "English, Hindi",
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
                        </p>
                    </div>
                </div>
            </section>

            {/* Emergency Notice */}
            <section className="py-6 bg-red-600 text-white">
                <div className="container-custom text-center">
                    <p className="font-semibold">
                        🚨 For immediate emergencies, call 112 (India Emergency Number)
                    </p>
                </div>
            </section>

            {/* Helplines List */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="grid gap-6 max-w-3xl mx-auto">
                        {helplines.map((helpline, index) => (
                            <div key={index} className="card p-6 border-l-4 border-[var(--primary-teal)]">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl font-semibold">{helpline.name}</h3>
                                        <p className="text-gray-600 mt-1">{helpline.description}</p>
                                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {helpline.hours}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                                </svg>
                                                {helpline.languages}
                                            </span>
                                        </div>
                                    </div>
                                    <a
                                        href={`tel:${helpline.number.replace(/-/g, "")}`}
                                        className="btn btn-primary whitespace-nowrap"
                                    >
                                        📞 {helpline.number}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 p-6 bg-gray-50 rounded-xl max-w-3xl mx-auto">
                        <h3 className="font-semibold text-gray-800 mb-3">Remember</h3>
                        <ul className="text-gray-600 space-y-2 text-sm">
                            <li>• You are not alone. Help is available.</li>
                            <li>• It&apos;s okay to reach out when you&apos;re struggling.</li>
                            <li>• These helplines are confidential and judgment-free.</li>
                            <li>• If you&apos;re in immediate danger, please call 112.</li>
                        </ul>
                    </div>
                </div>
            </section>
        </>
    );
}
