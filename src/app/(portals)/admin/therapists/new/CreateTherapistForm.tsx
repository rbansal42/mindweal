"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, Plus, Trash2, Loader2, Check, ChevronRight, ChevronLeft } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MEETING_TYPES = [
    { value: "in_person", label: "In Person" },
    { value: "video", label: "Video Call" },
    { value: "phone", label: "Phone Call" },
];

const sessionTypeSchema = z.object({
    name: z.string().min(2, "Name required"),
    duration: z.number().min(15).max(180),
    meetingType: z.enum(["in_person", "video", "phone"]),
    price: z.number().optional(),
    color: z.string(),
});

const availabilitySchema = z.object({
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string(),
    endTime: z.string(),
});

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    title: z.string().min(2, "Title must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    bio: z.string().min(50, "Bio must be at least 50 characters"),
    photoUrl: z.string().url("Photo is required").optional().or(z.literal("")),
    specializationIds: z.array(z.string()).min(1, "Select at least one specialization"),
    temporaryPassword: z.string().min(8, "Password must be at least 8 characters"),
    sessionTypes: z.array(sessionTypeSchema).min(1, "Add at least one session type"),
    availability: z.array(availabilitySchema).optional(),
    defaultSessionDuration: z.number(),
    bufferTime: z.number(),
    advanceBookingDays: z.number(),
    minBookingNotice: z.number(),
});

type FormData = z.infer<typeof formSchema>;

interface Specialization {
    id: string;
    name: string;
}

interface Props {
    specializations: Specialization[];
}

