"use client";

import { useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { CloudUpload } from "lucide-react";

export default function ApplicationForm() {
    const searchParams = useSearchParams();
    const position = searchParams.get("position") || "";
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        position: position,
        coverLetter: "",
    });
    const [resume, setResume] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            newErrors.email = "Invalid email format";
        if (!resume) newErrors.resume = "Please upload your resume";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        setSubmitStatus("idle");

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => data.append(key, value));
            if (resume) data.append("resume", resume);

            const response = await fetch("/api/application", {
                method: "POST",
                body: data,
            });

            if (response.ok) {
                setSubmitStatus("success");
                setFormData({ name: "", email: "", phone: "", position: "", coverLetter: "" });
                setResume(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
            } else {
                setSubmitStatus("error");
            }
        } catch {
            setSubmitStatus("error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type and size
            const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
            if (!validTypes.includes(file.type)) {
                setErrors((prev) => ({ ...prev, resume: "Please upload a PDF or DOC file" }));
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setErrors((prev) => ({ ...prev, resume: "File size must be less than 5MB" }));
                return;
            }
            setResume(file);
            setErrors((prev) => ({ ...prev, resume: "" }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
                <label htmlFor="name" className="label">Full Name <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`input ${errors.name ? "input-error" : ""}`}
                    placeholder="Your full name"
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
                <label htmlFor="email" className="label">Email <span className="text-red-500">*</span></label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`input ${errors.email ? "input-error" : ""}`}
                    placeholder="your@email.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
                <label htmlFor="phone" className="label">Phone Number</label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input"
                    placeholder="+91 XXXXXXXXXX"
                />
            </div>

            {/* Position */}
            <div>
                <label htmlFor="position" className="label">Position</label>
                <select
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="input"
                >
                    <option value="">Select a position (or General Application)</option>
                    <option value="clinical-psychologist">Clinical Psychologist</option>
                    <option value="counselor">Licensed Counselor</option>
                    <option value="program-coordinator">Program Coordinator</option>
                    <option value="general">General Application</option>
                </select>
            </div>

            {/* Resume Upload */}
            <div>
                <label htmlFor="resume" className="label">Resume <span className="text-red-500">*</span></label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center ${errors.resume ? "border-red-300" : "border-gray-300"} hover:border-[var(--primary-teal)] transition-colors`}>
                    <input
                        type="file"
                        id="resume"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                    />
                    <label htmlFor="resume" className="cursor-pointer">
                        <CloudUpload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                        {resume ? (
                            <p className="text-[var(--primary-teal)] font-medium">{resume.name}</p>
                        ) : (
                            <>
                                <p className="text-gray-600">Click to upload or drag and drop</p>
                                <p className="text-sm text-gray-400 mt-1">PDF, DOC up to 5MB</p>
                            </>
                        )}
                    </label>
                </div>
                {errors.resume && <p className="mt-1 text-sm text-red-500">{errors.resume}</p>}
            </div>

            {/* Cover Letter */}
            <div>
                <label htmlFor="coverLetter" className="label">Cover Letter / Message</label>
                <textarea
                    id="coverLetter"
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleChange}
                    rows={5}
                    className="input resize-none"
                    placeholder="Tell us about yourself and why you'd like to join MindWeal..."
                />
            </div>

            {/* Status Messages */}
            {submitStatus === "success" && (
                <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                    Thank you for your application! We&apos;ll review it and get back to you soon.
                </div>
            )}
            {submitStatus === "error" && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                    Something went wrong. Please try again or email us directly.
                </div>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full py-4 text-lg disabled:opacity-50"
            >
                {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
        </form>
    );
}
