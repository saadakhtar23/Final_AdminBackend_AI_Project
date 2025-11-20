import Candidate from "../models/candidate.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import User from "../models/User.js";

// controllers/authController.js



export const registerCandidate = async (req, res) => {
  try {
    const { name, email, password, phone, resume } = req.body;

    if (!name || !email || !password || !phone || !resume) {
      return res.status(400).json({ 
        message: "name, email, password, phone, resume are required" 
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      phone,
      resume,
      role: "Candidate",
    }); 

    res.status(201).json({
      message: "Candidate registered successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        resume: newUser.resume,
        role: newUser.role
      }
    });
  } catch (error) {
    console.log("Candidate Register Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// LOGOUT
export const logoutCandidate = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};

// UPDATE (Protected)
export const updateCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Candidate.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updated)
      return res.status(404).json({ message: "Candidate not found" });

    res.status(200).json({ message: "Profile updated successfully", updated });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// DELETE (Protected)
export const deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Candidate.findByIdAndDelete(id);

    if (!deleted)
      return res.status(404).json({ message: "Candidate not found" });

    res.status(200).json({ message: "Candidate deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

export const applytoJd = async(req,res)=>{
  res.status(200).json({ message: "Applied to JD successfully" });
}

// export const applytospecificJd = async(req,res)=>{
//   const {jobId}= req.params;
//   const candidateId = req.user.id;

//   console.log("Candidate ID:", candidateId);

//   const { skills,experience,expectedCTC,currentCTC,noticePeriod}= req.body;
//   try{
//     const candidate = await User.findById(candidateId);
//     if(!candidate){
//       return res.status(404).json({
//         message: "Candidate not found"
//       })
//     }
//     if(!req.file || !req.file.path){
//       return res.status(400).json({ message : "Resume file is required"});
//     }
//     const cloudResult = await 
//   }
// }
 