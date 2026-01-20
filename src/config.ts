/**
 * MindWeal Configuration
 * Centralized configuration for the application
 */

// ===================
// Application Config
// ===================
export const appConfig = {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'MindWeal',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    title: process.env.NEXT_PUBLIC_SITE_TITLE || 'MindWeal - Mental Health Clinic',
    description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Untangle - Heal - Thrive. Professional mental health services and therapy.',
    tagline: 'Untangle - Heal - Thrive',
    founder: 'By Pihu Suri',
} as const;

// ===================
// Database Config
// ===================
export const databaseConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3307', 10),
    user: process.env.DATABASE_USER || 'mindweal',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'mindweal',
} as const;

// ===================
// Strapi CMS Config
// ===================
export const strapiConfig = {
    url: process.env.STRAPI_URL || 'http://localhost:1337',
    apiToken: process.env.STRAPI_API_TOKEN || '',
} as const;

// ===================
// Email Config (Zoho SMTP)
// ===================
export const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.zoho.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD || '',
    },
    from: {
        email: process.env.SMTP_FROM_EMAIL || 'noreply@mindweal.in',
        name: process.env.SMTP_FROM_NAME || 'MindWeal',
    },
} as const;

// ===================
// Auth Config
// ===================
export const authConfig = {
    secret: process.env.BETTER_AUTH_SECRET || '',
    baseUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
    },
} as const;

// ===================
// Google Calendar API Config (for Meet links)
// ===================
export const googleCalendarConfig = {
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
    privateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '',
} as const;

// ===================
// Booking Config
// ===================
export const bookingConfig = {
    defaultTimezone: 'Asia/Kolkata',
    defaultSessionDuration: 60,
    defaultBufferTime: 15,
    defaultAdvanceBookingDays: 30,
    defaultMinBookingNotice: 24,
    reminderHoursBefore: [24, 1],
} as const;

// ===================
// Navigation Config
// ===================
export const navigationConfig = {
    mainNav: [
        { name: 'Home', href: '/' },
        { name: 'About', href: '/about' },
        {
            name: 'Services', href: '/services', children: [
                { name: 'Programs', href: '/services/programs' },
                { name: 'Workshops', href: '/services/workshops' },
            ]
        },
        { name: 'Community', href: '/community' },
        { name: 'Therapists', href: '/therapists' },
        { name: 'The Team', href: '/team' },
        { name: 'Join Us', href: '/join-us' },
        { name: 'Contact', href: '/contact' },
    ],
    footerNav: {
        services: [
            { name: 'Programs', href: '/services/programs' },
            { name: 'Workshops', href: '/services/workshops' },
            { name: 'Therapists', href: '/therapists' },
        ],
        company: [
            { name: 'About', href: '/about' },
            { name: 'The Team', href: '/team' },
            { name: 'Join Us', href: '/join-us' },
            { name: 'Contact', href: '/contact' },
        ],
        resources: [
            { name: 'Emergency Helplines', href: '/resources/emergency-helplines' },
            { name: 'Grounding Techniques', href: '/resources/grounding-techniques' },
        ],
        legal: [
            { name: 'Privacy Policy', href: '/legal/privacy-policy' },
            { name: 'Terms & Conditions', href: '/legal/terms-and-conditions' },
        ],
    },
} as const;

// ===================
// Social Links
// ===================
export const socialLinks = {
    instagram: 'https://www.instagram.com/mindweal_by_pihusuri',
    linkedin: 'https://in.linkedin.com/company/mindweal-by-pihu-suri',
    email: 'mindwealbypihusuri@gmail.com',
    phone: '+91 9599618238',
} as const;
