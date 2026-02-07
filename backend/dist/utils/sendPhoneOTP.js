"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPhoneOTP = void 0;
const axios_1 = __importDefault(require("axios"));
const sendPhoneOTP = async (phone, otp) => {
    const API_KEY = process.env.TWOFACTOR_API_KEY;
    if (!API_KEY)
        throw new Error("2Factor API Key not set");
    try {
        const formattedPhone = phone.replace(/^(\+91|0)/, "");
        const url = `https://2factor.in/API/V1/${API_KEY}/SMS/${formattedPhone}/${otp}`;
        const response = await axios_1.default.get(url);
        return response.data;
    }
    catch (err) {
        console.error("Error sending OTP via 2Factor:", err);
        throw new Error("Failed to send OTP");
    }
};
exports.sendPhoneOTP = sendPhoneOTP;
