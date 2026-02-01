import Link from 'next/link';
import { Mail } from 'lucide-react';
import { InstagramIcon, LinkedInIcon } from '@/components/icons';
import { navigationConfig, appConfig, socialLinks } from '@/config';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300">
            {/* Main Footer */}
            <div className="container-custom py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="inline-block">
                            <span className="text-2xl font-bold text-white">
                                {appConfig.name}
                            </span>
                        </Link>
                        <p className="mt-4 text-gray-400 max-w-sm">
                            {appConfig.tagline}
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                            {appConfig.founder}
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-4 mt-6">
                            <a
                                href={socialLinks.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[var(--primary-teal)] transition-colors"
                                aria-label="Instagram"
                            >
                                <InstagramIcon size={20} fill="currentColor" />
                            </a>
                            <a
                                href={socialLinks.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[var(--primary-teal)] transition-colors"
                                aria-label="LinkedIn"
                            >
                                <LinkedInIcon size={20} fill="currentColor" />
                            </a>
                            <a
                                href={`mailto:${socialLinks.email}`}
                                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[var(--primary-teal)] transition-colors"
                                aria-label="Email"
                            >
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Services</h4>
                        <ul className="space-y-3">
                            {navigationConfig.footerNav.services.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-[var(--primary-teal)] transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Company</h4>
                        <ul className="space-y-3">
                            {navigationConfig.footerNav.company.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-[var(--primary-teal)] transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Resources</h4>
                        <ul className="space-y-3">
                            {navigationConfig.footerNav.resources.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-[var(--primary-teal)] transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800">
                <div className="container-custom py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">
                        © {currentYear} {appConfig.name}. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        {navigationConfig.footerNav.legal.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
