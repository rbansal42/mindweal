import Link from "next/link";
import { appConfig } from "@/config";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Minimal header with just logo */}
      <header className="p-6">
        <Link
          href="/"
          className="text-xl font-bold text-[var(--primary-teal)] hover:opacity-80 transition-opacity"
        >
          {appConfig.name}
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
      {/* Minimal footer */}
      <footer className="p-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} {appConfig.name}. All rights reserved.
      </footer>
    </div>
  );
}
