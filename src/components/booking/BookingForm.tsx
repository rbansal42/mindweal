"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const bookingFormSchema = z.object({
    clientName: z.string().min(2, "Name must be at least 2 characters"),
    clientEmail: z.string().email("Invalid email address"),
    clientPhone: z.string().optional(),
    clientNotes: z.string().optional(),
    createAccount: z.boolean().optional(),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
    onSubmit: (data: BookingFormData) => void;
    loading?: boolean;
    defaultValues?: Partial<BookingFormData>;
}

export default function BookingForm({
    onSubmit,
    loading = false,
    defaultValues,
}: BookingFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<BookingFormData>({
        resolver: zodResolver(bookingFormSchema),
        defaultValues: {
            clientName: defaultValues?.clientName || "",
            clientEmail: defaultValues?.clientEmail || "",
            clientPhone: defaultValues?.clientPhone || "",
            clientNotes: defaultValues?.clientNotes || "",
            createAccount: defaultValues?.createAccount || false,
        },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label
                    htmlFor="clientName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Full Name <span className="text-red-500">*</span>
                </label>
                <input
                    id="clientName"
                    type="text"
                    {...register("clientName")}
                    className={`w-full px-4 py-3 rounded-lg border ${
                        errors.clientName
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-primary"
                    } focus:ring-2 focus:border-transparent outline-none transition-all`}
                    placeholder="Enter your full name"
                />
                {errors.clientName && (
                    <p className="mt-1 text-sm text-red-500">
                        {errors.clientName.message}
                    </p>
                )}
            </div>

            <div>
                <label
                    htmlFor="clientEmail"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Email Address <span className="text-red-500">*</span>
                </label>
                <input
                    id="clientEmail"
                    type="email"
                    {...register("clientEmail")}
                    className={`w-full px-4 py-3 rounded-lg border ${
                        errors.clientEmail
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-primary"
                    } focus:ring-2 focus:border-transparent outline-none transition-all`}
                    placeholder="your@email.com"
                />
                {errors.clientEmail && (
                    <p className="mt-1 text-sm text-red-500">
                        {errors.clientEmail.message}
                    </p>
                )}
            </div>

            <div>
                <label
                    htmlFor="clientPhone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Phone Number{" "}
                    <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                    id="clientPhone"
                    type="tel"
                    {...register("clientPhone")}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="+91 98765 43210"
                />
            </div>

            <div>
                <label
                    htmlFor="clientNotes"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Notes for the Therapist{" "}
                    <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                    id="clientNotes"
                    {...register("clientNotes")}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Any specific concerns or topics you'd like to discuss..."
                />
            </div>

            <div className="flex items-start gap-3">
                <input
                    id="createAccount"
                    type="checkbox"
                    {...register("createAccount")}
                    className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label
                    htmlFor="createAccount"
                    className="text-sm text-gray-600"
                >
                    Create an account for easier booking next time (optional)
                </label>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-3 flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Booking...
                    </>
                ) : (
                    "Confirm Booking"
                )}
            </button>
        </form>
    );
}
