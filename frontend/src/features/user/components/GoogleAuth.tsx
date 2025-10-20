import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAppDispatch } from "../../../hooks/redux";
import { loginSuccess, type User } from "../../../store/slices/authSlice";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { UserAuthService } from "../../../services/user/userAuthService";

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
      const res = await UserAuthService.googleAuth({
        token: credentialResponse.credential,
        userType: currentUserType,
      });

      // ✅ UPDATED: Extract tokens from new structure
      const userData = res.data?.user || res.user;
      const accessToken = res.data?.accessToken || res.accessToken;
      const refreshToken = res.data?.refreshToken || res.refreshToken;

      if (!res.success || !userData || !accessToken || !refreshToken) {
        throw new Error(res.message || "Google authentication failed");
      }

      // ✅ UPDATED: Pass both tokens
      dispatch(
        loginSuccess({
          user: userData as User,
          accessToken: accessToken,
          refreshToken: refreshToken,
        })
      );

      toast.success(res.message || "Signed in with Google!");

      const userRoles = userData.roles || [];
      const hasServiceProviderRole = userRoles.includes("serviceProvider");
      const hasAdminRole = userRoles.includes("admin");

      // Redirect based on userType and application status
      if (hasServiceProviderRole) {
        if (userData.applicationStatus === "approved") {
          navigate("/technician/dashboard");
        } else if (
          userData.applicationStatus === "submitted" ||
          userData.applicationStatus === "under_review"
        ) {
          navigate("/pending-technician/dashboard");
        } else if (userData.applicationStatus === "rejected") {
          navigate("/pending-technician/dashboard");
        } else if (userData.applicationStatus === "draft") {
          navigate("/technician/apply");
        } else {
          navigate("/technicians");
        }
      } else if (hasAdminRole) {
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