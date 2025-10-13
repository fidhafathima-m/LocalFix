import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAppDispatch } from "../../../hooks/redux";
import { loginSuccess, type User } from "../../../store/slices/authSlice";
import toast from "react-hot-toast";
import { authAPI } from "../../../services/authApi";
import { useNavigate, useLocation } from "react-router-dom";

interface GoogleAuthProps {
  userType?: 'user' | 'serviceProvider' | 'admin';
}

const GoogleAuth: React.FC<GoogleAuthProps> = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // Determine userType based on current route
    const currentUserType = location.pathname.includes('/technicians') ? 'serviceProvider' : 'user';

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.credential) {
            toast.error("No credential received from Google");
            return;
        }

        try {
            const res = await authAPI.googleAuth({
                token: credentialResponse.credential,
                userType: currentUserType 
            });

            dispatch(loginSuccess({
                user: res.data.user as User,
                token: res.data.token
            }));
            
            toast.success("Signed in with Google!");
            
            // Redirect based on userType
            if (res.data.user.role === 'serviceProvider') {
                navigate("/technicians");
            } else {
                navigate("/");
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Google auth error:", error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Google Sign In failed");
            }
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