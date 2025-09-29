import { GoogleLogin, type CredentialResponse, GoogleOAuthProvider } from "@react-oauth/google";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

interface GoogleAuthProps {
  userType?: 'user' | 'serviceProvider' | 'admin';
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const GoogleAuth: React.FC<GoogleAuthProps> = ({ userType = 'user' }) => {
    const { login } = useAuth();
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
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/google`, {
                token: credentialResponse.credential,
                userType: currentUserType 
            });

            login(res.data.user, res.data.token);
            toast.success("Signed in with Google!");
            
            // Redirect based on userType
            if (res.data.user.role === 'serviceProvider') {
                navigate("/technicians");
            } else {
                navigate("/");
            }
        } catch (error: unknown) {
            console.error("Google auth error:", error);
            if (axios.isAxiosError(error) && error.response?.data?.message) {
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

const GoogleAuthWrapper: React.FC<GoogleAuthProps> = ({ userType = 'user' }) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
        console.error("Google Client ID is missing!");
        return <div>Google Sign-In configuration error</div>;
    }

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <GoogleAuth userType={userType} />
        </GoogleOAuthProvider>
    );
};

export default GoogleAuthWrapper;