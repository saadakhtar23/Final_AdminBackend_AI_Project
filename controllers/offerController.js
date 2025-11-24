import Offer from "../models/Offer.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/errorResponse.js";
import sendEmail from "../utils/sendEmail.js"
import {offerAssignedTemplate} from "../utils/emailTemplates/offerAssignedTemplate.js"
import User from "../models/User.js"

export const createOffer = asyncHandler(async(req, res, next) => {
    const {
        jobTitle,
        priority,
        dueDate,
        assignedTo,
        description,
        skills,
        preferredSkills,
        experience,
        positionAvailable,
        location,
        city,
        state,
        country,
        employmentType,
        salary,
        currency,
        attachments,

    } = req.body;

    const hrUser = await User.findById(assignedTo);
    if(!hrUser || hrUser.role !== "HR"){
        return next(new ErrorResponse("Assigned HR not Found",404));
    }

    const offer = await Offer.create({
        jobTitle,
        priority,
        dueDate,
        createdBy:req.user._id,
        assignedTo,
        description,
        skills,
        preferredSkills,
        experience,
        positionAvailable,
        location,
        city,
        state,
        country,
        employmentType,
        salary,
        currency,
        attachments,
        status:"JD pending",
    });

    const html = offerAssignedTemplate(
        hrUser.name,
        offer.jobTitle,
        offer.priority,
        offer.dueDate,
        req.user.name
    );

    await sendEmail({
        to:hrUser.email,
        subject:`New Offer Assigned : ${offer.jobTitle}`,
        html
    });

    res.status(201).json({
        success:true,
        message:"Offer Created and Assigned to HR, HR has Been Notified Via Email.",
        offer,
    });
});