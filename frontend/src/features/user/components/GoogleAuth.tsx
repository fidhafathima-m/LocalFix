import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAppDispatch } from "../../../hooks/redux";
import { loginSuccess, type User } from "../../../store/slices/authSlice";
import toast from "react-hot-toast";
import { authAPI } from "../../../services/authApi";
import { useNavigate, useLocation } from "react-router-dom";

interface GoogleAuthProps {
  userType?: "user" | "serviceProvider" | "admin";
}

const GoogleAuth: React.FC<GoogleAuthProps> = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine userType based on current route
  const currentUserType = location.pathname.includes("/technicians")
    ? "serviceProvider"
    : "user";

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    if (!credentialResponse.credential) {
      toast.error("No credential received from Google");
      return;
    }

    try {
      const res = await authAPI.googleAuth({
        token: credentialResponse.credential,
        userType: currentUserType,
      });


      if (!res.success || !res.user || !res.token) {
        throw new Error(res.message || "Google authentication failed");
      }

      dispatch(
        loginSuccess({
          user: res.user as User,
          token: res.token,
        })
      );

      toast.success(res.message || "Signed in with Google!");

      // Redirect based on userType and application status
      if (res.user.role === "serviceProvider") {
        if (res.user.applicationStatus === "approved") {
          navigate("/technician/dashboard");
        } else if (
          res.user.applicationStatus === "submitted" ||
          res.user.applicationStatus === "under_review"
        ) {
          navigate("/pending-technician/dashboard");
        } else if (res.user.applicationStatus === "rejected") {
          navigate("/pending-technician/dashboard");
        } else if (res.user.applicationStatus === "draft") {
          navigate("/technician/apply");
        } else {
          navigate("/technicians");
        }
      } else if (res.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Google auth error:", error);

      let errorMessage = "Google Sign In failed";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  };

  const handleGoogleError = () => {
    console.error("Google Login Failed - check console for details");
    toast.error("Google Login Failed. Please check your browser console.");
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={handleGoogleError}
      theme="outline"
      size="large"
      shape="rectangular"
      text="signin_with"
      logo_alignment="center"
      width={300}
      useOneTap={false}
    />
  );
};

export default GoogleAuth;
