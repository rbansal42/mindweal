import { z } from "zod";

// Booking validation schemas
export const createBookingSchema = z.object({
    therapistId: z.string().uuid(),
    sessionTypeId: z.string().uuid(),
    startDatetime: z.string().datetime(),
    endDatetime: z.string().datetime(),
    timezone: z.string().default("Asia/Kolkata"),
    clientName: z.string().min(2, "Name must be at least 2 characters"),
    clientEmail: z.string().email("Invalid email address"),
    clientPhone: z.string().optional(),
    clientNotes: z.string().optional(),
    createAccount: z.boolean().optional().default(false),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const rescheduleBookingSchema = z.object({
    startDatetime: z.string().datetime(),
    endDatetime: z.string().datetime(),
    timezone: z.string().optional(),
});

export type RescheduleBookingInput = z.infer<typeof rescheduleBookingSchema>;

export const cancelBookingSchema = z.object({
    reason: z.string().min(1, "Please provide a reason for cancellation"),
});

export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;

// Auth validation schemas
export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    phone: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
    token: z.string(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// Therapist availability schemas
export const availabilitySchema = z.object({
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
    isActive: z.boolean().default(true),
});

export type AvailabilityInput = z.infer<typeof availabilitySchema>;

export const blockedDateSchema = z.object({
    startDatetime: z.string().datetime(),
    endDatetime: z.string().datetime(),
    reason: z.string().optional(),
    isAllDay: z.boolean().default(false),
});

export type BlockedDateInput = z.infer<typeof blockedDateSchema>;

// Session type schema
export const sessionTypeSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    duration: z.number().min(15, "Duration must be at least 15 minutes"),
    meetingType: z.enum(["in_person", "video", "phone"]),
    price: z.number().optional(),
    description: z.string().optional(),
    isActive: z.boolean().default(true),
    color: z.string().default("#00A99D"),
});

export type SessionTypeInput = z.infer<typeof sessionTypeSchema>;

// Admin booking schema (can assign to any client/therapist)
export const adminBookingSchema = z.object({
    therapistId: z.string().uuid(),
    sessionTypeId: z.string().uuid(),
    startDatetime: z.string().datetime(),
    endDatetime: z.string().datetime(),
    timezone: z.string().default("Asia/Kolkata"),
    clientId: z.string().uuid().optional(),
    clientName: z.string().min(2, "Name must be at least 2 characters"),
    clientEmail: z.string().email("Invalid email address"),
    clientPhone: z.string().optional(),
    clientNotes: z.string().optional(),
    internalNotes: z.string().optional(),
    status: z.enum(["pending", "confirmed", "cancelled", "completed", "no_show"]).default("confirmed"),
});

export type AdminBookingInput = z.infer<typeof adminBookingSchema>;

// Specialization schemas
export const createSpecializationSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50),
});

export const updateSpecializationSchema = createSpecializationSchema.partial();

export type CreateSpecializationInput = z.infer<typeof createSpecializationSchema>;

// Therapist schemas
export const createTherapistSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    title: z.string().min(2, "Title must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    bio: z.string().min(50, "Bio must be at least 50 characters"),
    photoUrl: z.string().url("Invalid photo URL"),
    specializationIds: z.array(z.string().uuid()).min(1, "Select at least one specialization"),
    temporaryPassword: z.string().min(8, "Password must be at least 8 characters"),
    sessionTypes: z.array(z.object({
        name: z.string().min(2),
        duration: z.number().min(15).max(180),
        meetingType: z.enum(["in_person", "video", "phone"]),
        price: z.number().optional(),
        color: z.string().default("#00A99D"),
    })).min(1, "Add at least one session type"),
    availability: z.array(z.object({
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
        endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    })).optional(),
    defaultSessionDuration: z.number().default(60),
    bufferTime: z.number().default(15),
    advanceBookingDays: z.number().default(30),
    minBookingNotice: z.number().default(24),
});

export const updateTherapistSchema = createTherapistSchema.omit({
    temporaryPassword: true,
    sessionTypes: true,
    availability: true
}).partial();

export type CreateTherapistInput = z.infer<typeof createTherapistSchema>;
export type UpdateTherapistInput = z.infer<typeof updateTherapistSchema>;
