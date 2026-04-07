import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import { extractExperienceYears } from "./resumeJobRecommendation.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate a professional Job Description using Gemini AI
 * @param {Object} offerDetails - Details from offer
 * @param {Object} additionalDetails - Additional HR details
 * @returns {Promise<Object>} Generated JD content
 */
export const generateJDWithAI = async (offerDetails, additionalDetails) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an expert HR professional and job description writer. Create a professional, comprehensive job description based on the following information:

**Offer Details:**
- Job Title: ${offerDetails.jobTitle}
- Location: ${offerDetails.location}${offerDetails.city ? `, ${offerDetails.city}` : ""}
- Employment Type: ${offerDetails.employmentType}
- Positions Available: ${offerDetails.positionAvailable}
- Salary: ${offerDetails.salary} ${offerDetails.currency}
- Required Skills: ${offerDetails.skills.join(", ")}
- Preferred Skills: ${offerDetails.preferredSkills && offerDetails.preferredSkills.length > 0 ? offerDetails.preferredSkills.join(", ") : "None specified"}
- Experience Required: ${offerDetails.experience}

**Additional HR Details:**
- Company Name: ${additionalDetails.companyName || "Not specified"}
- Key Responsibilities: ${additionalDetails.keyResponsibilities || "Not specified"}
- Required Qualifications: ${additionalDetails.qualifications || "Not specified"}
- Benefits: ${additionalDetails.benefits || "Not specified"}
- Company Culture/Additional Notes: ${additionalDetails.additionalNotes || "Not specified"}

Please generate a professional job description with the following sections in JSON format:
{
  "jobSummary": "A compelling 2-3 sentence overview of the position",
  "responsibilities": ["Array of 6-8 key responsibilities"],
  "requirements": ["Array of 6-8 essential requirements and qualifications"],
  "benefits": ["Array of benefits and perks"],
  "additionalInfo": "Any additional information about the role or company culture"
}

Make sure the description is professional, engaging, and tailored to attract the right candidates.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response as JSON");
    }

    const generatedJD = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      data: generatedJD,
      raw: text,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Suggest skills for a requisition form (RMG) using job context.
 * @param {{ jobTitle: string, description?: string, employmentType?: string, experience?: string, workMode?: string }} ctx
 * @returns {Promise<{ success: boolean, skills?: string[], error?: string }>}
 */
export const suggestSkillsForRequisition = async (ctx) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const {
      jobTitle,
      description = "",
      employmentType = "",
      experience = "",
      workMode = "",
    } = ctx;

    const prompt = `You are an expert technical recruiter. Based on the job information below, suggest 8–14 concise, industry-standard skill names (technologies, frameworks, tools, or domain skills) relevant to this role.

Return ONLY valid JSON (no markdown fences):
{"skills":["Skill One","Skill Two"]}

Rules:
- Short phrases only (1–4 words each).
- No duplicate or near-duplicate entries.
- Prefer specific technologies over vague terms like "communication" unless the role is clearly non-technical.
- If the role is non-technical, suggest domain-relevant skills only.

Job title: ${jobTitle}
Description: ${description || "Not provided"}
Employment type: ${employmentType || "Not specified"}
Work mode: ${workMode || "Not specified"}
Experience required: ${experience || "Not specified"}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response as JSON");
    }
    const parsed = JSON.parse(jsonMatch[0]);
    const raw = Array.isArray(parsed.skills) ? parsed.skills : [];
    const skills = [...new Set(raw.map((s) => String(s).trim()).filter(Boolean))].slice(0, 16);
    return { success: true, skills };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      skills: [],
    };
  }
};

// Filter resumes with AI for a JD
// export async function filterResumesWithAI(jd, candidates) {
//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
//  const prompt = `
// You are a senior technical recruiter and professional resume evaluator.

// Your job: 
// For each candidate, **download and analyze the resume from the provided URL**.
// You MUST read the file content. DO NOT guess. If the resume cannot be analyzed, mark the candidate as unfiltered with explanation.

