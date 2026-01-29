"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
    displayOrder: number;
}

interface FAQAccordionProps {
    faqs: FAQ[];
}

export function FAQAccordion({ faqs }: FAQAccordionProps) {
    const [openId, setOpenId] = useState<string | null>(null);

    const toggleFAQ = (id: string) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <div className="space-y-3">
            {faqs.map((faq) => {
                const isOpen = openId === faq.id;

                return (
                    <div
                        key={faq.id}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                        <button
                            type="button"
                            onClick={() => toggleFAQ(faq.id)}
                            className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors"
                        >
                            <span className="font-medium text-gray-900 pr-4">
                                {faq.question}
                            </span>
                            <ChevronDown
                                className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${
                                    isOpen ? "rotate-180" : ""
                                }`}
                            />
                        </button>
                        <div
                            className={`overflow-hidden transition-all duration-200 ${
                                isOpen ? "max-h-[1000px]" : "max-h-0"
                            }`}
                        >
                            <div
                                className="p-5 pt-0 text-gray-600 prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: faq.answer }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
