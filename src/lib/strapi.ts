/**
 * Strapi API Client
 * Fetches data from Strapi CMS
 */

import { strapiConfig } from "@/config";

interface StrapiResponse<T> {
    data: T;
    meta?: {
        pagination?: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}

interface StrapiSingleResponse<T> {
    data: T;
}

interface StrapiMedia {
    id: number;
    url: string;
    alternativeText?: string;
    width?: number;
    height?: number;
}

// Content Types
export interface Program {
    id: number;
    documentId: string;
    title: string;
    slug: string;
    description: string;
    duration: string;
    coverImage?: StrapiMedia;
    benefits?: { text: string }[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Workshop {
    id: number;
    documentId: string;
    title: string;
    slug: string;
    description: string;
    date: string;
    duration: string;
    capacity: number;
    coverImage?: StrapiMedia;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CommunityProgram {
    id: number;
    documentId: string;
    name: string;
    slug: string;
    description: string;
    schedule: string;
    coverImage?: StrapiMedia;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Therapist {
    id: number;
    documentId: string;
    name: string;
    slug: string;
    title: string;
    bio: string;
    specializations: { name: string }[];
    photo?: StrapiMedia;
    calcomUsername: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface JobPosting {
    id: number;
    documentId: string;
    title: string;
    slug: string;
    department: string;
    description: string;
    requirements: string;
    location: string;
    type: "full-time" | "part-time" | "contract";
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// API Functions
async function fetchAPI<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${strapiConfig.url}/api${endpoint}`;

    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (strapiConfig.apiToken) {
        headers["Authorization"] = `Bearer ${strapiConfig.apiToken}`;
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            ...headers,
            ...options.headers,
        },
        next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
        throw new Error(`Strapi API error: ${response.status}`);
    }

    return response.json();
}

// Programs
export async function getPrograms(): Promise<Program[]> {
    const response = await fetchAPI<StrapiResponse<Program[]>>(
        "/programs?populate=*&filters[isActive][$eq]=true"
    );
    return response.data;
}

export async function getProgramBySlug(slug: string): Promise<Program | null> {
    const response = await fetchAPI<StrapiResponse<Program[]>>(
        `/programs?filters[slug][$eq]=${slug}&populate=*`
    );
    return response.data?.[0] || null;
}

// Workshops
export async function getWorkshops(): Promise<Workshop[]> {
    const response = await fetchAPI<StrapiResponse<Workshop[]>>(
        "/workshops?populate=*&filters[isActive][$eq]=true&sort=date:asc"
    );
    return response.data;
}

export async function getWorkshopBySlug(slug: string): Promise<Workshop | null> {
    const response = await fetchAPI<StrapiResponse<Workshop[]>>(
        `/workshops?filters[slug][$eq]=${slug}&populate=*`
    );
    return response.data?.[0] || null;
}

// Community Programs
export async function getCommunityPrograms(): Promise<CommunityProgram[]> {
    const response = await fetchAPI<StrapiResponse<CommunityProgram[]>>(
        "/community-programs?populate=*&filters[isActive][$eq]=true"
    );
    return response.data;
}

export async function getCommunityProgramBySlug(
    slug: string
): Promise<CommunityProgram | null> {
    const response = await fetchAPI<StrapiResponse<CommunityProgram[]>>(
        `/community-programs?filters[slug][$eq]=${slug}&populate=*`
    );
    return response.data?.[0] || null;
}

// Therapists
export async function getTherapists(): Promise<Therapist[]> {
    const response = await fetchAPI<StrapiResponse<Therapist[]>>(
        "/therapists?populate=*&filters[isActive][$eq]=true"
    );
    return response.data;
}

export async function getTherapistBySlug(slug: string): Promise<Therapist | null> {
    const response = await fetchAPI<StrapiResponse<Therapist[]>>(
        `/therapists?filters[slug][$eq]=${slug}&populate=*`
    );
    return response.data?.[0] || null;
}

// Job Postings
export async function getJobPostings(): Promise<JobPosting[]> {
    const response = await fetchAPI<StrapiResponse<JobPosting[]>>(
        "/job-postings?populate=*&filters[isActive][$eq]=true"
    );
    return response.data;
}

export async function getJobPostingBySlug(
    slug: string
): Promise<JobPosting | null> {
    const response = await fetchAPI<StrapiResponse<JobPosting[]>>(
        `/job-postings?filters[slug][$eq]=${slug}&populate=*`
    );
    return response.data?.[0] || null;
}
