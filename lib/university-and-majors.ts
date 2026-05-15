/**
 * Comprehensive list of Saudi Arabian universities and professional majors
 * with English and Arabic translations
 */

export interface UniversityOption {
  en: string;
  ar: string;
}

export interface MajorOption {
  en: string;
  ar: string;
  category: "computer" | "business";
}

// Major Saudi Universities (30+)
export const SAUDI_UNIVERSITIES: UniversityOption[] = [
  { en: "King Saud University", ar: "جامعة الملك سعود" },
  { en: "King Fahd University of Petroleum and Minerals", ar: "جامعة الملك فهد للبترول والمعادن" },
  { en: "King Abdulaziz University", ar: "جامعة الملك عبدالعزيز" },
  { en: "Princess Nourah bint Abdulrahman University", ar: "جامعة الأميرة نورة بنت عبدالرحمن" },
  { en: "Imam Muhammad ibn Saud Islamic University", ar: "جامعة الإمام محمد بن سعود الإسلامية" },
  { en: "King Faisal University", ar: "جامعة الملك فيصل" },
  { en: "Qassim University", ar: "جامعة القصيم" },
  { en: "Umm Al-Qura University", ar: "جامعة أم القرى" },
  { en: "Islamic University of Madinah", ar: "الجامعة الإسلامية بالمدينة المنورة" },
  { en: "Prince Sattam bin Abdulaziz University", ar: "جامعة الأمير سطام بن عبدالعزيز" },
  { en: "Taibah University", ar: "جامعة طيبة" },
  { en: "Najran University", ar: "جامعة نجران" },
  { en: "University of Tabuk", ar: "جامعة تبوك" },
  { en: "Jazan University", ar: "جامعة جازان" },
  { en: "Northern Borders University", ar: "جامعة الحدود الشمالية" },
  { en: "Prince Mohmmad bin Fahd University", ar: "جامعة الأمير محمد بن فهد" },
  { en: "Albaha University", ar: "جامعة الباحة" },
  { en: "Hail University", ar: "جامعة حائل" },
  { en: "King Abdulaziz University for Science and Technology", ar: "جامعة الملك عبدالعزيز للعلوم والتقنية" },
  { en: "Saudi Electronic University", ar: "الجامعة السعودية الإلكترونية" },
  { en: "Dammam University", ar: "جامعة الدمام" },
  { en: "Al Bayan University", ar: "جامعة البيان" },
  { en: "Riyadh Elm University", ar: "جامعة رياض العلم" },
  { en: "Alfaisal University", ar: "جامعة الفيصل" },
  { en: "Dar Al Uloom University", ar: "جامعة دار العلوم" },
  { en: "Al Yamamah University", ar: "جامعة اليمامة" },
  { en: "Other", ar: "أخرى" },
];

// Professional Majors (20+): Computer Science (10) + Business Administration (10)
export const PROFESSIONAL_MAJORS: MajorOption[] = [
  // Computer Science & IT Majors
  { en: "Software Engineering", ar: "هندسة البرمجيات", category: "computer" },
  { en: "Computer Science", ar: "علوم الحاسب", category: "computer" },
  { en: "Information Technology", ar: "تقنية المعلومات", category: "computer" },
  { en: "Data Science", ar: "علم البيانات", category: "computer" },
  { en: "Cybersecurity", ar: "الأمن السيبراني", category: "computer" },
  { en: "Artificial Intelligence", ar: "الذكاء الاصطناعي", category: "computer" },
  { en: "Computer Engineering", ar: "هندسة الحاسب", category: "computer" },
  { en: "Information Systems", ar: "نظم المعلومات", category: "computer" },
  { en: "Web Development", ar: "تطوير الويب", category: "computer" },
  { en: "Cloud Computing", ar: "الحوسبة السحابية", category: "computer" },

  // Business Administration Majors
  { en: "Business Administration", ar: "إدارة الأعمال", category: "business" },
  { en: "Finance", ar: "المالية", category: "business" },
  { en: "Human Resources Management", ar: "إدارة الموارد البشرية", category: "business" },
  { en: "Marketing", ar: "التسويق", category: "business" },
  { en: "Accounting", ar: "المحاسبة", category: "business" },
  { en: "Entrepreneurship", ar: "ريادة الأعمال", category: "business" },
  { en: "Supply Chain Management", ar: "إدارة سلسلة التوريد", category: "business" },
  { en: "Project Management", ar: "إدارة المشاريع", category: "business" },
  { en: "Business Analytics", ar: "تحليل الأعمال", category: "business" },
  { en: "Organizational Behavior", ar: "السلوك التنظيمي", category: "business" },

  // Other option
  { en: "Other", ar: "أخرى", category: "computer" },
];

// Helper function to get all universities as simple options for dropdown
export const getUniversityOptions = () =>
  SAUDI_UNIVERSITIES.map((u) => ({ value: u.en, label: u }));

// Helper function to get majors by category
export const getMajorsByCategory = (category: "computer" | "business") =>
  PROFESSIONAL_MAJORS.filter((m) => m.category === category);

// Helper function to get all majors for dropdown
export const getAllMajorOptions = () =>
  PROFESSIONAL_MAJORS.map((m) => ({ value: m.en, label: m }));
