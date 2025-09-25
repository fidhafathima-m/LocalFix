import nodemailer from "nodemailer";

export const sendEmailOTP = async(email: string, otp: string) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    })
    await transporter.sendMail({
        from: `"LocalFix" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP Code is ${otp}. IT will expire in 5 minutes`
    })
}