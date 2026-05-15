"use client";

import { useState, ChangeEvent, DragEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import Image from "next/image";
import { Lock, CheckCircle, UploadCloud, Star, X } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { SAUDI_UNIVERSITIES, PROFESSIONAL_MAJORS } from "@/lib/university-and-majors";

const TOTAL_STEPS = 4;

const COMPANIES_LIST = [
  "Apple", "Microsoft", "Google", "Amazon", "Meta", "Tesla", "IBM", "Intel",
];

const JOB_TITLES_LIST = [
  "Software Engineer", "Product Manager", "Data Scientist", "UX Designer",
  "DevOps Engineer", "Business Analyst", "QA Engineer", "System Architect",
];

// Zod validation schemas
const phoneRegex = /^\d{9,10}$/;

const FullSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  gender: z.enum(["male", "female"]),
  email: z.string().email("Invalid email format"),
  phone_country: z.string().default("966"),
  phone_number: z.string().regex(phoneRegex, "Phone must be 9 digits"),
  university: z.string().min(1, "University is required"),
  university_other: z.string().default(""),
  major: z.string().min(1, "Major is required"),
  major_other: z.string().default(""),
  uni_id: z.string().min(1, "University ID is required"),
  graduation_year: z.string().min(1, "Graduation year is required"),
  linkedin: z.string().default(""),
  skills: z.array(z.string()).min(1, "Add at least one skill").max(7, "Maximum 7 skills"),
  experience_projects: z.string().min(10, "Please describe your experience"),
  free_space: z.string().default(""),
  commitment_duration: z.string().min(1, "Commitment duration is required"),
  companies_ratings: z.record(z.number().min(1).max(5)).refine(
    (ratings) => Object.keys(ratings).length === COMPANIES_LIST.length && Object.values(ratings).every(v => v > 0),
    "Please rate all companies"
  ),
  job_ratings: z.record(z.number().min(1).max(5)).refine(
    (ratings) => Object.keys(ratings).length === JOB_TITLES_LIST.length && Object.values(ratings).every(v => v > 0),
    "Please rate all jobs"
  ),
  cv_file: z.instanceof(File).optional(),
});

type FormData = z.infer<typeof FullSchema>;

