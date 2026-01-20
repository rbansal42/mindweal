"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Lock, Check } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type PasswordFormData = z.infer<typeof passwordSchema>;

interface ProfileFormProps {
    user: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        image?: string | null;
    };
}

export default function ProfileForm({ user }: ProfileFormProps) {
    const router = useRouter();
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const {
        register: registerProfile,
        handleSubmit: handleProfileSubmit,
        formState: { errors: profileErrors },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user.name,
            phone: user.phone || "",
        },
    });

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        formState: { errors: passwordErrors },
        reset: resetPassword,
    } = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
    });

    const onProfileSubmit = async (data: ProfileFormData) => {
        setProfileLoading(true);
        setProfileSuccess(false);

        try {
            await authClient.updateUser({
                name: data.name,
            });
            setProfileSuccess(true);
            router.refresh();
            setTimeout(() => setProfileSuccess(false), 3000);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile");
        } finally {
            setProfileLoading(false);
        }
    };

    const onPasswordSubmit = async (data: PasswordFormData) => {
        setPasswordLoading(true);
        setPasswordSuccess(false);

        try {
            await authClient.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            setPasswordSuccess(true);
            resetPassword();
            setTimeout(() => setPasswordSuccess(false), 3000);
        } catch (error: any) {
            console.error("Error changing password:", error);
            alert(error?.message || "Failed to change password");
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Profile Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <User className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        Profile Information
                    </h2>
                </div>

                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={user.email}
                            disabled
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Email cannot be changed
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            {...registerProfile("name")}
                            className={`w-full px-4 py-3 rounded-lg border ${
                                profileErrors.name
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-primary"
                            } focus:ring-2 focus:border-transparent outline-none transition-all`}
                        />
                        {profileErrors.name && (
                            <p className="mt-1 text-sm text-red-500">
                                {profileErrors.name.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Phone Number
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            {...registerProfile("phone")}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="+91 98765 43210"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={profileLoading}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        {profileLoading ? (
                            <>
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                Saving...
                            </>
                        ) : profileSuccess ? (
                            <>
                                <Check className="w-4 h-4" />
                                Saved!
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </form>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Lock className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        Change Password
                    </h2>
                </div>

                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                    <div>
                        <label
                            htmlFor="currentPassword"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Current Password
                        </label>
                        <input
                            id="currentPassword"
                            type="password"
                            {...registerPassword("currentPassword")}
                            className={`w-full px-4 py-3 rounded-lg border ${
                                passwordErrors.currentPassword
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-primary"
                            } focus:ring-2 focus:border-transparent outline-none transition-all`}
                        />
                        {passwordErrors.currentPassword && (
                            <p className="mt-1 text-sm text-red-500">
                                {passwordErrors.currentPassword.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="newPassword"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            New Password
                        </label>
                        <input
                            id="newPassword"
                            type="password"
                            {...registerPassword("newPassword")}
                            className={`w-full px-4 py-3 rounded-lg border ${
                                passwordErrors.newPassword
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-primary"
                            } focus:ring-2 focus:border-transparent outline-none transition-all`}
                        />
                        {passwordErrors.newPassword && (
                            <p className="mt-1 text-sm text-red-500">
                                {passwordErrors.newPassword.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Confirm New Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            {...registerPassword("confirmPassword")}
                            className={`w-full px-4 py-3 rounded-lg border ${
                                passwordErrors.confirmPassword
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-primary"
                            } focus:ring-2 focus:border-transparent outline-none transition-all`}
                        />
                        {passwordErrors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-500">
                                {passwordErrors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={passwordLoading}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        {passwordLoading ? (
                            <>
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                Updating...
                            </>
                        ) : passwordSuccess ? (
                            <>
                                <Check className="w-4 h-4" />
                                Password Changed!
                            </>
                        ) : (
                            "Change Password"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
