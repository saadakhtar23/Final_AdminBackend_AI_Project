export function bulkJDTemplate(candidateName, jdTitle, companyName, applyUrl) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9f9f9;border-radius:8px;">
      <h2 style="color:#2b2b2b;">${jdTitle}</h2>
      <p>Dear <strong>${candidateName}</strong>,</p>
      <p>your resume has been filtered for this jd role</p>
      <p style="margin-top:16px;">You can sign in to your candidate account to view details:</p>
      <a href="https://recruterai.netfotech.in/CandidateLogin" style="display:inline-block;padding:12px 24px;background:#007bff;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;">Candidate Login</a>
      <p style="margin-top:24px;color:#555;">If you have any questions, feel free to reply to this email.</p>
      <hr style="margin:32px 0;">
      <p style="font-size:12px;color:#888;">This is an automated message. Please do not reply directly.</p>
      <br/>
      <p>Regards,</p>
      <strong>Recruter AI</strong>
    </div>
  `;
}


// export function bulkJDTemplate(candidateName, jdTitle, companyName, applyUrl) {
//   return `
//     <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9f9f9;border-radius:8px;">
//       <h2 style="color:#2b2b2b;">Exciting Opportunity: ${jdTitle}</h2>
//       <p>Dear <strong>${candidateName}</strong>,</p>
//       <p>We are pleased to inform you about a new opening at <strong>${companyName}</strong> that matches your profile.</p>
//       <p>To view the job details and apply, please click the button below:</p>
//       <a href="${applyUrl}" style="display:inline-block;padding:12px 24px;background:#007bff;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;">Apply Now</a>
//       <p style="margin-top:24px;color:#555;">If you have any questions, feel free to reply to this email.</p>
//       <hr style="margin:32px 0;">
//       <p style="font-size:12px;color:#888;">This is an automated message. Please do not reply directly.</p>
//     </div>
//   `;
// }