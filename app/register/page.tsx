"use client";

import { useState, ChangeEvent, DragEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import Image from "next/image";
import { Lock, CheckCircle, UploadCloud, X, Check, ChevronUp, ChevronDown } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { SAUDI_UNIVERSITIES, PROFESSIONAL_MAJORS } from "@/lib/university-and-majors";
import { getAllSkillsGrouped } from "@/lib/skills";

const TOTAL_STEPS = 4;

const COMPANIES_LIST = [
  "Qabas",
  "JNH Systems",
  "Rize",
  "هاتف",
  "ودائع",
  "vrtx",
  "Atheer Connectivity",
  "شركة تطبيق بلورة لتقنية المعلومات",
  "Aya"
];

const EXPERTISE_FIELDS_LIST = [
  "Software Engineering",
  "Mobile App Development",
  "Data Analysis",
  "Product Management",
  "Business Analysis",
  "DevOps / Cloud Computing",
  "UI/UX Design",
  "AI / Computer Vision",
  "Frontend Development",
  "Backend Development",
  "Other"
];

interface SelectedField {
  name: string;
  score: number;
  isCustom?: boolean;
}

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
  experience_projects: z.string().optional().or(z.literal("")),
  commitment_duration: z.string().min(1, "Commitment duration is required"),
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
  const [skillsDropdownOpen, setSkillsDropdownOpen] = useState(false);
  const [searchSkill, setSearchSkill] = useState("");
  const [companiesOrder, setCompaniesOrder] = useState<string[]>(COMPANIES_LIST);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [selectedFields, setSelectedFields] = useState<SelectedField[]>([]);

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
      if (companiesOrder.length !== COMPANIES_LIST.length) {
        setShowError(true);
        setErrorTitle(lang === "ar" ? "ترتيب مطلوب" : "Ordering Required");
        setErrorMessage(
          lang === "ar"
            ? "يرجى ترتيب جميع الشركات"
            : "Please order all companies"
        );
        return false;
      }

      if (selectedFields.length === 0) {
        setShowError(true);
        setErrorTitle(lang === "ar" ? "مجالات الخبرة مطلوبة" : "Expertise Fields Required");
        setErrorMessage(
          lang === "ar"
            ? "يرجى اختيار مجال خبرة واحد على الأقل (بحد أقصى 2)"
            : "Please select at least one expertise field (maximum 2)"
        );
        return false;
      }

      const hasInvalidCustomField = selectedFields.some(
        (f) => f.isCustom && !f.name.trim()
      );
      if (hasInvalidCustomField) {
        setShowError(true);
        setErrorTitle(lang === "ar" ? "تحديد المجال مطلوب" : "Expertise Field Name Required");
        setErrorMessage(
          lang === "ar"
            ? "يرجى كتابة اسم مجال الخبرة المخصص"
            : "Please specify the custom expertise field name"
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

  const handleSubmitClick = async () => {
    // Validate step 3 before showing confirmation
    const isValid = await validateStep();
    if (isValid) {
      setShowConfirmation(true);
    }
  };

  const addSkill = (skill: string) => {
    const currentSkills = getValues("skills") || [];
    const lowerSkill = skill.trim().toLowerCase();
    
    // Check if skill already exists (case-insensitive)
    if (currentSkills.some(s => s.toLowerCase() === lowerSkill)) {
      return; // Skill already added
    }
    
    if (currentSkills.length < 7 && lowerSkill) {
      const newSkills = [...currentSkills, lowerSkill];
      setValue("skills", newSkills);
      setSkillInput("");
      setSearchSkill("");
      setSkillsDropdownOpen(false);
      clearErrors("skills");
    }
  };

  const handleSkillInputKeypress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (skillInput.trim()) {
        addSkill(skillInput);
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

  const moveCompany = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= companiesOrder.length) return;

    const updatedList = [...companiesOrder];
    const temp = updatedList[index];
    updatedList[index] = updatedList[newIndex];
    updatedList[newIndex] = temp;

    setCompaniesOrder(updatedList);
  };

  const handleCompanyDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleCompanyDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleCompanyDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updatedList = [...companiesOrder];
    const draggedItem = updatedList[draggedIndex];
    updatedList.splice(draggedIndex, 1);
    updatedList.splice(index, 0, draggedItem);

    setCompaniesOrder(updatedList);
    setDraggedIndex(null);
  };

  const isFieldSelected = (fieldName: string) => {
    if (fieldName === "Other") {
      return selectedFields.some((f) => f.isCustom);
    }
    return selectedFields.some((f) => f.name === fieldName && !f.isCustom);
  };

  const toggleField = (fieldName: string) => {
    const isSelected = isFieldSelected(fieldName);
    if (isSelected) {
      setSelectedFields((prev) => {
        if (fieldName === "Other") {
          return prev.filter((f) => !f.isCustom);
        }
        return prev.filter((f) => !(f.name === fieldName && !f.isCustom));
      });
    } else {
      if (selectedFields.length >= 2) return;
      setSelectedFields((prev) => {
        if (fieldName === "Other") {
          return [...prev, { name: "", score: 5, isCustom: true }];
        } else {
          return [...prev, { name: fieldName, score: 5, isCustom: false }];
        }
      });
    }
  };

  const updateFieldScore = (index: number, newScore: number) => {
    setSelectedFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, score: newScore } : f))
    );
  };

  const updateCustomFieldName = (index: number, newName: string) => {
    setSelectedFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, name: newName } : f))
    );
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
      formData.append("experience_projects", data.experience_projects || "");
      formData.append("commitment_duration", data.commitment_duration);
      const formattedCompaniesOrder = companiesOrder.map((name, index) => `${index + 1}-${name.toLowerCase()}`);
      formData.append("companies_ratings", JSON.stringify(formattedCompaniesOrder));
      formData.append("expertise_fields", JSON.stringify(selectedFields));
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

  // Close dropdown when clicking outside
  const handleClickOutside = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".skills-dropdown-wrapper")) {
      setSkillsDropdownOpen(false);
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
              <div>
                <p className="text-xs text-gray-500 font-semibold">{lang === "ar" ? "مجالات الخبرة" : "Expertise Fields"}</p>
                <div className="space-y-1 mt-1">
                  {selectedFields.map((field, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-gray-800 font-semibold">
                      <span>{field.name || (lang === "ar" ? "مخصص" : "Custom")}</span>
                      <span className="text-brand">({field.score}/10)</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">{lang === "ar" ? "ترتيب الشركات (المفضلة أولاً)" : "Companies Order (Fav First)"}</p>
                <p className="text-gray-800 font-semibold text-sm break-words">
                  {companiesOrder.slice(0, 3).join(" > ")}...
                </p>
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

          <form onSubmit={handleFormSubmit} onClick={handleClickOutside}>
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
                    
                    {/* Skills Dropdown Section */}
                    <div className="relative mb-4 skills-dropdown-wrapper">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => {
                            setSkillInput(e.target.value);
                            setSearchSkill(e.target.value.toLowerCase());
                            if (e.target.value) setSkillsDropdownOpen(true);
                          }}
                          onKeyDown={handleSkillInputKeypress}
                          onFocus={() => setSkillsDropdownOpen(true)}
                          placeholder={t("regSkillsPlaceholder")}
                          disabled={skills.length >= 7}
                          className="flex-1 px-4 py-3.5 text-lg border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition disabled:opacity-60"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (skillInput.trim()) {
                              addSkill(skillInput);
                            }
                          }}
                          disabled={skills.length >= 7 || !skillInput.trim()}
                          className="px-6 py-3.5 bg-brand text-white font-semibold rounded-xl hover:bg-brand-dark transition disabled:opacity-50"
                        >
                          {lang === "ar" ? "إضافة" : "Add"}
                        </button>
                      </div>

                      {/* Skills Dropdown Menu */}
                      {skillsDropdownOpen && skills.length < 7 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
                          {(() => {
                            const skillsGrouped = getAllSkillsGrouped();
                            const allSkillsLower = skills.map(s => s.toLowerCase());
                            let hasResults = false;

                            return (
                              <>
                                {Object.entries(skillsGrouped).map(([category, categorySkills]) => {
                                  const filtered = categorySkills.filter(
                                    (skill) =>
                                      skill.en.toLowerCase().includes(searchSkill) &&
                                      !allSkillsLower.includes(skill.en.toLowerCase())
                                  );

                                  if (filtered.length === 0) return null;
                                  hasResults = true;

                                  const categoryLabels: Record<string, string> = {
                                    computer: lang === "ar" ? "تكنولوجيا المعلومات" : "Computer & IT",
                                    business: lang === "ar" ? "الأعمال" : "Business",
                                    general: lang === "ar" ? "عام" : "General",
                                  };

                                  return (
                                    <div key={category}>
                                      <div className="px-4 py-2 bg-gray-100 font-semibold text-sm text-gray-700 sticky top-0">
                                        {categoryLabels[category as keyof typeof categoryLabels]}
                                      </div>
                                      {filtered.map((skill) => (
                                        <button
                                          key={skill.en}
                                          type="button"
                                          onClick={() => addSkill(skill.en)}
                                          className="w-full text-left px-4 py-2 hover:bg-brand/10 transition flex justify-between items-center"
                                        >
                                          <span className="text-gray-800">{skill.en}</span>
                                          <span className="text-xs text-gray-500">{skill.ar}</span>
                                        </button>
                                      ))}
                                    </div>
                                  );
                                })}
                                {!hasResults && (
                                  <div className="px-4 py-3 text-center text-gray-500 text-sm">
                                    {lang === "ar" ? "لا توجد نتائج" : "No results found"}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mb-2">
                      {skills.length}/7 {lang === "ar" ? "مهارات" : "skills"}
                    </p>

                    {skills.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
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
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      {lang === "ar" ? "رتب الشركات الشريكة (اسحب وأفلت أو استخدم الأسهم للترتيب من المفضلة إلى الأقل تفضيلاً)" : "Order Partner Companies (Drag & drop or use arrows to order from favorite to least favorite)"}
                    </h3>
                    <div className="space-y-3">
                      {companiesOrder.map((company, index) => (
                        <div
                          key={company}
                          draggable
                          onDragStart={(e) => handleCompanyDragStart(e, index)}
                          onDragOver={handleCompanyDragOver}
                          onDrop={(e) => handleCompanyDrop(e, index)}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-brand/50 transition cursor-grab active:cursor-grabbing select-none"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 flex items-center justify-center bg-brand text-white font-bold rounded-full text-sm">
                              {index + 1}
                            </span>
                            <span className="font-semibold text-gray-800">{company}</span>
                          </div>
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => moveCompany(index, "up")}
                              className="p-2 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 disabled:opacity-30 disabled:pointer-events-none transition text-gray-600"
                              title="Move Up"
                            >
                              <ChevronUp className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              disabled={index === companiesOrder.length - 1}
                              onClick={() => moveCompany(index, "down")}
                              className="p-2 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 disabled:opacity-30 disabled:pointer-events-none transition text-gray-600"
                              title="Move Down"
                            >
                              <ChevronDown className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expertise Fields */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      {lang === "ar" ? "مجالات الخبرة (اختر حتى 2)" : "Expertise Fields (Select up to 2)"}
                    </h3>
                    <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4">
                      {EXPERTISE_FIELDS_LIST.map((field) => {
                        const selectedIndex = selectedFields.findIndex((f) =>
                          field === "Other" ? f.isCustom : f.name === field && !f.isCustom
                        );
                        const isSelected = selectedIndex !== -1;
                        const isLockout = selectedFields.length >= 2 && !isSelected;

                        return (
                          <div
                            key={field}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                              isSelected
                                ? "border-brand bg-brand/5"
                                : isLockout
                                ? "border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed"
                                : "border-gray-200 bg-gray-50 hover:border-brand/50 cursor-pointer"
                            }`}
                            onClick={() => {
                              if (isLockout) return;
                              toggleField(field);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`font-semibold ${isLockout ? "text-gray-400" : "text-gray-800"}`}>
                                {field === "Other" && lang === "ar" ? "أخرى" : field}
                              </span>
                              <div
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                  isSelected ? "border-brand bg-brand text-white" : "border-gray-300"
                                }`}
                              >
                                {isSelected && <Check className="w-4 h-4" />}
                              </div>
                            </div>

                            {isSelected && (
                              <div className="mt-4 pt-4 border-t border-brand/20 space-y-4" onClick={(e) => e.stopPropagation()}>
                                {field === "Other" && (
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-2">
                                      {lang === "ar" ? "حدد مجال الخبرة" : "Specify Expertise Field"}
                                    </label>
                                    <input
                                      type="text"
                                      placeholder={lang === "ar" ? "أدخل مجال خبرتك" : "Enter your expertise field"}
                                      value={selectedFields[selectedIndex].name}
                                      onChange={(e) => updateCustomFieldName(selectedIndex, e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand transition text-gray-800 bg-white"
                                    />
                                  </div>
                                )}

                                <div>
                                  <div className="flex justify-between text-xs text-gray-500 font-semibold mb-2">
                                    <span>{lang === "ar" ? "مستوى الإتقان:" : "Proficiency Level:"}</span>
                                    <span className="text-brand font-bold">{selectedFields[selectedIndex].score}/10</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={selectedFields[selectedIndex].score}
                                    onChange={(e) => updateFieldScore(selectedIndex, parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand"
                                  />
                                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                    <span>{lang === "ar" ? "مبتدئ" : "Beginner (1)"}</span>
                                    <span>{lang === "ar" ? "خبير" : "Expert (10)"}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
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
                  type="button"
                  onClick={handleSubmitClick}
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
