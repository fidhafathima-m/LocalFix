import React from "react";
import FacebookLogin from "react-facebook-login";
import type { ReactFacebookLoginInfo } from "react-facebook-login";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";

const FacebookAuth: React.FC = () => {
  const { login } = useAuth();

  const responseFacebook = async (response: ReactFacebookLoginInfo) => {
    console.log("Facebook response:", response);

    if (response.accessToken) {
      try {
        // Send token to backend
        const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/facebook`, {
          accessToken: response.accessToken,
          userID: response.userID,
        });

        // Store auth in context
        login(res.data.user, res.data.token);
        toast.success("Logged in with Facebook!");
      } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Facebook Login failed");
    }
  }
    }
  };

  return (
    <FacebookLogin
      appId={import.meta.env.VITE_FACEBOOK_APP_ID}   
      autoLoad={false}
      fields="name,email,picture"
      callback={responseFacebook}
      cssClass="facebook-btn"
      icon="fa-facebook"
    />
  );
};

export default FacebookAuth;
