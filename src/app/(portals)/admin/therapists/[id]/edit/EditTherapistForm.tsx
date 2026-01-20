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
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
            )}

            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Profile Info */}
                <div className="card p-6 space-y-6">
                    <h2 className="text-lg font-semibold">Profile Information</h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Name *</label>
                            <input {...form.register("name")} className="w-full px-3 py-2 border rounded-lg" />
                            {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Title *</label>
                            <input {...form.register("title")} className="w-full px-3 py-2 border rounded-lg" />
                            {form.formState.errors.title && <p className="text-red-500 text-xs mt-1">{form.formState.errors.title.message}</p>}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Email *</label>
                            <input type="email" {...form.register("email")} className="w-full px-3 py-2 border rounded-lg" />
                            {form.formState.errors.email && <p className="text-red-500 text-xs mt-1">{form.formState.errors.email.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Phone *</label>
                            <input {...form.register("phone")} className="w-full px-3 py-2 border rounded-lg" />
                            {form.formState.errors.phone && <p className="text-red-500 text-xs mt-1">{form.formState.errors.phone.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Bio *</label>
                        <textarea {...form.register("bio")} rows={5} className="w-full px-3 py-2 border rounded-lg" />
                        {form.formState.errors.bio && <p className="text-red-500 text-xs mt-1">{form.formState.errors.bio.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Photo</label>
                        <div className="flex items-center gap-4">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover" />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                                    <User className="w-6 h-6 text-gray-400" />
                                </div>
                            )}
                            <div>
                                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" id="photo-upload" />
                                <label htmlFor="photo-upload" className="btn btn-outline cursor-pointer">
                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Change Photo"}
                                </label>
                                <p className="text-xs text-gray-500 mt-1">Max 4MB, will be optimized to WebP</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Specializations *</label>
                        <div className="flex flex-wrap gap-2">
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
                                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
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
                        {form.formState.errors.specializationIds && <p className="text-red-500 text-xs mt-1">{form.formState.errors.specializationIds.message}</p>}
                    </div>
                </div>

                {/* Booking Settings */}
                <div className="card p-6 space-y-4">
                    <h2 className="text-lg font-semibold">Booking Settings</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Default Session Duration (min)</label>
                            <input type="number" {...form.register("defaultSessionDuration", { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Buffer Time (min)</label>
                            <input type="number" {...form.register("bufferTime", { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Advance Booking (days)</label>
                            <input type="number" {...form.register("advanceBookingDays", { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Min Booking Notice (hours)</label>
                            <input type="number" {...form.register("minBookingNotice", { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3">
                    <Link href={`/admin/therapists/${therapist.id}`} className="btn btn-outline">Cancel</Link>
                    <button type="submit" disabled={isSubmitting || isUploading} className="btn btn-primary flex items-center gap-2">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
