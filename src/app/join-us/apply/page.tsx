import type { Metadata } from "next";
import { Suspense } from "react";
import ApplicationForm from "./ApplicationForm";

export const metadata: Metadata = {
    title: "Apply",
    description: "Submit your application to join the MindWeal team.",
};

function ApplicationFormFallback() {
    return (
        <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-100 rounded-lg" />
            <div className="h-12 bg-gray-100 rounded-lg" />
            <div className="h-12 bg-gray-100 rounded-lg" />
            <div className="h-32 bg-gray-100 rounded-lg" />
        </div>
    );
}

export default function ApplyPage() {
    return (
        <>
            {/* Hero Section */}
            <section className="section bg-gradient-to-br from-white via-[#f0fdf9] to-[#f5f3ff]">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold">
                            <span className="text-gradient-mixed">Apply</span> to Join Us
                        </h1>
                        <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                            We&apos;re excited that you want to be part of our team!
                            Please fill out the form below and upload your resume.
                        </p>
                    </div>
                </div>
            </section>

            {/* Application Form */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="max-w-2xl mx-auto">
                        <Suspense fallback={<ApplicationFormFallback />}>
                            <ApplicationForm />
                        </Suspense>
                    </div>
                </div>
            </section>
        </>
    );
}
