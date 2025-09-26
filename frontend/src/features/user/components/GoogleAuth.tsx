import { GoogleLogin, type CredentialResponse, GoogleOAuthProvider } from "@react-oauth/google";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const GoogleAuth: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.credential) {
            toast.error("No credential received from Google");
            return;
        }

        try {
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/google`, {
                token: credentialResponse.credential,
            });

            login(res.data.user, res.data.token);
            toast.success("Signed in with Google!");
            navigate("/");
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

const GoogleAuthWrapper: React.FC = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
        console.error("Google Client ID is missing!");
        return <div>Google Sign-In configuration error</div>;
    }

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <GoogleAuth />
        </GoogleOAuthProvider>
    );
};

export default GoogleAuthWrapper;