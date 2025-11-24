import Candidate from "../models/candidate.js";
import JD from "../models/jobDescription.js";
import asyncHandler from "../utils/asyncHandler.js";
import errorResponse from "../utils/errorResponse.js";
import cloudinary, { uploadBuffer } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

// Register candidate
export const registerCandidate = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password || !phone) return next(new errorResponse("All fields required", 400));
  const existing = await Candidate.findOne({ email });
  if (existing) return next(new errorResponse("Email already exists", 400));
  const candidate = await Candidate.create({ name, email, password, phone, resume: "" });
  sendTokenResponse(candidate, 201, res);
});

// Login candidate
export const loginCandidate = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new errorResponse("Email and password required", 400));
  const candidate = await Candidate.findOne({ email }).select("+password");
  if (!candidate) return next(new errorResponse("Invalid credentials", 401));
  const isMatch = await candidate.matchPassword(password);
  if (!isMatch) return next(new errorResponse("Invalid credentials", 401));
  sendTokenResponse(candidate, 200, res);
});

// Apply for a job (JD)
// export const applyJob = asyncHandler(async (req, res, next) => {
//   const { jdId } = req.params;
//   const { name, email, phone, reallocate } = req.body;
//   if (!req.files || !req.files.resume) return next(new errorResponse("Resume file required", 400));
//   const resumeFile = req.files.resume;
//   const resumeUrl = await cloudinary.uploader.upload(resumeFile.tempFilePath, { folder: 'candidates' });
//   const candidate = await Candidate.findOne({ email });
//   if (!candidate) return next(new errorResponse("Candidate not found", 404));
//   const jd = await JD.findById(jdId);
//   if (!jd) return next(new errorResponse("JD not found", 404));
//   // Prevent duplicate application
//   if (jd.appliedCandidates.some(c => c.candidate.toString() === candidate._id.toString())) {
//     return next(new errorResponse("Already applied to this job", 400));
//   }
//   jd.appliedCandidates.push({
//     candidate: candidate._id,
//     resume: resumeUrl,
//     name,
//     email,
//     phone,
//     reallocate: reallocate === "yes" || reallocate === true,
//     status: "pending",
//   });
//   await jd.save();
//   res.status(201).json({ success: true, message: "Applied successfully" });
// });


export const applyJob = asyncHandler(async (req, res, next) => {
  const { jdId } = req.params;
  const { name, email, phone, reallocate } = req.body;

  if (!req.file) {
    return next(new errorResponse("Resume file required", 400));
  }

  const uploadResult = await uploadBuffer(req.file.buffer, "candidates");
  const resumeUrl = uploadResult.secure_url + `?v=${Date.now()}`;

  const candidate = await Candidate.findOne({ email });
  if (!candidate) return next(new errorResponse("Candidate not found", 404));

  // 🔥 FIX — ALWAYS UPDATE CANDIDATE'S RESUME
  candidate.resume = resumeUrl;
  await candidate.save();

  const jd = await JD.findById(jdId);
  if (!jd) return next(new errorResponse("JD not found", 404));

  if (jd.appliedCandidates.some(c => c.candidate.toString() === candidate._id.toString())) {
    return next(new errorResponse("Already applied to this job", 400));
  }

  jd.appliedCandidates.push({
    candidate: candidate._id,
    resume: resumeUrl,
    name,
    email,
    phone,
    reallocate: reallocate === "yes" || reallocate === true,
    status: "pending",
  });

  await jd.save();

  res.status(201).json({
    success: true,
    message: "Applied successfully",
  });
});


// Get all jobs applied by candidate
export const getAppliedJobs = asyncHandler(async (req, res, next) => {
  const candidateId = req.user._id;
  const jds = await JD.find({ "appliedCandidates.candidate": candidateId });
  res.json({ success: true, jobs: jds });
});

// Helper: send JWT
function sendTokenResponse(candidate, statusCode, res) {
  const payload = { id: candidate._id, role: "Candidate" };
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpire });
  res.status(statusCode).json({ success: true, token });
}
