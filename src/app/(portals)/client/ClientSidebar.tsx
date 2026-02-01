"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { signOut } from "@/lib/auth-client";

interface ClientSidebarProps {
    user: {
        id: string;
        name: string;
        email: string;
        image?: string | null;
    };
}

const navItems = [
    { href: "/client", icon: Home, label: "Dashboard" },
    { href: "/client/appointments", icon: Calendar, label: "Appointments" },
    { href: "/client/profile", icon: User, label: "Profile" },
];

export default function ClientSidebar({ user }: ClientSidebarProps) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        window.location.href = "/";
    };

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-white shadow-md"
            >
                <Menu className="w-5 h-5 text-gray-600" />
            </button>

            {/* Mobile overlay */}
            {mobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-50
                    w-56 bg-white border-r border-gray-200
                    transform transition-transform duration-200 ease-in-out
                    ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <Link href="/" className="flex items-center gap-2">
                                <span className="text-lg font-bold text-primary">
                                    Mindweal
                                </span>
                            </Link>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Client Portal</p>
                    </div>

                    {/* User info */}
                    <div className="p-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            {user.image ? (
                                <img
                                    src={user.image}
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-primary font-medium text-sm">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate text-sm">
                                    {user.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-3">
                        <ul className="space-y-1">
                            {navItems.map((item) => {
                                const isActive =
                                    pathname === item.href ||
                                    (item.href !== "/client" &&
                                        pathname.startsWith(item.href));

                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`
                                                flex items-center gap-2 px-3 py-2 rounded-lg
                                                transition-colors text-sm
                                                ${
                                                    isActive
                                                        ? "bg-primary/10 text-primary"
                                                        : "text-gray-600 hover:bg-gray-100"
                                                }
                                            `}
                                        >
                                            <item.icon className="w-4 h-4" />
                                            <span className="font-medium">
                                                {item.label}
                                            </span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Sign out */}
                    <div className="p-3 border-t border-gray-100">
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 w-full transition-colors text-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
