"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Plus, HelpCircle, Filter } from "lucide-react";

interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: "therapy" | "booking" | "programs" | "general";
    displayOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const CATEGORY_LABELS: Record<FAQ["category"], string> = {
    therapy: "Therapy Services",
    booking: "Booking & Sessions",
    programs: "Programs & Training",
    general: "General",
};

const CATEGORY_COLORS: Record<FAQ["category"], string> = {
    therapy: "bg-blue-100 text-blue-800",
    booking: "bg-green-100 text-green-800",
    programs: "bg-purple-100 text-purple-800",
    general: "bg-gray-100 text-gray-800",
};

export default function FAQsPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState<FAQ["category"] | "">("");

    const fetchFAQs = useCallback(async () => {
        setLoading(true);
        try {
            const url = categoryFilter
                ? `/api/admin/faqs?category=${categoryFilter}`
                : "/api/admin/faqs";
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch FAQs");
            const data = await res.json();
            setFaqs(data.faqs);
        } catch (error) {
            console.error("Error fetching FAQs:", error);
        } finally {
            setLoading(false);
        }
    }, [categoryFilter]);

    useEffect(() => {
        fetchFAQs();
    }, [fetchFAQs]);

    const handleToggleActive = async (id: string, isActive: boolean) => {
        try {
            const res = await fetch(`/api/admin/faqs/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive }),
            });
            if (!res.ok) throw new Error("Failed to update FAQ");
            await fetchFAQs();
        } catch (error) {
            console.error("Error updating FAQ:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this FAQ?")) return;
        try {
            const res = await fetch(`/api/admin/faqs/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete FAQ");
            await fetchFAQs();
        } catch (error) {
            console.error("Error deleting FAQ:", error);
        }
    };

    return (
        <div className="space-y-3">
            {/* Header with actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="portal-title">FAQs</h1>
                    <p className="text-gray-600 text-sm">
                        Manage frequently asked questions
                    </p>
                </div>
                <Link
                    href="/admin/faqs/new"
                    className="portal-btn portal-btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add FAQ
                </Link>
            </div>

            {/* Filter */}
            <div className="portal-card p-4">
                <div className="flex items-center gap-3">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <label htmlFor="category-filter" className="portal-label">
                        Category:
                    </label>
                    <select
                        id="category-filter"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value as FAQ["category"] | "")}
                        className="portal-input w-auto"
                    >
                        <option value="">All Categories</option>
                        <option value="therapy">Therapy Services</option>
                        <option value="booking">Booking & Sessions</option>
                        <option value="programs">Programs & Training</option>
                        <option value="general">General</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="portal-card">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                        <p className="mt-4 text-gray-500">Loading FAQs...</p>
                    </div>
                ) : faqs.length === 0 ? (
                    <div className="p-8 text-center">
                        <HelpCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No FAQs found</p>
                        <Link
                            href="/admin/faqs/new"
                            className="text-[var(--primary-teal)] hover:underline mt-2 inline-block"
                        >
                            Add your first FAQ
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="portal-table">
                            <thead>
                                <tr>
                                    <th>Question</th>
                                    <th>Category</th>
                                    <th>Order</th>
                                    <th>Active</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {faqs.map((faq) => (
                                    <tr key={faq.id}>
                                        <td>
                                            <div className="text-sm font-medium text-gray-900 max-w-md truncate">
                                                {faq.question}
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${CATEGORY_COLORS[faq.category]}`}
                                            >
                                                {CATEGORY_LABELS[faq.category]}
                                            </span>
                                        </td>
                                        <td className="text-sm text-gray-500">
                                            {faq.displayOrder}
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleActive(faq.id, !faq.isActive)}
                                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                                                    faq.isActive ? "bg-teal-600" : "bg-gray-200"
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                        faq.isActive ? "translate-x-5" : "translate-x-0"
                                                    }`}
                                                />
                                            </button>
                                        </td>
                                        <td className="text-right text-sm font-medium space-x-2">
                                            <Link
                                                href={`/admin/faqs/${faq.id}/edit`}
                                                className="text-teal-600 hover:text-teal-900"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(faq.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