// STRICT RULES:
// 1. Determine if the file is an actual resume (CV/biodata). 
//    - If it looks like a marksheet, photo, certificate, or unrelated file → mark as unfiltered.
// 2. Extract skills, experience, education, and job-role relevance from the resume.
// 3. Compare it with the Job Description.

// Job Description:
// Title: ${jd.jobSummary}
// Responsibilities: ${jd.responsibilities.join(", ")}
// Requirements: ${jd.requirements.join(", ")}

// Return JSON ONLY in this format:
// {
//   "filtered": [
//     {
//       "id": "candidateId",
//       "score": 0-100,
//       "explanation": "1-2 sentence professional explanation"
//     }
//   ],
//   "unfiltered": [
//     {
//       "id": "candidateId",
//       "score": 0-100,
//       "explanation": "1-2 sentence professional explanation"
//     }
//   ]
// }

// Candidates:
// ${candidates.map(c => `
// {
//   "id": "${c.id}",
//   "name": "${c.name}",
//   "email": "${c.email}",
//   "resumeUrl": "${c.resume}",
//   "reallocate": ${c.reallocate}
// }
// `).join("\n")}

// VERY IMPORTANT:
// - Only mark a candidate as "filtered" if their resume content **strongly matches** the JD.
// - If resume is low quality, blank, marksheet, image, certificate → put in unfiltered and explain.
// - Be strict and professional like a real recruiter.
// `;

//     const result = await model.generateContent(prompt);
//     const response = result.response;
//     const text = response.text();
//     const jsonMatch = text.match(/\{[\s\S]*\}/);
//     if (!jsonMatch) throw new Error("Failed to parse AI response as JSON");
//     const parsed = JSON.parse(jsonMatch[0]);
//     return { success: true, filtered: parsed.filtered, unfiltered: parsed.unfiltered };
//   } catch (error) {
//     return { success: false, error: error.message };
//   }
// }




export async function downloadFile(url) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(res.data, "binary");
}


// export async function extractResumeText(resumeUrl) {
//   const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

//   const prompt = `
// You MUST open and read the file from this URL: ${resumeUrl}

// Your job:
// 1. Extract ALL readable text from the file.
// 2. DO NOT ASSUME anything.
// 3. If the file seems like a marksheet, photo, certificate, school document, or non-resume → clearly state it.

// Return ONLY this JSON:
// {
//   "isResume": true/false,
//   "content": "full extracted text or reason why not a resume"
// }
// `;

//   const result = await model.generateContent(prompt);
//   const text = result.response.text();
//   const json = text.match(/\{[\s\S]*\}/);

//   return JSON.parse(json[0]);
// }


function sanitizeJSON(str) {
  if (!str) return "";
  return str.replace(/[\u0000-\u0019]+/g, " ");
}


export async function extractResumeText(resumeUrl) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const fileBuffer = await downloadFile(resumeUrl);

  const result = await model.generateContent([
    {
      inlineData: {
        data: fileBuffer.toString("base64"),
        mimeType: "application/pdf",
      },
    },
    {
      text: `
Extract ALL text from this document. Preserve employment date ranges exactly as written, including phrases like Present, Till now, Current, and Ongoing.
Tell whether it's a resume or not.
Return JSON:
{
  "isResume": true/false,
  "content": "text"
}
`
    }
  ]);

  const text = sanitizeJSON(result.response.text());
  const json = text.match(/\{[\s\S]*\}/);

  return JSON.parse(json[0]);
}



function buildResumeTextForEvaluation(rawExtractedText) {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const inferredYears = extractExperienceYears(rawExtractedText);
  const hint =
    inferredYears != null
      ? `\n\n---\nRecruiter scoring context (use together with the resume above):\n- Reference date for “ongoing” roles: ${todayStr}.\n- Treat employment end phrases Present, Till now, Until now, Current, To date, Ongoing, and Now as meaning the position continues through ${todayStr} when judging tenure.\n- From dated employment in this resume, total experience is approximately ${inferredYears} years (computed from start dates through ${todayStr} for open-ended ranges).\n---\n`
      : `\n\n---\nRecruiter scoring context:\n- Reference date: ${todayStr}. Treat Present, Till now, Until now, Current, To date, Ongoing as end date ${todayStr} for experience duration.\n---\n`;
  return String(rawExtractedText || "") + hint;
}

