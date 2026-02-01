'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { navigationConfig, appConfig } from '@/config';

type NavItem = {
    name: string;
    href: string;
    children?: readonly { name: string; href: string }[];
};

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const navItems = navigationConfig.mainNav as readonly NavItem[];

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
            <div className="container-custom">
                <nav className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gradient-mixed">
                            {appConfig.name}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navItems.map((item) => (
                            <div
                                key={item.name}
                                className="relative"
                                onMouseEnter={() => item.children && setOpenDropdown(item.name)}
                                onMouseLeave={() => setOpenDropdown(null)}
                            >
                                <Link
                                    href={item.href}
                                    className="text-gray-600 hover:text-[var(--primary-teal)] font-medium transition-colors py-2 flex items-center"
                                >
                                    {item.name}
                                    {item.children && (
                                        <ChevronDown className="ml-1 w-4 h-4" />
                                    )}
                                </Link>

                                {/* Dropdown Menu */}
                                {item.children && openDropdown === item.name && (
                                    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 animate-fade-in-down">
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.name}
                                                href={child.href}
                                                className="block px-4 py-2 text-gray-600 hover:text-[var(--primary-teal)] hover:bg-gray-50 transition-colors"
                                            >
                                                {child.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <div className="hidden lg:block">
                        <Link href="/contact" className="btn btn-primary">
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden p-2"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? (
                            <X className="w-6 h-6 text-gray-600" />
                        ) : (
                            <Menu className="w-6 h-6 text-gray-600" />
                        )}
                    </button>
                </nav>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="lg:hidden pb-4 animate-fade-in-down">
                        <div className="flex flex-col gap-2">
                            {navItems.map((item) => (
                                <div key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="block py-2 text-gray-600 hover:text-[var(--primary-teal)] font-medium transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                    {item.children && (
                                        <div className="pl-4 mt-1 space-y-1">
                                            {item.children.map((child) => (
                                                <Link
                                                    key={child.name}
                                                    href={child.href}
                                                    className="block py-1.5 text-sm text-gray-500 hover:text-[var(--primary-teal)] transition-colors"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    {child.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <Link
                                href="/contact"
                                className="btn btn-primary mt-4 w-full"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