export default function RegisterPage() {
  const { lang, t, toggleLang } = useLanguage();
  const isRegistrationOpen = true;

  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [skillInput, setSkillInput] = useState("");
  const [companiesRatings, setCompaniesRatings] = useState<Record<string, number>>({});
  const [jobRatings, setJobRatings] = useState<Record<string, number>>({});

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
    getValues,
    setValue,
    clearErrors,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(FullSchema) as any,
    mode: "onBlur",
    defaultValues: {
      skills: [],
      companies_ratings: {},
      job_ratings: {},
      phone_country: "966",
    },
  });

  const selectedUniversity = watch("university");
  const selectedMajor = watch("major");
  const skills = watch("skills");

  const validateStep = async (): Promise<boolean> => {
    if (currentStep === 0) {
      return trigger(["full_name", "gender", "email", "phone_country", "phone_number"]);
    } else if (currentStep === 1) {
      const fieldsToCheck = ["university", "major", "uni_id", "graduation_year"];
      if (selectedUniversity === "Other") fieldsToCheck.push("university_other");
      if (selectedMajor === "Other") fieldsToCheck.push("major_other");
      if (watch("linkedin")) fieldsToCheck.push("linkedin");
      return trigger(fieldsToCheck as unknown as (keyof FormData)[]);
    } else if (currentStep === 2) {
      const result = await trigger(["skills", "experience_projects", "commitment_duration"]);
      if (!cvFile) {
        setShowError(true);
        setErrorTitle(lang === "ar" ? "ملف مطلوب" : "File Required");
        setErrorMessage(lang === "ar" ? "يرجى رفع السيرة الذاتية" : "Please upload your CV");
        return false;
      }
      return result;
    } else if (currentStep === 3) {
      const allCompaniesRated = COMPANIES_LIST.every((c) => companiesRatings[c]);
      const allJobsRated = JOB_TITLES_LIST.every((j) => jobRatings[j]);

      if (!allCompaniesRated || !allJobsRated) {
        setShowError(true);
        setErrorTitle(lang === "ar" ? "تقييم مطلوب" : "Ratings Required");
        setErrorMessage(
          lang === "ar"
            ? "يرجى تقييم جميع الشركات والوظائف"
            : "Please rate all companies and jobs"
        );
        return false;
      }
      return true;
    }
    return true;
  };

  const goNext = async () => {
    const isValid = await validateStep();
    if (isValid && currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.startsWith("0")) {
      value = value.substring(1);
    }
    setValue("phone_number", value);
    if (value.length > 0) clearErrors("phone_number");
  };

  const addSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      const currentSkills = getValues("skills") || [];
      if (currentSkills.length < 7) {
        const newSkills = [...currentSkills, skillInput.trim()];
        setValue("skills", newSkills);
        setSkillInput("");
        clearErrors("skills");
      }
    }
  };

  const removeSkill = (index: number) => {
    const currentSkills = getValues("skills") || [];
    const newSkills = currentSkills.filter((_, i) => i !== index);
    setValue("skills", newSkills);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCvFile(file);
      clearErrors("cv_file");
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setCvFile(file);
  };

  const setCompanyRating = (company: string, rating: number) => {
    setCompaniesRatings((prev) => ({
      ...prev,
      [company]: prev[company] === rating ? 0 : rating,
    }));
  };

  const setJobRating = (job: string, rating: number) => {
    setJobRatings((prev) => ({
      ...prev,
      [job]: prev[job] === rating ? 0 : rating,
    }));
  };

  const handleFormSubmit = handleSubmit(async () => {
    if (currentStep !== TOTAL_STEPS - 1) return;

    if (!cvFile) {
      setShowError(true);
      setErrorTitle(lang === "ar" ? "ملف مطلوب" : "File Required");
      setErrorMessage(lang === "ar" ? "يرجى رفع السيرة الذاتية" : "Please upload your CV");
      return;
    }

    if (cvFile.size > 10 * 1024 * 1024) {
      setShowError(true);
      setErrorTitle(lang === "ar" ? "حجم الملف كبير" : "File Too Large");
      setErrorMessage(lang === "ar" ? "يجب ألا يتجاوز الحجم 10MB" : "File must not exceed 10MB");
      return;
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(cvFile.type)) {
      setShowError(true);
      setErrorTitle(lang === "ar" ? "نوع ملف غير صحيح" : "Invalid File Type");
      setErrorMessage(lang === "ar" ? "يجب أن يكون PDF أو صورة" : "Must be PDF or image");
      return;
    }

    setShowConfirmation(true);
  });

  const handleConfirmedSubmit = async () => {
    setShowConfirmation(false);
    setIsSubmitting(true);

    try {
      const data = getValues();
      const formattedPhone = `+${data.phone_country}${data.phone_number}`;
      const universityName =
        data.university === "Other" ? data.university_other : data.university;
      const majorName = data.major === "Other" ? data.major_other : data.major;

      const formData = new FormData();
      formData.append("full_name", data.full_name);
      formData.append("gender", data.gender);
      formData.append("email", data.email);
      formData.append("phone_number", formattedPhone);
      formData.append("university", universityName || "");
      formData.append("major", majorName || "");
      formData.append("uni_id", data.uni_id);
      formData.append("graduation_year", data.graduation_year);
      formData.append("linkedin", data.linkedin || "");
      formData.append("skills", JSON.stringify(data.skills));
      formData.append("experience_projects", data.experience_projects);
      formData.append("free_space", data.free_space || "");
      formData.append("commitment_duration", data.commitment_duration);
      formData.append("companies_ratings", JSON.stringify(companiesRatings));
      formData.append("job_ratings", JSON.stringify(jobRatings));
      formData.append("cv_file", cvFile!);

      const response = await fetch("/api/register", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorTitle(lang === "ar" ? "خطأ" : "Error");
        setErrorMessage(result.error || (lang === "ar" ? "حدث خطأ" : "An error occurred"));
        setShowError(true);
        return;
      }

      setShowSuccess(true);
    } catch (error: unknown) {
      console.error("Registration Error:", error);
      setErrorTitle(lang === "ar" ? "خطأ في الاتصال" : "Connection Error");
      setErrorMessage(lang === "ar" ? "حدث خطأ أثناء الاتصال" : "A connection error occurred");
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercent = ((currentStep + 1) / TOTAL_STEPS) * 100;

  if (!isRegistrationOpen) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animated-bg" />
        <div className="relative z-10 bg-white/95 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl p-10 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-brand/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-9 h-9 text-brand" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{t("regUnavailableTitle")}</h1>
          <p className="text-gray-500 text-lg mb-8 leading-relaxed">{t("regUnavailableDesc")}</p>
          <Link
            href="/"
            className="inline-block bg-gray-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-black transition shadow-md"
          >
            {t("goBackHome")}
          </Link>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animated-bg" />
        <div className="relative z-10 bg-white/95 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl p-10 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{t("regSuccessTitle")}</h1>
          <p className="text-gray-500 text-lg mb-8 leading-relaxed">{t("regSuccessDesc")}</p>
          <Link
            href="/"
            className="inline-block bg-brand text-white px-8 py-3 rounded-full font-semibold hover:bg-brand-light transition shadow-md shadow-brand/20"
          >
            {t("regReturnHome")}
          </Link>
        </div>
      </div>
    );
  }

  const ErrorModal = () => (
    <>
      {showError && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setShowError(false)}
        />
      )}
      {showError && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
          <div className="pointer-events-auto bg-white/95 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full">
            <button
              onClick={() => setShowError(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{errorTitle}</h2>
            <p className="text-gray-700 mb-4">{errorMessage}</p>
            <button
              onClick={() => setShowError(false)}
              className="w-full px-4 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-black transition"
            >
              {lang === "ar" ? "فهمت" : "Got it"}
            </button>
          </div>
        </div>
      )}
    </>
  );

  const ConfirmationModal = () => (
    <>
      {showConfirmation && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setShowConfirmation(false)}
        />
      )}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
          <div className="pointer-events-auto bg-white/95 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full">
            <button
              onClick={() => setShowConfirmation(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {lang === "ar" ? "تأكيد التسجيل" : "Confirm Registration"}
            </h2>
            <div className="space-y-3 mb-6 bg-gray-50 rounded-2xl p-4">
              <div>
                <p className="text-xs text-gray-500 font-semibold">{lang === "ar" ? "الاسم" : "Name"}</p>
                <p className="text-gray-800 font-semibold">{getValues("full_name")}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">{lang === "ar" ? "البريد" : "Email"}</p>
                <p className="text-gray-800 font-semibold break-all">{getValues("email")}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-3 text-gray-600 font-semibold rounded-full border-2 border-gray-200 hover:bg-gray-50 transition"
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={handleConfirmedSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-brand text-white font-semibold rounded-full hover:bg-brand-light transition disabled:opacity-70"
              >
                {isSubmitting ? (lang === "ar" ? "جاري..." : "Submitting...") : (lang === "ar" ? "تأكيد" : "Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col items-center p-4 pt-8 pb-12 relative">
      <div className="animated-bg" />
      <ErrorModal />
      <ConfirmationModal />

      <div className="relative z-10 w-full max-w-[580px]">
        <header className="flex justify-center items-center relative mb-12">
          <Link href="/" className="inline-block z-10 hover:scale-105 transition-transform">
            <Image
              src="/image/khotwa-logo.png"
              alt="Khotwa Logo"
              width={120}
              height={120}
              className="h-28 w-auto object-contain drop-shadow-md"
            />
          </Link>
          <button
            onClick={toggleLang}
            type="button"
            className="absolute start-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md border border-gray-200 rounded-full px-4 py-2 text-sm font-semibold text-gray-800 hover:text-brand transition z-10"
          >
            {lang === "ar" ? "English" : "عربي"}
          </button>
        </header>

        <div className="bg-white/95 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl p-8 md:p-10">
          <div className="mb-8">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-brand rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">
              {t("stepWord")} {currentStep + 1} / {TOTAL_STEPS}
            </p>
          </div>

          <form onSubmit={handleFormSubmit}>
            {/* Step 1 */}
            {currentStep === 0 && (
              <div className="step-card active">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("regNewStep1Title")}</h2>
                <p className="text-gray-500 text-lg mb-8">{t("regNewStep1Desc")}</p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      {t("regFullName")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("regFullNamePlaceholder")}
                      {...register("full_name")}
                      className={`w-full px-4 py-3.5 text-lg border-2 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 outline-none transition ${
                        errors.full_name ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-brand focus:ring-brand/10"
                      }`}
                    />
                    {errors.full_name && <p className="text-red-600 text-sm mt-1">{errors.full_name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-4">
                      {t("regGender")}
                    </label>
                    <div className="flex gap-8">
                      {[
                        { value: "male", labelKey: "regMale" },
                        { value: "female", labelKey: "regFemale" },
                      ].map((opt) => (
                        <label
                          key={opt.value}
                          className="flex items-center cursor-pointer text-lg font-medium text-gray-800"
                        >
                          <input
                            type="radio"
                            value={opt.value}
                            {...register("gender")}
                            className="absolute opacity-0"
                          />
                          <span className="custom-radio" />
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          <span>{t(opt.labelKey as any)}</span>
                        </label>
                      ))}
                    </div>
                    {errors.gender && <p className="text-red-600 text-sm mt-2">{errors.gender.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      {t("regEmail")}
                    </label>
                    <input
                      type="email"
                      placeholder={t("regEmailPlaceholder")}
                      {...register("email")}
                      className={`w-full px-4 py-3.5 text-lg border-2 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 outline-none transition ${
                        errors.email ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-brand focus:ring-brand/10"
                      }`}
                      dir="ltr"
                    />
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      {t("regPhoneNumber")}
                    </label>
                    <div className="flex gap-2">
                      <div className="w-20">
                        <select
                          {...register("phone_country")}
                          className="w-full px-2 py-3.5 text-lg border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition"
                        >
                          <option value="966">+966</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <input
                          type="tel"
                          placeholder={t("regPhoneNumberFieldPlaceholder")}
                          {...register("phone_number")}
                          onChange={handlePhoneChange}
                          maxLength={10}
                          className={`w-full px-4 py-3.5 text-lg border-2 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 outline-none transition ${
                            errors.phone_number ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-brand focus:ring-brand/10"
                          }`}
                          dir="ltr"
                        />
                      </div>
                    </div>
                    {errors.phone_number && <p className="text-red-600 text-sm mt-1">{errors.phone_number.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 1 && (
              <div className="step-card active">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("regNewStep2Title")}</h2>
                <p className="text-gray-500 text-lg mb-8">{t("regNewStep2Desc")}</p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      {t("regUniversity")}
                    </label>
                    <select
                      {...register("university")}
                      className={`w-full px-4 py-3.5 text-lg border-2 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 outline-none transition ${
                        errors.university ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-brand focus:ring-brand/10"
                      }`}
                    >
                      <option value="">Select University...</option>
                      {SAUDI_UNIVERSITIES.map((uni) => (
                        <option key={uni.en} value={uni.en}>
                          {lang === "ar" ? uni.ar : uni.en}
                        </option>
                      ))}
                    </select>
                    {errors.university && <p className="text-red-600 text-sm mt-1">{errors.university.message}</p>}

                    {selectedUniversity === "Other" && (
                      <div className="mt-3">
                        <input
                          type="text"
                          placeholder={lang === "ar" ? "اسم جامعتك" : "Enter your university name"}
                          {...register("university_other")}
                          className={`w-full px-4 py-3.5 text-lg border-2 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 outline-none transition ${
                            errors.university_other ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-brand focus:ring-brand/10"
                          }`}
                        />
                        {errors.university_other && <p className="text-red-600 text-sm mt-1">{errors.university_other.message}</p>}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      {t("regMajor")}
                    </label>
                    <select
                      {...register("major")}
                      className={`w-full px-4 py-3.5 text-lg border-2 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 outline-none transition ${
                        errors.major ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-brand focus:ring-brand/10"
                      }`}
                    >
                      <option value="">Select Major...</option>
                      {PROFESSIONAL_MAJORS.map((maj) => (
                        <option key={maj.en} value={maj.en}>
                          {lang === "ar" ? maj.ar : maj.en}
                        </option>
                      ))}
                    </select>
                    {errors.major && <p className="text-red-600 text-sm mt-1">{errors.major.message}</p>}

                    {selectedMajor === "Other" && (
                      <div className="mt-3">
                        <input
                          type="text"
                          placeholder={lang === "ar" ? "تخصصك" : "Enter your major"}
                          {...register("major_other")}
                          className={`w-full px-4 py-3.5 text-lg border-2 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 outline-none transition ${
                            errors.major_other ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-brand focus:ring-brand/10"
                          }`}
                        />
                        {errors.major_other && <p className="text-red-600 text-sm mt-1">{errors.major_other.message}</p>}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      {t("regUniId")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("regUniIdPlaceholder")}
                      {...register("uni_id")}
                      className={`w-full px-4 py-3.5 text-lg border-2 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 outline-none transition ${
                        errors.uni_id ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-brand focus:ring-brand/10"
                      }`}
                      dir="ltr"
                    />
                    {errors.uni_id && <p className="text-red-600 text-sm mt-1">{errors.uni_id.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      {t("regGraduationYear")}
                    </label>
                    <select
                      {...register("graduation_year")}
                      className={`w-full px-4 py-3.5 text-lg border-2 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 outline-none transition ${
                        errors.graduation_year ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-brand focus:ring-brand/10"
                      }`}
                    >
                      <option value="">Select Year...</option>
                      <option value="Fresh Graduate">{t("regFreshGraduate")}</option>
                      <option value="2027">{t("regYear2027")}</option>
                      <option value="2028">{t("regYear2028")}</option>
                      <option value="2029">{t("regYear2029")}</option>
                    </select>
                    {errors.graduation_year && <p className="text-red-600 text-sm mt-1">{errors.graduation_year.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      {t("regLinkedInOptional")}
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/yourprofile"
                      {...register("linkedin")}
                      className={`w-full px-4 py-3.5 text-lg border-2 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 outline-none transition ${
                        errors.linkedin ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-brand focus:ring-brand/10"
                      }`}
                      dir="ltr"
                    />
                    {errors.linkedin && <p className="text-red-600 text-sm mt-1">{errors.linkedin.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {currentStep === 2 && (
              <div className="step-card active">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("regNewStep3Title")}</h2>
                <p className="text-gray-500 text-lg mb-8">{t("regNewStep3Desc")}</p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      {t("regSkillsInput")}
                    </label>
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={addSkill}
                      placeholder={t("regSkillsPlaceholder")}
                      disabled={skills.length >= 7}
                      className="w-full px-4 py-3.5 text-lg border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition disabled:opacity-60"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {skills.length}/7 {lang === "ar" ? "مهارات" : "skills"}
                    </p>

                    {skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 text-brand rounded-full text-sm font-medium"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(idx)}
                              className="ml-1 hover:text-brand-dark"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    {errors.skills && <p className="text-red-600 text-sm mt-2">{errors.skills.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      {t("regExperienceProjects")}
                    </label>
                    <textarea
                      placeholder={t("regExperienceProjectsPlaceholder")}
                      {...register("experience_projects")}
                      rows={4}
                      className={`w-full px-4 py-3.5 text-lg border-2 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 outline-none transition resize-none ${
                        errors.experience_projects ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-brand focus:ring-brand/10"
                      }`}
                    />
                    {errors.experience_projects && <p className="text-red-600 text-sm mt-1">{errors.experience_projects.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      {t("regFreeSpace")}
                    </label>
                    <textarea
                      placeholder={t("regFreeSpacePlaceholder")}
                      {...register("free_space")}
                      rows={3}
                      className="w-full px-4 py-3.5 text-lg border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      {t("regCommitmentDuration")}
                    </label>
                    <select
                      {...register("commitment_duration")}
                      className={`w-full px-4 py-3.5 text-lg border-2 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 outline-none transition ${
                        errors.commitment_duration ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-brand focus:ring-brand/10"
                      }`}
                    >
                      <option value="">Select Duration...</option>
                      <option value="One week">{t("regCommitment1Week")}</option>
                      <option value="Two weeks">{t("regCommitment2Weeks")}</option>
                      <option value="One month">{t("regCommitment1Month")}</option>
                    </select>
                    {errors.commitment_duration && <p className="text-red-600 text-sm mt-1">{errors.commitment_duration.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">CV Upload</label>
                    <div
                      className={`file-drop-area ${dragOver ? "dragover" : ""}`}
                      onDrop={handleDrop}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                    >
                      <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
                      <span className={`text-lg font-semibold mb-2 break-all ${cvFile ? "text-brand" : "text-gray-800"}`}>
                        {cvFile ? cvFile.name : "Choose a file or drag it here"}
                      </span>
                      <span className="text-sm text-gray-400">PDF, JPG, PNG (max 10MB)</span>
                      <input
                        type="file"
                        accept=".pdf,image/jpeg,image/png"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Star Ratings */}
            {currentStep === 3 && (
              <div className="step-card active">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("regNewStep4Title")}</h2>
                <p className="text-gray-500 text-lg mb-2">{t("regNewStep4Desc")}</p>
                <p className="text-sm text-amber-600 mb-6">{t("regRateInstruction")}</p>

                <div className="space-y-8">
                  {/* Companies */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">{t("regCompanies")}</h3>
                    <div className="space-y-3">
                      {COMPANIES_LIST.map((company) => (
                        <div key={company} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-brand/50 transition">
                          <span className="font-semibold text-gray-800">{company}</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setCompanyRating(company, star)}
                                className="transition hover:scale-110"
                              >
                                <Star
                                  className={`w-6 h-6 ${
                                    companiesRatings[company] >= star
                                      ? "fill-brand text-brand"
                                      : "text-gray-300"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Job Titles */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">{t("regJobTitles")}</h3>
                    <div className="space-y-3">
                      {JOB_TITLES_LIST.map((job) => (
                        <div key={job} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-brand/50 transition">
                          <span className="font-semibold text-gray-800">{job}</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setJobRating(job, star)}
                                className="transition hover:scale-110"
                              >
                                <Star
                                  className={`w-6 h-6 ${
                                    jobRatings[job] >= star
                                      ? "fill-brand text-brand"
                                      : "text-gray-300"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center mt-10 pt-6 border-t border-gray-100">
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={goPrev}
                  className="px-6 py-3 text-base font-semibold rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
                >
                  {t("regBtnPrev")}
                </button>
              ) : (
                <div />
              )}

              <div className="flex-1" />

              {currentStep < TOTAL_STEPS - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="px-8 py-3 text-base font-semibold rounded-full bg-brand text-white hover:bg-brand-light transition shadow-md shadow-brand/25"
                >
                  {t("regBtnNext")}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !cvFile}
                  className="px-8 py-3 text-base font-semibold rounded-full bg-brand text-white hover:bg-brand-light transition shadow-md shadow-brand/25 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? t("regBtnUploading") : t("regBtnSubmit")}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
