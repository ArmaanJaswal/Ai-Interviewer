import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

export const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    console.warn("⚠️ RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set in environment.");
    return null;
  }

  return new Razorpay({
    key_id: key_id.trim(),
    key_secret: key_secret.trim(),
  });
};

export default getRazorpayInstance;

