// utils/emailTemplates/resetPasswordTemplate.js
export const resetPasswordTemplate = ({ name, otp }) => `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2 style="color: #2d6cdf;">Password Reset Request</h2>
    <p>Dear ${name || 'User'},</p>
    <p>We received a request to reset your password. Please use the following One-Time Password (OTP) to proceed:</p>
    <div style="font-size: 2em; font-weight: bold; letter-spacing: 4px; margin: 20px 0; color: #2d6cdf;">${otp}</div>
    <p>This OTP is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
    <p>Thank you,<br/>The Support Team</p>
    <br/>
      <p>Regards,</p>
      <strong>Recruter AI</strong>
  </div>
`;
