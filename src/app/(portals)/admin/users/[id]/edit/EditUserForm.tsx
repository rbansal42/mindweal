"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft, Mail, User as UserIcon, Phone, Globe, AlertCircle } from "lucide-react";
import Link from "next/link";
import { getAvailableRoles } from "@/lib/permissions";
import type { UserRole } from "@/entities/User";

const formSchema = z.object({
    email: z.string().email("Invalid email address"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    role: z.enum(["client", "therapist", "admin", "reception"]),
    phone: z.string().optional(),
    timezone: z.string(),
    active: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

const TIMEZONES = [
    { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
    { value: "America/New_York", label: "America/New_York (EST)" },
    { value: "America/Los_Angeles", label: "America/Los_Angeles (PST)" },
    { value: "Europe/London", label: "Europe/London (GMT)" },
    { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
];

interface Props {
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
        phone: string;
        timezone: string;
        active: boolean;
    };
    currentUserRole: UserRole | null | undefined;
    currentUserId: string;
}

export default function EditUserForm({ user, currentUserRole, currentUserId }: Props) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [emailChangeWarning, setEmailChangeWarning] = useState(false);

    const availableRoles = getAvailableRoles(currentUserRole);
    const isSelf = user.id === currentUserId;

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: user.email,
            name: user.name,
            role: user.role as any,
            phone: user.phone,
            timezone: user.timezone,
            active: user.active,
        },
    });

    const watchEmail = form.watch("email");

    // Show warning if email changed
    if (watchEmail !== user.email && !emailChangeWarning) {
        setEmailChangeWarning(true);
    } else if (watchEmail === user.email && emailChangeWarning) {
        setEmailChangeWarning(false);
    }

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`/api/admin/users/${user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to update user");
            }

            // Success
            if (result.emailChanged) {
                alert("User updated! A verification email has been sent to the new email address.");
            }

            router.push("/admin/users");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update user");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="portal-card">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                {emailChangeWarning && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-800">
                            <strong>Email changed:</strong> A verification email will be sent to the new address.
                            The user must verify before logging in.
                        </p>
                    </div>
                )}

                {isSelf && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-800">
                            You are editing your own account. You cannot demote yourself from admin or deactivate
                            your account.
                        </p>
                    </div>
                )}

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="email"
                            {...form.register("email")}
                            className="portal-input pl-10"
                            placeholder="user@example.com"
                        />
                    </div>
                    {form.formState.errors.email && (
                        <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.email.message}
                        </p>
                    )}
                </div>

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            {...form.register("name")}
                            className="portal-input pl-10"
                            placeholder="John Doe"
                        />
                    </div>
                    {form.formState.errors.name && (
                        <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.name.message}
                        </p>
                    )}
                </div>

                {/* Role */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...form.register("role")}
                        className="portal-input"
                        disabled={currentUserRole === "reception"}
                    >
                        {availableRoles.map((role) => (
                            <option key={role} value={role}>
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                            </option>
                        ))}
                    </select>
                    {form.formState.errors.role && (
                        <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.role.message}
                        </p>
                    )}
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone (optional)
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="tel"
                            {...form.register("phone")}
                            className="portal-input pl-10"
                            placeholder="+91 98765 43210"
                        />
                    </div>
                </div>

                {/* Timezone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Timezone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select {...form.register("timezone")} className="portal-input pl-10">
                            {TIMEZONES.map((tz) => (
                                <option key={tz.value} value={tz.value}>
                                    {tz.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Active Status */}
                <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            {...form.register("active")}
                            className="w-4 h-4 text-primary rounded focus:ring-primary"
                            disabled={isSelf}
                        />
                        <span className="text-sm font-medium text-gray-700">
                            Account Active
                        </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                        Inactive users cannot log in. Data is preserved and account can be reactivated.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                    <Link href="/admin/users" className="btn-secondary">
                        <ArrowLeft className="w-4 h-4" />
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
