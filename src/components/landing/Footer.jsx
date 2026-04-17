"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="bg-white dark:bg-slate-950 py-16 border-t border-slate-100 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Left: Branding */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#5B4FCF]" />
              <span className="text-xl font-bold text-[#1A1A2E] dark:text-white">
                ConsentLens
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic">
              "We are not AI doctors. We are AI witnesses."
            </p>
          </div>

          {/* Center: Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Navigation</h4>
            <nav className="flex flex-col gap-3">
              {["Home", "Features", "How It Works", "For Hospitals"].map((link) => (
                <Link 
                  key={link} 
                  href={`#${link.toLowerCase().replace(/\s/g, '')}`}
                  className="text-slate-600 dark:text-slate-300 hover:text-[#5B4FCF] transition-colors"
                >
                  {link}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Credits */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Hackathon Team</h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Built at a hackathon in 15 hours.<br />
              <span className="font-semibold text-[#1A1A2E] dark:text-white">
                Team: Himanshi, Srishti, Simran, Kanak.
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#5B4FCF] py-4 text-center">
        <p className="text-sm font-medium text-white tracking-wide">
          ConsentLens 2026 — AI-Powered Patient Care
        </p>
      </div>
    </footer>
  );
}
