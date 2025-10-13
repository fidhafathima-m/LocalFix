import axios from 'axios';

export const sendPhoneOTP = async (phone: string, otp: string) => {
  const API_KEY = process.env.TWOFACTOR_API_KEY; 
  if (!API_KEY) throw new Error("2Factor API Key not set");

  try {
    const formattedPhone = phone.replace(/^(\+91|0)/, '');
    const url = `https://2factor.in/API/V1/${API_KEY}/SMS/${formattedPhone}/${otp}`;
    const response = await axios.get(url);
    console.log("2Factor Response:", response.data);
    return response.data;
  } catch (err) {
    console.error("Error sending OTP via 2Factor:", err);
    throw new Error("Failed to send OTP");
  }
};
