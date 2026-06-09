"use client";

import Image from "next/image";
import { useLanguage } from "./LanguageProvider";

const partnerLogos = [
  "p1.jpg", "p2.jpg", "P3.jpg", "p4.jpg", "p5.jpg", "p6.jpg", "p7.jpg",
  "p8.jpg", "p9.png", "p10.jpg", "p11.jpg", "p12.jpg", "p13.jpg", "p14.webp",
];

const floatClasses = ["animate-float-1", "animate-float-2", "animate-float-3"];
const marqueeLogos = [...partnerLogos, ...partnerLogos, ...partnerLogos];

export default function Partners() {
  const { t } = useLanguage();

  return (
    <section id="partners" className="py-24 bg-white border-t border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 relative z-10 w-full">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-1 bg-brand rounded-full" />
            <h2 className="text-brand font-bold uppercase tracking-wide text-2xl md:text-3xl">
              {t("partnersTag")}
            </h2>
            <div className="w-10 h-1 bg-brand rounded-full" />
          </div>
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            {t("partnersTitle")}
          </h3>
          <p className="text-gray-500 text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto">
            {t("partnersDesc")}
          </p>
        </div>

        <div className="relative w-full overflow-hidden py-16">
<div className="flex w-max partners-marquee-track shrink-0 items-center">            {marqueeLogos.map((logo, i) => {
              const size = "w-28 h-28";
              const float = floatClasses[i % floatClasses.length];

              return (
                <div
                  key={`partner-${logo}-${i}`}
                  className={`bg-white ${size} md:w-36 md:h-36 ${float} rounded-full flex items-center justify-center shadow-lg shadow-gray-200/50 hover:!-translate-y-2 transition duration-500 cursor-pointer overflow-hidden p-4 md:p-6 shrink-0 border-4 border-white backdrop-blur-sm relative group`}
                >
                  <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition duration-300" />
                  <Image
                    src={`/image/khotwa-partners/${logo}`}
                    alt="Partner"
                    width={144}
                    height={144}
                    className="w-full h-full object-cover mix-blend-multiply drop-shadow-sm relative z-10 transition duration-500 transform group-hover:scale-110"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
