"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Calendar,
    List,
    Users,
    UserCircle,
    LogOut,
    Menu,
    X,
    Plus,
} from "lucide-react";
import { useState } from "react";
import { signOut } from "@/lib/auth-client";

interface AdminSidebarProps {
    user: {
        id: string;
        name: string;
        email: string;
        image?: string | null;
    };
    role: string;
}

const navItems = [
    { href: "/admin", icon: Home, label: "Dashboard", roles: ["admin", "reception"] },
    { href: "/admin/calendar", icon: Calendar, label: "Master Calendar", roles: ["admin", "reception"] },
    { href: "/admin/bookings", icon: List, label: "All Bookings", roles: ["admin", "reception"] },
    { href: "/admin/bookings/new", icon: Plus, label: "New Booking", roles: ["admin", "reception"] },
    { href: "/admin/therapists", icon: Users, label: "Therapists", roles: ["admin"] },
    { href: "/admin/users", icon: UserCircle, label: "Users", roles: ["admin"] },
];

export default function AdminSidebar({ user, role }: AdminSidebarProps) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        window.location.href = "/";
    };

    const filteredNavItems = navItems.filter((item) =>
        item.roles.includes(role)
    );

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md"
            >
                <Menu className="w-6 h-6 text-gray-600" />
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
                    w-64 bg-gray-900 text-white
                    transform transition-transform duration-200 ease-in-out
                    ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-800">
                        <div className="flex items-center justify-between">
                            <Link href="/" className="flex items-center gap-2">
                                <span className="text-xl font-bold text-primary">
                                    Mindweal
                                </span>
                            </Link>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="lg:hidden p-1 rounded-lg hover:bg-gray-800"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Admin Dashboard</p>
                    </div>

                    {/* User info */}
                    <div className="p-4 border-b border-gray-800">
                        <div className="flex items-center gap-3">
                            {user.image ? (
                                <img
                                    src={user.image}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="text-primary font-medium">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-white truncate">
                                    {user.name}
                                </p>
                                <p className="text-sm text-gray-400 capitalize">
                                    {role}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4">
                        <ul className="space-y-1">
                            {filteredNavItems.map((item) => {
                                const isActive =
                                    pathname === item.href ||
                                    (item.href !== "/admin" &&
                                        pathname.startsWith(item.href));

                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`
                                                flex items-center gap-3 px-4 py-3 rounded-lg
                                                transition-colors
                                                ${
                                                    isActive
                                                        ? "bg-primary text-white"
                                                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                                }
                                            `}
                                        >
                                            <item.icon className="w-5 h-5" />
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
                    <div className="p-4 border-t border-gray-800">
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white w-full transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
