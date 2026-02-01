"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import Link from "next/link";
import GoogleButton from "./GoogleButton";

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().optional(),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await signUp.email({
                email: data.email,
                password: data.password,
                name: data.name,
            });

            if (result.error) {
                setError(result.error.message || "Registration failed. Please try again.");
                return;
            }

            setSuccess(true);
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
            console.error("Registration error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="w-full max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
                    <p className="text-gray-600 mb-6">
                        We&apos;ve sent a verification link to your email address. Please click the link to verify your account.
                    </p>
                    <Link href="/auth/login" className="btn btn-primary">
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                    <p className="text-gray-600 mt-2">
                        Join Mindweal by Pihu Suri
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label htmlFor="name" className="label">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            {...register("name")}
                            className={`input ${errors.name ? "input-error" : ""}`}
                            placeholder="Your full name"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="email" className="label">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            {...register("email")}
                            className={`input ${errors.email ? "input-error" : ""}`}
                            placeholder="you@example.com"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="phone" className="label">
                            Phone Number <span className="text-gray-400">(optional)</span>
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            {...register("phone")}
                            className="input"
                            placeholder="+91 9876543210"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="label">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="password"
                            type="password"
                            {...register("password")}
                            className={`input ${errors.password ? "input-error" : ""}`}
                            placeholder="Create a strong password"
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Min 8 characters with uppercase, lowercase, and number
                        </p>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="label">
                            Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            {...register("confirmPassword")}
                            className={`input ${errors.confirmPassword ? "input-error" : ""}`}
                            placeholder="Confirm your password"
                        />
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary w-full"
                    >
                        {isLoading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500">or continue with</span>
                    </div>
                </div>

                <GoogleButton />

                <p className="mt-6 text-center text-gray-600">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="text-primary font-medium hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
