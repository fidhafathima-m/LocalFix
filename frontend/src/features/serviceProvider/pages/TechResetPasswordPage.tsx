import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/common/Header";
import Footer from "../../../components/common/Footer";
import TechnicianResetPassword from "../components/technicianApplication/techAuth/TechnicianResetPassword";
import toast from "react-hot-toast";

const TechnicianResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get the state passed from OTP component
  const state = location.state as {
    phone?: string;
    email?: string;
    otp?: string;
    token?: string;
  };

  useEffect(() => {
    const hasIdentifier = state?.phone || state?.email;
    const hasVerification = state?.otp || state?.token;

    if (!hasIdentifier || !hasVerification) {
      console.error("Missing required data for password reset:", state);
      toast.error("Invalid reset password request");
      navigate("/technicians/forgot-password", { replace: true });
      return;
    }
  }, [state, navigate]);

  const hasIdentifier = state?.phone || state?.email;
  const hasVerification = state?.otp || state?.token;

  if (!hasIdentifier || !hasVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Validating reset request...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header userType="serviceProvider" />
      <TechnicianResetPassword
        phone={state.phone}
        email={state.email}
        otp={state.otp}
        token={state.token}
      />
      <Footer />
    </>
  );
};

export default TechnicianResetPasswordPage;
