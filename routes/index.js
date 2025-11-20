// routes/index.js
import express from 'express';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import recruiterRoutes from './Recruiter.js';
import candidateRoutes from './candidateRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/recruiter', recruiterRoutes);
router.use('/candidate', candidateRoutes);

// add other routes: /users, /jobs, etc.

export default router;
