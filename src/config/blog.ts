// Blog configuration

export const BLOG_CATEGORIES = {
    "wellness-tips": {
        label: "Wellness Tips",
        color: "bg-[var(--accent-green)]/10 text-[var(--accent-green)]",
    },
    "practice-news": {
        label: "Practice News",
        color: "bg-[var(--primary-teal)]/10 text-[var(--primary-teal)]",
    },
    "professional-insights": {
        label: "Professional Insights",
        color: "bg-[var(--secondary-green)]/10 text-[var(--secondary-green)]",
    },
    "resources": {
        label: "Resources",
        color: "bg-gray-100 text-gray-700",
    },
} as const;

export const VALID_BLOG_CATEGORIES = Object.keys(BLOG_CATEGORIES) as Array<keyof typeof BLOG_CATEGORIES>;

export type BlogCategory = keyof typeof BLOG_CATEGORIES;
