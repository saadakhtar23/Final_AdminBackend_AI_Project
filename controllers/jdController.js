import JD from "../models/jobDescription.js";
import Offer from "../models/Offer.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/errorResponse.js";
import { generateJDWithAI } from "../utils/geminiAI.js";
import { generateUniqueToken } from "../utils/generateToken.js";
 
// -------------------------------------------
// HR Creates JD Manually
// -------------------------------------------
export const createJD = asyncHandler(async (req, res, next) => {
  const { offerId } = req.params;
  const { jobSummary, responsibilities, requirements, benefits, additionalNotes } = req.body;
 
  // Validate offer exists
  const offer = await Offer.findById(offerId);
  if (!offer) return next(new ErrorResponse("Offer not found", 404));
 
  // Only assigned HR can create JD
  if (offer.assignedTo.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse("Not authorized to create JD for this offer.", 403));
  }
 
  const jd = await JD.create({
    offerId,
    createdBy: req.user._id,
    jobSummary,
    responsibilities,
    requirements,
    benefits,
    additionalNotes,
    generatedByAI: false,
    publicToken: generateUniqueToken(16),
  });
 
  // Update offer status
  offer.status = "JD created";
  await offer.save();
 
  res.status(201).json({
    success: true,
    message: "JD created successfully.",
    jd,
  });
});

// -------------------------------------------
// HR Creates JD with AI Assistance
// -------------------------------------------
export const createJDWithAI = asyncHandler(async (req, res, next) => {
  const { offerId } = req.params;
  const { 
    companyName, 
    department, 
    reportingManager, 
    keyResponsibilities, 
    qualifications, 
    benefits: additionalBenefits, 
    additionalNotes 
  } = req.body;

  // Validate offer exists
  const offer = await Offer.findById(offerId);
  if (!offer) return next(new ErrorResponse("Offer not found", 404));

  // Only assigned HR can create JD
  if (offer.assignedTo.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse("Not authorized to create JD for this offer.", 403));
  }

  // Prepare additional details from HR
  const additionalDetails = {
    companyName,
    department,
    reportingManager,
    keyResponsibilities,
    qualifications,
    benefits: additionalBenefits,
    additionalNotes,
  };

  // Generate JD using Gemini AI
  const aiResult = await generateJDWithAI(offer.toObject(), additionalDetails);

  if (!aiResult.success) {
    return next(new ErrorResponse(`AI Generation failed: ${aiResult.error}`, 500));
  }

  const { jobSummary, responsibilities, requirements, benefits, additionalInfo } = aiResult.data;

  // Create JD with AI-generated content
  const jd = await JD.create({
    offerId,
    createdBy: req.user._id,
    jobSummary,
    responsibilities,
    requirements: requirements || [],
    benefits: benefits || [],
    additionalNotes: additionalNotes || "",
    generatedByAI: true,
    companyName,
    department,
    reportingManager,
    keyResponsibilities,
    requiredQualifications: qualifications,
    additionalInfo,
    aiGenerationDetails: {
      generatedAt: new Date(),
      rawAIResponse: aiResult.raw,
    },
    publicToken: generateUniqueToken(16),
  });

  // Update offer status
  offer.status = "JD created";
  await offer.save();

  res.status(201).json({
    success: true,
    message: "JD created successfully using AI.",
    jd,
    aiGenerated: true,
  });
});
