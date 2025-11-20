import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    }
  },
  { timestamps: true } // automatically creates createdAt & updatedAt
);

export default mongoose.model("Candidate", candidateSchema);
