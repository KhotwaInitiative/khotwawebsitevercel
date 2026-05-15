/**
 * Comprehensive professional skills data with English and Arabic translations
 * Organized by category: Computer/IT, Business, and General Skills
 */

export interface SkillOption {
  en: string;
  ar: string;
  category: "computer" | "business" | "general";
}

// Comprehensive Professional Skills (83+)
export const PROFESSIONAL_SKILLS: SkillOption[] = [
  // Computer/IT Skills (47)
  { en: "JavaScript", ar: "جافا سكريبت", category: "computer" },
  { en: "TypeScript", ar: "تايب سكريبت", category: "computer" },
  { en: "React", ar: "ريأكت", category: "computer" },
  { en: "React Native", ar: "ريأكت نيتيف", category: "computer" },
  { en: "Angular", ar: "أنجولار", category: "computer" },
  { en: "Vue.js", ar: "فيو جي إس", category: "computer" },
  { en: "Node.js", ar: "نود جي إس", category: "computer" },
  { en: "Python", ar: "بايثون", category: "computer" },
  { en: "Java", ar: "جافا", category: "computer" },
  { en: "C++", ar: "سي بلس بلس", category: "computer" },
  { en: "C#", ar: "سي شارب", category: "computer" },
  { en: "PHP", ar: "بي إتش بي", category: "computer" },
  { en: "SQL", ar: "إس كيو إل", category: "computer" },
  { en: "MongoDB", ar: "مونجو دي بي", category: "computer" },
  { en: "PostgreSQL", ar: "بوست جري إس كيو إل", category: "computer" },
  { en: "Firebase", ar: "فاير بيس", category: "computer" },
  { en: "AWS", ar: "أمازون ويب سرفيسز", category: "computer" },
  { en: "Azure", ar: "مايكروسوفت أزور", category: "computer" },
  { en: "Google Cloud", ar: "جوجل كلاود", category: "computer" },
  { en: "Docker", ar: "دوكر", category: "computer" },
  { en: "Kubernetes", ar: "كوبرنيتس", category: "computer" },
  { en: "REST API", ar: "واجهات برمجية REST", category: "computer" },
  { en: "GraphQL", ar: "جراف كيو إل", category: "computer" },
  { en: "Git", ar: "جيت", category: "computer" },
  { en: "CI/CD", ar: "التكامل والنشر المستمر", category: "computer" },
  { en: "Machine Learning", ar: "تعلم الآلة", category: "computer" },
  { en: "AI", ar: "الذكاء الاصطناعي", category: "computer" },
  { en: "Data Analysis", ar: "تحليل البيانات", category: "computer" },
  { en: "Big Data", ar: "البيانات الضخمة", category: "computer" },
  { en: "Web Development", ar: "تطوير الويب", category: "computer" },
  { en: "Mobile Development", ar: "تطوير الجوال", category: "computer" },
  { en: "iOS", ar: "آي أو إس", category: "computer" },
  { en: "Android", ar: "أندرويد", category: "computer" },
  { en: "Full Stack", ar: "فول ستاك", category: "computer" },
  { en: "HTML/CSS", ar: "إتش تي إم إل وسي إس إس", category: "computer" },
  { en: "Responsive Design", ar: "تصميم واجهات مستجيبة", category: "computer" },
  { en: "UI/UX Design", ar: "تصميم واجهات المستخدم", category: "computer" },
  { en: "Figma", ar: "فيجما", category: "computer" },
  { en: "Adobe XD", ar: "أدوبي إكس دي", category: "computer" },
  { en: "Agile", ar: "أجايل", category: "computer" },
  { en: "Linux", ar: "لينكس", category: "computer" },
  { en: "Cybersecurity", ar: "الأمن السيبراني", category: "computer" },
  { en: "Network Management", ar: "إدارة الشبكات", category: "computer" },
  { en: "QA Testing", ar: "اختبار جودة البرمجيات", category: "computer" },
  { en: "Selenium", ar: "سيلينيوم", category: "computer" },
  { en: "DevOps", ar: "ديفوبس", category: "computer" },
  { en: "Microservices", ar: "الخدمات الدقيقة", category: "computer" },

  // Business Skills (25)
  { en: "Project Management", ar: "إدارة المشاريع", category: "business" },
  { en: "Financial Analysis", ar: "التحليل المالي", category: "business" },
  { en: "Accounting", ar: "المحاسبة", category: "business" },
  { en: "Business Analytics", ar: "تحليلات الأعمال", category: "business" },
  { en: "Marketing Strategy", ar: "استراتيجية التسويق", category: "business" },
  { en: "Digital Marketing", ar: "التسويق الرقمي", category: "business" },
  { en: "Social Media", ar: "إدارة وسائل التواصل", category: "business" },
  { en: "Content Marketing", ar: "تسويق المحتوى", category: "business" },
  { en: "Sales", ar: "المبيعات", category: "business" },
  { en: "CRM", ar: "إدارة العلاقات", category: "business" },
  { en: "HR Management", ar: "إدارة الموارد البشرية", category: "business" },
  { en: "Recruitment", ar: "التوظيف", category: "business" },
  { en: "Data-Driven Decision", ar: "القرارات المبنية على البيانات", category: "business" },
  { en: "Strategic Planning", ar: "التخطيط الاستراتيجي", category: "business" },
  { en: "Operations", ar: "إدارة العمليات", category: "business" },
  { en: "Supply Chain", ar: "إدارة سلسلة التوريد", category: "business" },
  { en: "Vendor Management", ar: "إدارة الموردين", category: "business" },
  { en: "Process Improvement", ar: "تحسين العمليات", category: "business" },
  { en: "Six Sigma", ar: "سيكس سيجما", category: "business" },
  { en: "Lean Management", ar: "إدارة لين", category: "business" },
  { en: "Business Intelligence", ar: "ذكاء الأعمال", category: "business" },
  { en: "ERP", ar: "تخطيط موارد المؤسسات", category: "business" },
  { en: "Risk Management", ar: "إدارة المخاطر", category: "business" },
  { en: "Compliance", ar: "الالتزام والتنظيمات", category: "business" },
  { en: "Negotiation", ar: "التفاوض", category: "business" },

  // General Skills (13)
  { en: "Communication", ar: "التواصل", category: "general" },
  { en: "Teamwork", ar: "العمل الجماعي", category: "general" },
  { en: "Leadership", ar: "القيادة", category: "general" },
  { en: "Problem Solving", ar: "حل المشاكل", category: "general" },
  { en: "Critical Thinking", ar: "التفكير الناقد", category: "general" },
  { en: "Creativity", ar: "الإبداع", category: "general" },
  { en: "Time Management", ar: "إدارة الوقت", category: "general" },
  { en: "Adaptability", ar: "القدرة على التكيف", category: "general" },
  { en: "Attention to Detail", ar: "الاهتمام بالتفاصيل", category: "general" },
  { en: "Written Communication", ar: "التواصل الكتابي", category: "general" },
  { en: "Presentation", ar: "مهارات العرض", category: "general" },
  { en: "Emotional Intelligence", ar: "الذكاء العاطفي", category: "general" },
  { en: "Work Ethic", ar: "أخلاقيات العمل", category: "general" },
];

export function getSkillsByCategory(category: "computer" | "business" | "general"): SkillOption[] {
  return PROFESSIONAL_SKILLS.filter((skill) => skill.category === category);
}

export function getAllSkillsGrouped(): {
  computer: SkillOption[];
  business: SkillOption[];
  general: SkillOption[];
} {
  return {
    computer: getSkillsByCategory("computer"),
    business: getSkillsByCategory("business"),
    general: getSkillsByCategory("general"),
  };
}

export function getSkillByName(englishName: string): SkillOption | undefined {
  return PROFESSIONAL_SKILLS.find((skill) => skill.en.toLowerCase() === englishName.toLowerCase());
}

export function skillExists(englishName: string): boolean {
  return PROFESSIONAL_SKILLS.some((skill) => skill.en.toLowerCase() === englishName.toLowerCase());
}
