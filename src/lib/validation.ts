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
    bookingEmail: z.string().email().optional(), // For ownership verification
});

export type RescheduleBookingInput = z.infer<typeof rescheduleBookingSchema>;

export const cancelBookingSchema = z.object({
    reason: z.string().min(1, "Please provide a reason for cancellation"),
    bookingEmail: z.string().email().optional(), // For ownership verification
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

// Program schemas
export const createProgramSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters").max(255),
    description: z.string().min(10, "Description must be at least 10 characters"),
    duration: z.string().min(1, "Duration is required").max(100),
    coverImage: z.string().url("Invalid cover image URL").nullable().optional(),
    benefits: z.array(z.string()).nullable().optional(),
    category: z.enum(["therapy-service", "professional-programs", "workshop"]).default("therapy-service"),
    status: z.enum(["draft", "published"]).default("draft"),
    isActive: z.boolean().default(true),
});

export const updateProgramSchema = createProgramSchema.partial();

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;

// Job Posting schemas
export const createJobPostingSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters").max(255),
    department: z.string().min(2, "Department must be at least 2 characters").max(100),
    description: z.string().min(10, "Description must be at least 10 characters"),
    requirements: z.string().nullable().optional(),
    location: z.string().min(2, "Location must be at least 2 characters").max(100),
    type: z.enum(["full-time", "part-time", "contract"]),
    status: z.enum(["draft", "published"]).default("draft"),
    isActive: z.boolean().default(true),
});

export const updateJobPostingSchema = createJobPostingSchema.partial();

export type CreateJobPostingInput = z.infer<typeof createJobPostingSchema>;
export type UpdateJobPostingInput = z.infer<typeof updateJobPostingSchema>;

// Community Program schemas
export const createCommunityProgramSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(255),
    description: z.string().min(10, "Description must be at least 10 characters"),
    schedule: z.string().min(2, "Schedule must be at least 2 characters").max(255),
    coverImage: z.string().url("Invalid image URL").nullable().optional(),
    status: z.enum(["draft", "published"]).default("draft"),
    isActive: z.boolean().default(true),
});

export const updateCommunityProgramSchema = createCommunityProgramSchema.partial();

export type CreateCommunityProgramInput = z.infer<typeof createCommunityProgramSchema>;
export type UpdateCommunityProgramInput = z.infer<typeof updateCommunityProgramSchema>;

// Team Member schemas
export const createTeamMemberSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(255),
    role: z.string().min(2, "Role must be at least 2 characters").max(255),
    qualifications: z.string().max(500).nullable().optional(),
    bio: z.string().min(10, "Bio must be at least 10 characters"),
    photoUrl: z.string().url("Invalid photo URL").nullable().optional(),
    email: z.string().email("Invalid email address").nullable().optional(),
    phone: z.string().max(50).nullable().optional(),
    location: z.string().max(255).nullable().optional(),
    educationalQualifications: z.array(z.string()).nullable().optional(),
    professionalExperience: z.array(z.string()).nullable().optional(),
    areasOfExpertise: z.array(z.string()).nullable().optional(),
    therapeuticApproach: z.string().max(255).nullable().optional(),
    therapyModalities: z.array(z.string()).nullable().optional(),
    servicesOffered: z.array(z.string()).nullable().optional(),
    focusAreas: z.array(z.string()).nullable().optional(),
    professionalValues: z.array(z.string()).nullable().optional(),
    quote: z.string().nullable().optional(),
    displayOrder: z.number().int().default(0),
    isActive: z.boolean().default(true),
});

export const updateTeamMemberSchema = createTeamMemberSchema.partial();

export type CreateTeamMemberInput = z.infer<typeof createTeamMemberSchema>;
export type UpdateTeamMemberInput = z.infer<typeof updateTeamMemberSchema>;

// FAQ schemas
export const createFAQSchema = z.object({
    question: z.string().min(5, "Question must be at least 5 characters").max(500),
    answer: z.string().min(10, "Answer must be at least 10 characters"),
    category: z.enum(["therapy", "booking", "programs", "general"]).default("general"),
    displayOrder: z.number().int().default(0),
    isActive: z.boolean().default(true),
});

export const updateFAQSchema = createFAQSchema.partial();

export type CreateFAQInput = z.infer<typeof createFAQSchema>;
export type UpdateFAQInput = z.infer<typeof updateFAQSchema>;

// Contact form schema
export const contactFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    subject: z.string().optional(),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

// Job application schema
export const jobApplicationSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    position: z.string().optional(),
    coverLetter: z.string().optional(),
});

export type JobApplicationInput = z.infer<typeof jobApplicationSchema>;

// Admin create user schema
export const createUserSchema = z.object({
    email: z.string().email("Invalid email address"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    role: z.enum(["client", "therapist", "admin", "reception"]),
    phone: z.string().optional(),
    timezone: z.string().default("Asia/Kolkata"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
