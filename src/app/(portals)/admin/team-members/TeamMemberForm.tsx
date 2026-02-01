"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { createTeamMemberSchema } from "@/lib/validation";

interface TeamMemberFormProps {
    initialData?: {
        id: string;
        name: string;
        role: string;
        qualifications: string | null;
        bio: string;
        photoUrl: string | null;
        email: string | null;
        phone: string | null;
        location: string | null;
        educationalQualifications: string[] | null;
        professionalExperience: string[] | null;
        areasOfExpertise: string[] | null;
        therapeuticApproach: string | null;
        therapyModalities: string[] | null;
        servicesOffered: string[] | null;
        focusAreas: string[] | null;
        professionalValues: string[] | null;
        quote: string | null;
        displayOrder: number;
        isActive: boolean;
    };
    mode: "create" | "edit";
}

export function TeamMemberForm({ initialData, mode }: TeamMemberFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
    const [bio, setBio] = useState(initialData?.bio ?? "");
    const [photoUrl, setPhotoUrl] = useState<string | null>(initialData?.photoUrl ?? null);
    
    // Array fields
    const [educationalQualifications, setEducationalQualifications] = useState<string[]>(
        initialData?.educationalQualifications ?? []
    );
    const [professionalExperience, setProfessionalExperience] = useState<string[]>(
        initialData?.professionalExperience ?? []
    );
    const [areasOfExpertise, setAreasOfExpertise] = useState<string[]>(
        initialData?.areasOfExpertise ?? []
    );
    const [therapyModalities, setTherapyModalities] = useState<string[]>(
        initialData?.therapyModalities ?? []
    );
    const [servicesOffered, setServicesOffered] = useState<string[]>(
        initialData?.servicesOffered ?? []
    );
    const [focusAreas, setFocusAreas] = useState<string[]>(
        initialData?.focusAreas ?? []
    );
    const [professionalValues, setProfessionalValues] = useState<string[]>(
        initialData?.professionalValues ?? []
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(createTeamMemberSchema),
        defaultValues: {
            name: initialData?.name ?? "",
            role: initialData?.role ?? "",
            qualifications: initialData?.qualifications ?? "",
            bio: initialData?.bio ?? "",
            email: initialData?.email ?? "",
            phone: initialData?.phone ?? "",
            location: initialData?.location ?? "",
            therapeuticApproach: initialData?.therapeuticApproach ?? "",
            quote: initialData?.quote ?? "",
            displayOrder: initialData?.displayOrder ?? 0,
            isActive: initialData?.isActive ?? true,
        },
    });

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                bio,
                photoUrl,
                educationalQualifications: educationalQualifications.length > 0 ? educationalQualifications : null,
                professionalExperience: professionalExperience.length > 0 ? professionalExperience : null,
                areasOfExpertise: areasOfExpertise.length > 0 ? areasOfExpertise : null,
                therapyModalities: therapyModalities.length > 0 ? therapyModalities : null,
                servicesOffered: servicesOffered.length > 0 ? servicesOffered : null,
                focusAreas: focusAreas.length > 0 ? focusAreas : null,
                professionalValues: professionalValues.length > 0 ? professionalValues : null,
                isActive,
            };

            const url = mode === "create"
                ? "/api/admin/team-members"
                : `/api/admin/team-members/${initialData?.id}`;
            const method = mode === "create" ? "POST" : "PUT";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to save team member");
            }

            router.push("/admin/team-members");
            router.refresh();
        } catch (error) {
            console.error("Error saving team member:", error);
            alert(error instanceof Error ? error.message : "Failed to save team member");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper component for array inputs
    const ArrayInput = ({
        label,
        items,
        setItems,
        placeholder,
    }: {
        label: string;
        items: string[];
        setItems: (items: string[]) => void;
        placeholder: string;
    }) => {
        const [newItem, setNewItem] = useState("");

        const addItem = () => {
            const trimmed = newItem.trim();
            if (trimmed && !items.includes(trimmed)) {
                setItems([...items, trimmed]);
                setNewItem("");
            }
        };

        const removeItem = (index: number) => {
            setItems(items.filter((_, i) => i !== index));
        };

        return (
            <div>
                <label className="portal-label">{label}</label>
                <div className="flex gap-2 mb-1">
                    <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                addItem();
                            }
                        }}
                        className="portal-input flex-1"
                        placeholder={placeholder}
                    />
                    <button
                        type="button"
                        onClick={addItem}
                        className="portal-btn portal-btn-primary portal-btn-sm flex items-center"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
                {items.length > 0 && (
                    <ul className="space-y-1">
                        {items.map((item, index) => (
                            <li
                                key={index}
                                className="flex items-center justify-between bg-gray-50 px-2 py-1.5 rounded text-sm"
                            >
                                <span className="text-gray-700">{item}</span>
                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-3">
                <h3 className="portal-section-title">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="portal-label">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            {...register("name")}
                            className="portal-input"
                            placeholder="e.g., Ms. Pihu Suri"
                        />
                        {errors.name && (
                            <p className="mt-0.5 text-xs text-red-600">{errors.name.message as string}</p>
                        )}
                    </div>

                    {/* Role */}
                    <div>
                        <label htmlFor="role" className="portal-label">
                            Role <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="role"
                            type="text"
                            {...register("role")}
                            className="portal-input"
                            placeholder="e.g., Founder & Lead Psychologist"
                        />
                        {errors.role && (
                            <p className="mt-0.5 text-xs text-red-600">{errors.role.message as string}</p>
                        )}
                    </div>

                    {/* Qualifications */}
                    <div>
                        <label htmlFor="qualifications" className="portal-label">
                            Qualifications (Summary)
                        </label>
                        <input
                            id="qualifications"
                            type="text"
                            {...register("qualifications")}
                            className="portal-input"
                            placeholder="e.g., B.A., M.Sc. Clinical Psychology"
                        />
                    </div>

                    {/* Display Order */}
                    <div>
                        <label htmlFor="displayOrder" className="portal-label">
                            Display Order
                        </label>
                        <input
                            id="displayOrder"
                            type="number"
                            {...register("displayOrder", { valueAsNumber: true })}
                            className="portal-input"
                            placeholder="0"
                        />
                        <p className="mt-0.5 text-xs text-gray-500">Lower numbers appear first</p>
                    </div>
                </div>

                {/* Photo */}
                <div>
                    <label className="portal-label">Photo</label>
                    <ImageUploader value={photoUrl} onChange={setPhotoUrl} />
                </div>

                {/* Bio */}
                <div>
                    <label className="portal-label">
                        Bio <span className="text-red-500">*</span>
                    </label>
                    <RichTextEditor
                        content={bio}
                        onChange={setBio}
                        placeholder="Write a bio for this team member..."
                    />
                </div>

                {/* Quote */}
                <div>
                    <label htmlFor="quote" className="portal-label">
                        Personal Quote
                    </label>
                    <textarea
                        id="quote"
                        {...register("quote")}
                        rows={2}
                        className="portal-input"
                        placeholder="A personal quote or philosophy..."
                    />
                </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
                <h3 className="portal-section-title">Contact Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                        <label htmlFor="email" className="portal-label">Email</label>
                        <input
                            id="email"
                            type="email"
                            {...register("email")}
                            className="portal-input"
                        />
                    </div>

                    <div>
                        <label htmlFor="phone" className="portal-label">Phone</label>
                        <input
                            id="phone"
                            type="text"
                            {...register("phone")}
                            className="portal-input"
                        />
                    </div>

                    <div>
                        <label htmlFor="location" className="portal-label">Location</label>
                        <input
                            id="location"
                            type="text"
                            {...register("location")}
                            className="portal-input"
                            placeholder="e.g., Delhi, India"
                        />
                    </div>
                </div>
            </div>

            {/* Professional Details */}
            <div className="space-y-3">
                <h3 className="portal-section-title">Professional Details</h3>

                <ArrayInput
                    label="Educational Qualifications"
                    items={educationalQualifications}
                    setItems={setEducationalQualifications}
                    placeholder="e.g., Ph.D. (Psychology), Jamia Millia Islamia"
                />

                <ArrayInput
                    label="Professional Experience"
                    items={professionalExperience}
                    setItems={setProfessionalExperience}
                    placeholder="e.g., AIIMS, New Delhi - Senior Research Fellow (2014-2022)"
                />

                <ArrayInput
                    label="Areas of Expertise"
                    items={areasOfExpertise}
                    setItems={setAreasOfExpertise}
                    placeholder="e.g., Child & Adolescent Psychology"
                />

                <div>
                    <label htmlFor="therapeuticApproach" className="portal-label">
                        Therapeutic Approach
                    </label>
                    <input
                        id="therapeuticApproach"
                        type="text"
                        {...register("therapeuticApproach")}
                        className="portal-input"
                        placeholder="e.g., Eclectic Therapy Approach"
                    />
                </div>

                <ArrayInput
                    label="Therapy Modalities"
                    items={therapyModalities}
                    setItems={setTherapyModalities}
                    placeholder="e.g., Cognitive Behavioural Therapy (CBT)"
                />

                <ArrayInput
                    label="Services Offered"
                    items={servicesOffered}
                    setItems={setServicesOffered}
                    placeholder="e.g., Individual Therapy"
                />

                <ArrayInput
                    label="Focus Areas"
                    items={focusAreas}
                    setItems={setFocusAreas}
                    placeholder="e.g., Emotional Healing & Self-Exploration"
                />

                <ArrayInput
                    label="Professional Values"
                    items={professionalValues}
                    setItems={setProfessionalValues}
                    placeholder="e.g., Gender-Inclusive Practice"
                />
            </div>

            {/* Status */}
            <div className="space-y-2">
                <h3 className="portal-section-title">Status</h3>
                
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsActive(!isActive)}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 ${
                            isActive ? "bg-teal-600" : "bg-gray-200"
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                isActive ? "translate-x-4" : "translate-x-0"
                            }`}
                        />
                    </button>
                    <span className="text-sm text-gray-700">
                        {isActive ? "Active (visible on website)" : "Inactive (hidden from website)"}
                    </span>
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                    type="button"
                    onClick={() => router.push("/admin/team-members")}
                    className="portal-btn portal-btn-secondary portal-btn-sm"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="portal-btn portal-btn-primary portal-btn-sm"
                >
                    {isSubmitting
                        ? "Saving..."
                        : mode === "create"
                        ? "Create Team Member"
                        : "Save Changes"}
                </button>
            </div>
        </form>
    );
}