export default function CreateTherapistForm({ specializations }: Props) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { startUpload, isUploading } = useUploadThing("therapistPhoto");

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            title: "",
            email: "",
            phone: "",
            bio: "",
            photoUrl: "",
            specializationIds: [],
            temporaryPassword: "",
            sessionTypes: [{ name: "", duration: 60, meetingType: "video", price: undefined, color: "#00A99D" }],
            availability: [],
            defaultSessionDuration: 60,
            bufferTime: 15,
            advanceBookingDays: 30,
            minBookingNotice: 24,
        },
    });

    const { fields: sessionFields, append: addSession, remove: removeSession } = useFieldArray({
        control: form.control,
        name: "sessionTypes",
    });

    const { fields: availFields, append: addAvail, remove: removeAvail } = useFieldArray({
        control: form.control,
        name: "availability",
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
            // Upload photo first if exists
            let photoUrl = data.photoUrl;
            if (photoFile) {
                const uploadResult = await startUpload([photoFile]);
                if (uploadResult?.[0]?.ufsUrl) {
                    photoUrl = uploadResult[0].ufsUrl;
                }
            }

            // Create therapist
            const res = await fetch("/api/admin/therapists", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...data,
                    photoUrl,
                }),
            });

            const result = await res.json();
            if (!res.ok) {
                throw new Error(typeof result.error === "string" ? result.error : "Failed to create therapist");
            }

            router.push(`/admin/therapists/${result.therapist.id}`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = async () => {
        let valid = false;
        if (step === 1) {
            valid = await form.trigger(["name", "title", "email", "phone", "bio", "specializationIds"]);
        } else if (step === 2) {
            valid = await form.trigger(["sessionTypes"]);
        } else if (step === 3) {
            valid = true; // Availability is optional
        }
        if (valid) setStep(step + 1);
    };

    const STEPS = ["Profile", "Sessions", "Availability", "Review"];

    return (
        <div className="max-w-3xl">
            {/* Progress */}
            <div className="flex items-center gap-2 mb-8">
                {STEPS.map((s, i) => (
                    <div key={s} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            i + 1 < step ? "bg-green-500 text-white" :
                            i + 1 === step ? "bg-[var(--primary-teal)] text-white" :
                            "bg-gray-200 text-gray-500"
                        }`}>
                            {i + 1 < step ? <Check className="w-4 h-4" /> : i + 1}
                        </div>
                        <span className={`ml-2 text-sm ${i + 1 === step ? "font-medium" : "text-gray-500"}`}>{s}</span>
                        {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />}
                    </div>
                ))}
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            <form onSubmit={form.handleSubmit(handleSubmit)}>
                {/* Step 1: Profile */}
                {step === 1 && (
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
                                <input {...form.register("title")} placeholder="e.g., Licensed Clinical Psychologist" className="w-full px-3 py-2 border rounded-lg" />
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
                            <textarea {...form.register("bio")} rows={5} className="w-full px-3 py-2 border rounded-lg" placeholder="Describe the therapist's background, approach, and expertise..." />
                            {form.formState.errors.bio && <p className="text-red-500 text-xs mt-1">{form.formState.errors.bio.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Photo</label>
                            <div className="flex items-center gap-4">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover" />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                                        <Upload className="w-6 h-6 text-gray-400" />
                                    </div>
                                )}
                                <div>
                                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" id="photo-upload" />
                                    <label htmlFor="photo-upload" className="btn btn-outline cursor-pointer">
                                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Choose Photo"}
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
                                                if (selected) {
                                                    form.setValue("specializationIds", current.filter(id => id !== spec.id));
                                                } else {
                                                    form.setValue("specializationIds", [...current, spec.id]);
                                                }
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
                )}

                {/* Step 2: Session Types */}
                {step === 2 && (
                    <div className="card p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Session Types</h2>
                            <button
                                type="button"
                                onClick={() => addSession({ name: "", duration: 60, meetingType: "video", price: undefined, color: "#00A99D" })}
                                className="text-[var(--primary-teal)] text-sm flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Add Session Type
                            </button>
                        </div>

                        {sessionFields.map((field, index) => (
                            <div key={field.id} className="p-4 bg-gray-50 rounded-lg space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Session Type {index + 1}</span>
                                    {sessionFields.length > 1 && (
                                        <button type="button" onClick={() => removeSession(index)} className="text-red-500">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm mb-1">Name</label>
                                        <input {...form.register(`sessionTypes.${index}.name`)} placeholder="e.g., Initial Consultation" className="w-full px-3 py-2 border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1">Duration (min)</label>
                                        <input type="number" {...form.register(`sessionTypes.${index}.duration`, { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-lg" />
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm mb-1">Meeting Type</label>
                                        <select {...form.register(`sessionTypes.${index}.meetingType`)} className="w-full px-3 py-2 border rounded-lg">
                                            {MEETING_TYPES.map(mt => <option key={mt.value} value={mt.value}>{mt.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1">Price (optional)</label>
                                        <input type="number" {...form.register(`sessionTypes.${index}.price`, { valueAsNumber: true })} placeholder="e.g., 2500" className="w-full px-3 py-2 border rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {form.formState.errors.sessionTypes && <p className="text-red-500 text-xs">{form.formState.errors.sessionTypes.message}</p>}
                    </div>
                )}

                {/* Step 3: Availability */}
                {step === 3 && (
                    <div className="card p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold">Weekly Availability</h2>
                                <p className="text-sm text-gray-500">Optional - therapist can set this later</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => addAvail({ dayOfWeek: 1, startTime: "09:00", endTime: "17:00" })}
                                className="text-[var(--primary-teal)] text-sm flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Add Slot
                            </button>
                        </div>

                        {availFields.length === 0 && (
                            <p className="text-gray-500 text-center py-8">No availability set. Click &quot;Add Slot&quot; to add.</p>
                        )}

                        {availFields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                <select {...form.register(`availability.${index}.dayOfWeek`, { valueAsNumber: true })} className="px-3 py-2 border rounded-lg">
                                    {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                                </select>
                                <input type="time" {...form.register(`availability.${index}.startTime`)} className="px-3 py-2 border rounded-lg" />
                                <span>to</span>
                                <input type="time" {...form.register(`availability.${index}.endTime`)} className="px-3 py-2 border rounded-lg" />
                                <button type="button" onClick={() => removeAvail(index)} className="text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Step 4: Review & Account */}
                {step === 4 && (
                    <div className="space-y-6">
                        <div className="card p-6 space-y-4">
                            <h2 className="text-lg font-semibold">Account Setup</h2>
                            <div>
                                <label className="block text-sm font-medium mb-1">Temporary Password *</label>
                                <input type="password" {...form.register("temporaryPassword")} className="w-full px-3 py-2 border rounded-lg" placeholder="Minimum 8 characters" />
                                {form.formState.errors.temporaryPassword && <p className="text-red-500 text-xs mt-1">{form.formState.errors.temporaryPassword.message}</p>}
                                <p className="text-xs text-gray-500 mt-1">Therapist will receive this via email and should change it on first login</p>
                            </div>
                        </div>

                        <div className="card p-6">
                            <h2 className="text-lg font-semibold mb-4">Review</h2>
                            <dl className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Name</dt>
                                    <dd className="font-medium">{form.watch("name")}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Email</dt>
                                    <dd>{form.watch("email")}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Session Types</dt>
                                    <dd>{form.watch("sessionTypes").length}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Specializations</dt>
                                    <dd>{form.watch("specializationIds").length} selected</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-6">
                    {step > 1 ? (
                        <button type="button" onClick={() => setStep(step - 1)} className="btn btn-outline flex items-center gap-2">
                            <ChevronLeft className="w-4 h-4" /> Previous
                        </button>
                    ) : <div />}

                    {step < 4 ? (
                        <button type="button" onClick={nextStep} className="btn btn-primary flex items-center gap-2">
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button type="submit" disabled={isSubmitting || isUploading} className="btn btn-primary flex items-center gap-2">
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Create Therapist
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
