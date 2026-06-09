"use client";

import { Quote } from "lucide-react";
import { useLanguage } from "./LanguageProvider";
import testimonialsData from "../data/testimonials.json";

type Testimonial = {
  name: string;
  role: string;
  text: string;
};

export default function Testimonials() {
  const { lang, t } = useLanguage();
  
  // Guard against undefined lang on initial render
  const stories = (testimonialsData[lang as keyof typeof testimonialsData] || []) as Testimonial[];
  
  if (!stories.length) return null;

  // 3 clones is enough for a wide screen; the Double-Track loop handles the rest.
  const safeStories = [...stories, ...stories, ...stories];

  return (
    <section className="py-24 bg-gray-50 relative">
      <div className="absolute top-0 w-full h-1/2 bg-white -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-1 bg-brand rounded-full" />
            <h2 className="text-brand font-bold uppercase tracking-wide text-2xl md:text-3xl">
              {t("testimonialsTag")}
            </h2>
            <div className="w-10 h-1 bg-brand rounded-full" />
          </div>
          <h3 className="text-3xl md:text-5xl font-extrabold text-gray-900">
            {t("testimonialsTitle")}
          </h3>
        </div>

        {/* The Double-Track Marquee Wrapper */}
        <div className="flex overflow-hidden text-start">
          
          {/* TRACK 1 */}
          <div className="testimonials-marquee-track shrink-0">
            {safeStories.map((story, index) => (
              <div key={`t1-${story.name}-${index}`} className="w-[min(88vw,34rem)] shrink-0 px-2 sm:px-3">
                <div className="h-full bg-white p-10 lg:p-12 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 relative group hover:-translate-y-2 transition duration-500">
                  <div className="absolute top-10 end-10 text-brand/5 group-hover:text-brand/20 transition duration-300">
                    <Quote className={`w-10 h-10 ${lang === "ar" ? "" : "rotate-180"}`} />
                  </div>
                  <div className="flex items-center gap-5 mb-10 relative z-10">
                    <div>
                      <h4 className="font-extrabold text-gray-900 text-xl">{story.name}</h4>
                      <p className="text-brand font-bold text-sm mt-1">{story.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-lg relative z-10 font-medium">
                    {story.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* TRACK 2 (Identical Clone for seamless looping) */}
          <div className="testimonials-marquee-track shrink-0" aria-hidden="true">
            {safeStories.map((story, index) => (
              <div key={`t2-${story.name}-${index}`} className="w-[min(88vw,34rem)] shrink-0 px-2 sm:px-3">
                <div className="h-full bg-white p-10 lg:p-12 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 relative group hover:-translate-y-2 transition duration-500">
                  <div className="absolute top-10 end-10 text-brand/5 group-hover:text-brand/20 transition duration-300">
                    <Quote className={`w-10 h-10 ${lang === "ar" ? "" : "rotate-180"}`} />
                  </div>
                  <div className="flex items-center gap-5 mb-10 relative z-10">
                    <div>
                      <h4 className="font-extrabold text-gray-900 text-xl">{story.name}</h4>
                      <p className="text-brand font-bold text-sm mt-1">{story.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-lg relative z-10 font-medium">
                    {story.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}