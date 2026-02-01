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
    Settings,
    FileText,
    HelpCircle,
    Briefcase,
    BookOpen,
    Heart,
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
    { href: "/admin/calendar", icon: Calendar, label: "Calendar", roles: ["admin", "reception"] },
    { href: "/admin/bookings", icon: List, label: "Bookings", roles: ["admin", "reception"] },
    { href: "/admin/bookings/new", icon: Plus, label: "New Booking", roles: ["admin", "reception"] },
    { href: "/admin/clients", icon: Users, label: "Clients", roles: ["admin", "reception", "therapist"] },
    { href: "/admin/therapists", icon: Users, label: "Therapists", roles: ["admin"] },
    { href: "/admin/team-members", icon: UserCircle, label: "Team", roles: ["admin"] },
    { href: "/admin/programs", icon: BookOpen, label: "Programs", roles: ["admin"] },
    { href: "/admin/workshops", icon: Calendar, label: "Workshops", roles: ["admin"] },
    { href: "/admin/community-programs", icon: Heart, label: "Community", roles: ["admin"] },
    { href: "/admin/faqs", icon: HelpCircle, label: "FAQs", roles: ["admin"] },
    { href: "/admin/job-postings", icon: Briefcase, label: "Jobs", roles: ["admin"] },
    { href: "/admin/users", icon: FileText, label: "Users", roles: ["admin"] },
    { href: "/admin/settings/specializations", icon: Settings, label: "Settings", roles: ["admin"] },
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
                className="lg:hidden fixed top-2 left-2 z-50 p-1.5 rounded-md bg-white shadow-sm border border-gray-200"
            >
                <Menu className="w-4 h-4 text-gray-600" />
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
                    w-48 bg-gray-900 text-white
                    transform transition-transform duration-200 ease-in-out
                    ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="px-3 py-2.5 border-b border-gray-800">
                        <div className="flex items-center justify-between">
                            <Link href="/" className="flex items-center gap-2">
                                <span className="text-sm font-bold text-primary">
                                    Mindweal
                                </span>
                            </Link>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="lg:hidden p-1 rounded hover:bg-gray-800"
                            >
                                <X className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">Admin Panel</p>
                    </div>

                    {/* User info */}
                    <div className="px-3 py-2 border-b border-gray-800">
                        <div className="flex items-center gap-2">
                            {user.image ? (
                                <img
                                    src={user.image}
                                    alt={user.name}
                                    className="w-6 h-6 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="text-primary text-xs font-medium">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-white truncate">
                                    {user.name}
                                </p>
                                <p className="text-[10px] text-gray-400 capitalize">
                                    {role}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-2 overflow-y-auto">
                        <ul className="space-y-0.5">
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
                                                portal-nav-item
                                                ${isActive ? "active" : ""}
                                            `}
                                        >
                                            <item.icon className="portal-nav-icon" />
                                            <span>{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Sign out */}
                    <div className="p-2 border-t border-gray-800">
                        <button
                            onClick={handleSignOut}
                            className="portal-nav-item w-full"
                        >
                            <LogOut className="portal-nav-icon" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
