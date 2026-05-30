"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "./LanguageProvider";

export default function CallToAction() {
  const { lang } = useLanguage();

  return (
    <section className="py-20 md:py-32 bg-gradient-to-r from-brand via-brand/90 to-brand/80 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -z-10" />

        {/* Main Message */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            {lang === "ar" ? (
              <>
                ماذا تنتظر؟ <br />
                <span className="text-yellow-300">ابدأ تجربتك الآن!</span>
              </>
            ) : (
              <>
                What Are You Waiting For? <br />
                <span className="text-yellow-300">Start Your experience Today!</span>
              </>
            )}
          </h2>

          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            {lang === "ar" ? (
              "انضم إلى الطموحين والطلاب الذين بدأوا رحلتهم المهنية معنا. احصل على فرصة ذهبية لتطوير مهاراتك وتحقيق أحلامك المهنية في شركات رائدة."
            ) : (
              "Join dreamers and students who have started their professional journey with us. Get the golden opportunity to develop your skills and achieve your career dreams in leading companies."
            )}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-brand font-bold text-lg rounded-full hover:bg-gray-100 transition transform hover:scale-105 shadow-2xl shadow-black/30"
          >
            {lang === "ar" ? "سجل الآن" : "Register Now"}
            <ArrowRight className="w-6 h-6" />
          </Link>

          <a
            href="#about"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-bold text-lg rounded-full border-2 border-white hover:bg-white/30 transition"
          >
            {lang === "ar" ? "عد للأعلى" : "Learn More"}
          </a>
        </div>
        
    </section>
  );
}
