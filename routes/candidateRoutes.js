import express from 'express';
import { protect} from '../middlewares/auth.js';
import { registerCandidate, logoutCandidate } from '../controllers/candidateController.js';

const router = express.Router();
// Candidate Registration
router.post('/register', registerCandidate);
router.post('/logout', protect, logoutCandidate);

export default router;
