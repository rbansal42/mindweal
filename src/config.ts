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
// Cal.com Config
// ===================
export const calcomConfig = {
    teamUrl: process.env.CALCOM_TEAM_URL || 'https://cal.com/mindweal',
    apiKey: process.env.CALCOM_API_KEY || '',
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
    instagram: 'https://instagram.com/mindweal',
    linkedin: 'https://linkedin.com/company/mindweal',
    twitter: 'https://twitter.com/mindweal',
    email: 'hello@mindweal.in',
    phone: '+91 XXXXXXXXXX',
} as const;
