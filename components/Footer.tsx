"use client";

import Image from "next/image";
import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 border-t-4 border-brand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-6 text-center">
        <Image
          src="/image/khotwa-logo.png"
          alt="Khotwa Logo"
          width={112}
          height={112}
          className="h-20 lg:h-28 w-auto object-contain bg-white rounded-xl p-2 shadow-sm"
        />
        <a
          href="mailto:khotwa.scc@gmail.com"
          className="flex items-center gap-3 text-gray-300 hover:text-white transition"
        >
          <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <span className="font-medium" dir="ltr">khotwa.scc@gmail.com</span>
        </a>
      </div>
    </footer>
  );
}
