// frontend/src/app/admin/therapists/[id]/edit/EditTherapistForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Check, User } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    title: z.string().min(2, "Title must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    bio: z.string().min(50, "Bio must be at least 50 characters"),
    photoUrl: z.string().optional(),
    specializationIds: z.array(z.string()).min(1, "Select at least one specialization"),
    defaultSessionDuration: z.number(),
    bufferTime: z.number(),
    advanceBookingDays: z.number(),
    minBookingNotice: z.number(),
});

type FormData = z.infer<typeof formSchema>;

interface Therapist {
    id: string;
    name: string;
    title: string;
    email: string;
    phone: string | null;
    bio: string;
    photoUrl: string | null;
    specializationIds: string[] | null;
    defaultSessionDuration: number;
    bufferTime: number;
    advanceBookingDays: number;
    minBookingNotice: number;
}

interface Specialization {
    id: string;
    name: string;
}

interface Props {
    therapist: Therapist;
    specializations: Specialization[];
}

export default function EditTherapistForm({ therapist, specializations }: Props) {
    const router = useRouter();
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(therapist.photoUrl);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { startUpload, isUploading } = useUploadThing("therapistPhoto");

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: therapist.name,
            title: therapist.title,
            email: therapist.email,
            phone: therapist.phone || "",
            bio: therapist.bio,
            photoUrl: therapist.photoUrl || "",
            specializationIds: therapist.specializationIds || [],
            defaultSessionDuration: therapist.defaultSessionDuration,
            bufferTime: therapist.bufferTime,
            advanceBookingDays: therapist.advanceBookingDays,
            minBookingNotice: therapist.minBookingNotice,
        },
    });

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            let photoUrl = data.photoUrl;
            if (photoFile) {
                const uploadResult = await startUpload([photoFile]);
                if (uploadResult?.[0]?.ufsUrl) {
                    photoUrl = uploadResult[0].ufsUrl;
                }
            }

            const res = await fetch(`/api/admin/therapists/${therapist.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, photoUrl }),
            });

            const result = await res.json();
            if (!res.ok) {
                throw new Error(typeof result.error === "string" ? result.error : "Failed to update therapist");
            }

            router.push(`/admin/therapists/${therapist.id}`);
            router.refresh();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl">
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}

            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                {/* Profile Info */}
                <div className="portal-card p-4 space-y-4">
                    <h2 className="text-sm font-semibold">Profile Information</h2>

                    <div className="grid md:grid-cols-2 gap-3">
                        <div>
                            <label className="portal-label">Name *</label>
                            <input {...form.register("name")} className="portal-input" />
                            {form.formState.errors.name && <p className="text-red-500 text-xs mt-0.5">{form.formState.errors.name.message}</p>}
                        </div>
                        <div>
                            <label className="portal-label">Title *</label>
                            <input {...form.register("title")} className="portal-input" />
                            {form.formState.errors.title && <p className="text-red-500 text-xs mt-0.5">{form.formState.errors.title.message}</p>}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                        <div>
                            <label className="portal-label">Email *</label>
                            <input type="email" {...form.register("email")} className="portal-input" />
                            {form.formState.errors.email && <p className="text-red-500 text-xs mt-0.5">{form.formState.errors.email.message}</p>}
                        </div>
                        <div>
                            <label className="portal-label">Phone *</label>
                            <input {...form.register("phone")} className="portal-input" />
                            {form.formState.errors.phone && <p className="text-red-500 text-xs mt-0.5">{form.formState.errors.phone.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="portal-label">Bio *</label>
                        <textarea {...form.register("bio")} rows={4} className="portal-input" />
                        {form.formState.errors.bio && <p className="text-red-500 text-xs mt-0.5">{form.formState.errors.bio.message}</p>}
                    </div>

                    <div>
                        <label className="portal-label">Photo</label>
                        <div className="flex items-center gap-3">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                                    <User className="w-5 h-5 text-gray-400" />
                                </div>
                            )}
                            <div>
                                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" id="photo-upload" />
                                <label htmlFor="photo-upload" className="portal-btn portal-btn-outline cursor-pointer">
                                    {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Change Photo"}
                                </label>
                                <p className="text-xs text-gray-500 mt-1">Max 4MB, will be optimized to WebP</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="portal-label">Specializations *</label>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            {specializations.map((spec) => {
                                const selected = form.watch("specializationIds").includes(spec.id);
                                return (
                                    <button
                                        key={spec.id}
                                        type="button"
                                        onClick={() => {
                                            const current = form.getValues("specializationIds");
                                            form.setValue("specializationIds", selected
                                                ? current.filter(id => id !== spec.id)
                                                : [...current, spec.id]);
                                        }}
                                        className={`px-2 py-1 rounded text-xs border transition-colors ${
                                            selected
                                                ? "bg-[var(--primary-teal)] text-white border-[var(--primary-teal)]"
                                                : "border-gray-300 hover:border-[var(--primary-teal)]"
                                        }`}
                                    >
                                        {spec.name}
                                    </button>
                                );
                            })}
                        </div>
                        {form.formState.errors.specializationIds && <p className="text-red-500 text-xs mt-0.5">{form.formState.errors.specializationIds.message}</p>}
                    </div>
                </div>

                {/* Booking Settings */}
                <div className="portal-card p-4 space-y-3">
                    <h2 className="text-sm font-semibold">Booking Settings</h2>
                    <div className="grid md:grid-cols-2 gap-3">
                        <div>
                            <label className="portal-label">Default Session Duration (min)</label>
                            <input type="number" {...form.register("defaultSessionDuration", { valueAsNumber: true })} className="portal-input" />
                        </div>
                        <div>
                            <label className="portal-label">Buffer Time (min)</label>
                            <input type="number" {...form.register("bufferTime", { valueAsNumber: true })} className="portal-input" />
                        </div>
                        <div>
                            <label className="portal-label">Advance Booking (days)</label>
                            <input type="number" {...form.register("advanceBookingDays", { valueAsNumber: true })} className="portal-input" />
                        </div>
                        <div>
                            <label className="portal-label">Min Booking Notice (hours)</label>
                            <input type="number" {...form.register("minBookingNotice", { valueAsNumber: true })} className="portal-input" />
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-2">
                    <Link href={`/admin/therapists/${therapist.id}`} className="portal-btn portal-btn-outline">Cancel</Link>
                    <button type="submit" disabled={isSubmitting || isUploading} className="portal-btn portal-btn-primary flex items-center gap-1.5">
                        {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