export async function evaluateResume(jd, candidate, extractedText) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
You are a strict senior technical recruiter.

Here is the Job Description:
Title: ${jd.jobSummary}
Responsibilities: ${jd.responsibilities.join(", ")}
Requirements: ${jd.requirements.join(", ")}

Candidate Resume Extracted Content:
${extractedText}

Rules:
- If the resume is NOT a resume → score 0, unfiltered, explanation why.
- If resume is real → match skills, experience, tech stack, responsibilities.
- For work history: if a role shows a start date and an open end (Present, Till now, Current, etc.), count that role through the reference date given in the scoring context block. Do not treat open-ended dates as zero or unknown tenure.
- Be strict. No guessing beyond the resume text and the provided scoring context.

Return ONLY this JSON:
{
  "id": "${candidate.id}",
  "score": number,
  "explanation": "1-2 sentence professional explanation"
}
`;

  const result = await model.generateContent(prompt);
  const text = sanitizeJSON(result.response.text());
  const json = text.match(/\{[\s\S]*\}/);

  return JSON.parse(json[0]);
}


export async function filterResumesWithAI(jd, candidates) {
  try {
    const filtered = [];
    const unfiltered = [];

    for (const candidate of candidates) {
      // Step 1: Extract resume text
      const extraction = await extractResumeText(candidate.resume);

      if (!extraction.isResume) {
        unfiltered.push({
          id: candidate.id,
          score: 0,
          explanation: sanitizeJSON("The uploaded document is not a resume. " + extraction.content)
        });
        continue;
      }

      // Step 2: Evaluate based on JD (append parsed experience so “Till now” / Present counts to today)
      const evaluation = await evaluateResume(
        jd,
        candidate,
        buildResumeTextForEvaluation(extraction.content)
      );

      // Step 3: Filter by AI score primarily, then skills/experience as secondary
      // If score is high, always filter
      if (evaluation.score >= 15) {
        filtered.push(evaluation);
        continue;
      }

      // If score is low, optionally use skills/experience as fallback (optional, can be removed)
      let candidateSkills = candidate.skills || [];
      let jdSkills = jd.requirements || [];
      let candidateExperience = candidate.experience;
      let jdExperience = jd.experience;

      if (typeof candidateSkills === 'string') {
        candidateSkills = candidateSkills.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (typeof jdSkills === 'string') {
        jdSkills = jdSkills.split(',').map(s => s.trim()).filter(Boolean);
      }
      const inferredFromResume = extractExperienceYears(extraction.content);
      const fromBody = Number(candidateExperience);
      candidateExperience =
        inferredFromResume != null && !Number.isNaN(Number(inferredFromResume))
          ? Math.max(Number(inferredFromResume), Number.isFinite(fromBody) ? fromBody : 0)
          : fromBody;
      jdExperience = Number(jdExperience);
      if (isNaN(candidateExperience)) candidateExperience = 0;
      if (isNaN(jdExperience)) jdExperience = 0;
      let hasSkillMatch = true;
      if (jdSkills.length > 0) {
        hasSkillMatch = jdSkills.some(skill => candidateSkills.includes(skill));
      }
      let hasExperienceMatch = true;
      if (jdExperience > 0) {
        hasExperienceMatch = candidateExperience >= jdExperience;
      }
      if (hasSkillMatch && hasExperienceMatch) {
        filtered.push(evaluation);
      } else {
        unfiltered.push(evaluation);
      }
    }

    return { success: true, filtered, unfiltered };
  } catch (error) {
    return { success: false, error: error.message };
  }
}


export default { generateJDWithAI };
