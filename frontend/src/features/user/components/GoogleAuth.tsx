import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const GoogleAuth: React.FC = () => {
      const {login} = useAuth()
      const navigate = useNavigate();

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return;

    try {
        const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/google`, {
        token: credentialResponse.credential,
        });

    
        login(res.data.user, res.data.token);

        toast.success("Signed up with Google!");
        navigate("/"); 
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
        } else {
        toast.error("Google Sign Up failed");
        }
    } 
    };

    return (
        <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error("Google Login Failed")}
        />
    )

}
export default GoogleAuth

