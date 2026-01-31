"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  SlidersHorizontal,
  BarChart3,
  GitCompareArrows,
  Settings,
  DollarSign
} from "lucide-react";
import { usePL } from "@/lib/pl-context";

const navLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/setup", label: "Company Setup", icon: Building2 },
  { href: "/assumptions", label: "Assumptions", icon: SlidersHorizontal },
  { href: "/scenarios", label: "Scenarios", icon: BarChart3 },
  { href: "/comparison", label: "Comparison", icon: GitCompareArrows },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { model } = usePL();
  const companyName = model.companyName;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-blue-900 to-blue-700 shadow-xl no-print">
      <div className="flex h-full flex-col">
        {/* Logo Area */}
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg">
              <DollarSign className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                {companyName || "P&L Creator"}
              </h1>
              <span className="inline-block rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-blue-100">
                Master's Edge
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 p-4">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-4">
          <p className="text-xs text-blue-200 text-center leading-relaxed">
            Part of The Master's Edge Program by Total Success AI
          </p>
        </div>
      </div>
    </aside>
  );
}
