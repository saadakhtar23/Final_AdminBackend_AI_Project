import express from "express";
import {protect} from "../middlewares/auth.js";
import { authorize } from '../middlewares/roles.js';
import { createJD, createJDWithAI } from "../controllers/jdController.js";
import { filterResumes } from "../controllers/aiResumeFilterController.js";

const router = express.Router();

// Manual JD creation
router.post("/:offerId", protect, authorize("HR"), createJD);

// AI-powered JD creation
router.post("/:offerId/ai", protect, authorize("HR"), createJDWithAI);
router.post("/:jdId/filter-resumes", protect, authorize("HR"), filterResumes);

export default router;