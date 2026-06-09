/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

const CV_BUCKET = "cv-uploads";

const sanitizeFileName = (name: string) =>
  name
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Step 1: Personal Information
    const full_name = formData.get("full_name")?.toString() || "";
    const gender = formData.get("gender")?.toString() || "";
    const email = formData.get("email")?.toString() || "";
    const phone_number = formData.get("phone_number")?.toString() || "";

    // Step 2: Academic Information
    const university = formData.get("university")?.toString() || "";
    const university_custom =
      formData.get("university_other")?.toString() ||
      formData.get("university_custom")?.toString() ||
      "";
    const major = formData.get("major")?.toString() || "";
    const major_custom =
      formData.get("major_other")?.toString() ||
      formData.get("major_custom")?.toString() ||
      "";
    const uni_id = formData.get("uni_id")?.toString() || "";
    const graduation_year = formData.get("graduation_year")?.toString() || "";
    const linkedin = formData.get("linkedin")?.toString() || "";

    // Step 3: Skills & Experience
    const skillsRaw = formData.get("skills")?.toString() || "[]";
    const skills = JSON.parse(skillsRaw) as string[];
    const experience_projects = formData.get("experience_projects")?.toString() || "";
    const commitment_duration = formData.get("commitment_duration")?.toString() || "";

    // Step 4: Company & Expertise Fields
    const companiesRatingsRaw = formData.get("companies_ratings")?.toString() || "[]";
    const expertiseFieldsRaw = formData.get("expertise_fields")?.toString() || "[]";
    const companies_ratings = JSON.parse(companiesRatingsRaw) as string[];
    const expertise_fields = JSON.parse(expertiseFieldsRaw) as unknown[];

    // CV File
    const cvFile = formData.get("cv_file") as File | null;

    // Validate required fields
    if (
      !full_name || !gender || !email || !phone_number ||
      !university || !major || !uni_id || !graduation_year || !commitment_duration ||
      !Array.isArray(expertise_fields) || expertise_fields.length === 0 ||
      !cvFile
    ) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Validate phone format (must start with 05 and be 10 digits)
    const phoneRegex = /^05\d{8}$/;
    if (!phoneRegex.test(phone_number)) {
      return NextResponse.json({ error: "Phone number must start with 05 and be 10 digits." }, { status: 400 });
    }

    const { data: existingPhone, error: phoneLookupError } = await supabaseAdmin
      .from("registrations")
      .select("id")
      .eq("phone_number", phone_number)
      .maybeSingle();

    if (phoneLookupError) {
      throw new Error(`Failed to check phone number: ${phoneLookupError.message}`);
    }

    if (existingPhone) {
      return NextResponse.json(
        {
          error: "This phone number is already registered.",
          code: "PHONE_ALREADY_EXISTS",
        },
        { status: 409 }
      );
    }

    // Validate all companies are ordered (10 companies expected)
    const expectedCompaniesLower = [
      "qabas",
      "jnh systems",
      "rize",
      "هاتف",
      "ودائع",
      "vrtx",
      "atheer connectivity",
      "شركة تطبيق بلورة لتقنية المعلومات",
      "aya",
      "مسمار"
    ];

    if (!Array.isArray(companies_ratings) || companies_ratings.length !== 10) {
      return NextResponse.json({ error: "Invalid companies order list." }, { status: 400 });
    }

    for (let i = 0; i < 10; i++) {
      const item = companies_ratings[i];
      const prefix = `${i + 1}-`;
      if (!item || !item.startsWith(prefix)) {
        return NextResponse.json({ error: `Invalid order format at rank ${i + 1}.` }, { status: 400 });
      }
      const companyName = item.substring(prefix.length).toLowerCase();
      if (!expectedCompaniesLower.includes(companyName)) {
        return NextResponse.json({ error: `Unknown company: ${companyName}` }, { status: 400 });
      }
    }

    // Validate skills array (max 7)
    if (!Array.isArray(skills) || skills.length === 0 || skills.length > 7) {
      return NextResponse.json({ error: "Please add 1-7 skills." }, { status: 400 });
    }

    // Validate File Size (10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (cvFile.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds 10MB limit." }, { status: 400 });
    }

    // Validate File Type (Strict MIME checking)
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(cvFile.type)) {
      return NextResponse.json({ error: "Invalid file type. Only PDF, JPG, and PNG are allowed." }, { status: 400 });
    }

    // Upload CV file
    const buffer = Buffer.from(await cvFile.arrayBuffer());
    const safeFileName = sanitizeFileName(cvFile.name);
    const filePath = `${uni_id}/${Date.now()}_${safeFileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(CV_BUCKET)
      .upload(filePath, buffer, {
        contentType: cvFile.type || "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload CV: ${uploadError.message}`);
    }

    const { data: publicData } = supabaseAdmin.storage.from(CV_BUCKET).getPublicUrl(filePath);
    const cv_url = publicData.publicUrl;

    // Determine final university and major (use custom if provided)
    const finalUniversity = university === "Other" ? university_custom : university;
    const finalMajor = major === "Other" ? major_custom : major;

    // Insert into database
    const { data: insertedRow, error: insertError } = await supabaseAdmin
      .from("registrations")
      .insert({
        full_name,
        gender,
        email,
        phone_number,
        university: finalUniversity,
        major: finalMajor,
        uni_id,
        graduation_year,
        linkedin,
        skills,
        experience_projects,
        commitment_duration,
        cv_path: filePath,
        cv_url,
        companies_ratings,
        expertise_fields,
      })
      .select("id, created_at")
      .single();

    if (insertError) {
      await supabaseAdmin.storage.from(CV_BUCKET).remove([filePath]);
      if (insertError.code === "23505") {
        return NextResponse.json(
          {
            error: "This phone number is already registered.",
            code: "PHONE_ALREADY_EXISTS",
          },
          { status: 409 }
        );
      }
      throw new Error(`Failed to save registration: ${insertError.message}`);
    }

    return NextResponse.json(
      {
        success: true,
        registration: {
          id: insertedRow.id,
          created_at: insertedRow.created_at,
          cv_path: filePath,
          cv_url,
        },
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Registration Server Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
