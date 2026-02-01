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
            <div className="flex items-center gap-1.5 mb-4">
                {STEPS.map((s, i) => (
                    <div key={s} className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            i + 1 < step ? "bg-green-500 text-white" :
                            i + 1 === step ? "bg-[var(--primary-teal)] text-white" :
                            "bg-gray-200 text-gray-500"
                        }`}>
                            {i + 1 < step ? <Check className="w-3 h-3" /> : i + 1}
                        </div>
                        <span className={`ml-1.5 text-xs ${i + 1 === step ? "font-medium" : "text-gray-500"}`}>{s}</span>
                        {i < STEPS.length - 1 && <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-gray-300" />}
                    </div>
                ))}
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={form.handleSubmit(handleSubmit)}>
                {/* Step 1: Profile */}
                {step === 1 && (
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
                                <input {...form.register("title")} placeholder="e.g., Licensed Clinical Psychologist" className="portal-input" />
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
                            <textarea {...form.register("bio")} rows={4} className="portal-input" placeholder="Describe the therapist's background, approach, and expertise..." />
                            {form.formState.errors.bio && <p className="text-red-500 text-xs mt-0.5">{form.formState.errors.bio.message}</p>}
                        </div>

                        <div>
                            <label className="portal-label">Photo</label>
                            <div className="flex items-center gap-3">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                                        <Upload className="w-5 h-5 text-gray-400" />
                                    </div>
                                )}
                                <div>
                                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" id="photo-upload" />
                                    <label htmlFor="photo-upload" className="portal-btn portal-btn-outline cursor-pointer">
                                        {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Choose Photo"}
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
                                                if (selected) {
                                                    form.setValue("specializationIds", current.filter(id => id !== spec.id));
                                                } else {
                                                    form.setValue("specializationIds", [...current, spec.id]);
                                                }
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
                )}

                {/* Step 2: Session Types */}
                {step === 2 && (
                    <div className="portal-card p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold">Session Types</h2>
                            <button
                                type="button"
                                onClick={() => addSession({ name: "", duration: 60, meetingType: "video", price: undefined, color: "#00A99D" })}
                                className="text-[var(--primary-teal)] text-xs flex items-center gap-1"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add Session Type
                            </button>
                        </div>

                        {sessionFields.map((field, index) => (
                            <div key={field.id} className="p-3 bg-gray-50 rounded-lg space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium">Session Type {index + 1}</span>
                                    {sessionFields.length > 1 && (
                                        <button type="button" onClick={() => removeSession(index)} className="text-red-500">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                                <div className="grid md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="portal-label">Name</label>
                                        <input {...form.register(`sessionTypes.${index}.name`)} placeholder="e.g., Initial Consultation" className="portal-input" />
                                    </div>
                                    <div>
                                        <label className="portal-label">Duration (min)</label>
                                        <input type="number" {...form.register(`sessionTypes.${index}.duration`, { valueAsNumber: true })} className="portal-input" />
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="portal-label">Meeting Type</label>
                                        <select {...form.register(`sessionTypes.${index}.meetingType`)} className="portal-input">
                                            {MEETING_TYPES.map(mt => <option key={mt.value} value={mt.value}>{mt.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="portal-label">Price (optional)</label>
                                        <input type="number" {...form.register(`sessionTypes.${index}.price`, { valueAsNumber: true })} placeholder="e.g., 2500" className="portal-input" />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {form.formState.errors.sessionTypes && <p className="text-red-500 text-xs">{form.formState.errors.sessionTypes.message}</p>}
                    </div>
                )}

                {/* Step 3: Availability */}
                {step === 3 && (
                    <div className="portal-card p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-semibold">Weekly Availability</h2>
                                <p className="text-xs text-gray-500">Optional - therapist can set this later</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => addAvail({ dayOfWeek: 1, startTime: "09:00", endTime: "17:00" })}
                                className="text-[var(--primary-teal)] text-xs flex items-center gap-1"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add Slot
                            </button>
                        </div>

                        {availFields.length === 0 && (
                            <p className="text-gray-500 text-center py-6 text-sm">No availability set. Click &quot;Add Slot&quot; to add.</p>
                        )}

                        {availFields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <select {...form.register(`availability.${index}.dayOfWeek`, { valueAsNumber: true })} className="portal-input">
                                    {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                                </select>
                                <input type="time" {...form.register(`availability.${index}.startTime`)} className="portal-input" />
                                <span className="text-xs text-gray-500">to</span>
                                <input type="time" {...form.register(`availability.${index}.endTime`)} className="portal-input" />
                                <button type="button" onClick={() => removeAvail(index)} className="text-red-500">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Step 4: Review & Account */}
                {step === 4 && (
                    <div className="space-y-3">
                        <div className="portal-card p-4 space-y-3">
                            <h2 className="text-sm font-semibold">Account Setup</h2>
                            <div>
                                <label className="portal-label">Temporary Password *</label>
                                <input type="password" {...form.register("temporaryPassword")} className="portal-input" placeholder="Minimum 8 characters" />
                                {form.formState.errors.temporaryPassword && <p className="text-red-500 text-xs mt-0.5">{form.formState.errors.temporaryPassword.message}</p>}
                                <p className="text-xs text-gray-500 mt-1">Therapist will receive this via email and should change it on first login</p>
                            </div>
                        </div>

                        <div className="portal-card p-4">
                            <h2 className="text-sm font-semibold mb-3">Review</h2>
                            <dl className="space-y-2 text-sm">
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
                <div className="flex justify-between mt-4">
                    {step > 1 ? (
                        <button type="button" onClick={() => setStep(step - 1)} className="portal-btn portal-btn-outline flex items-center gap-1.5">
                            <ChevronLeft className="w-3.5 h-3.5" /> Previous
                        </button>
                    ) : <div />}

                    {step < 4 ? (
                        <button type="button" onClick={nextStep} className="portal-btn portal-btn-primary flex items-center gap-1.5">
                            Next <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    ) : (
                        <button type="submit" disabled={isSubmitting || isUploading} className="portal-btn portal-btn-primary flex items-center gap-1.5">
                            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            Create Therapist
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
