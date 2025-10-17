import Header from "../../../components/common/Header";
import Footer from "../../../components/common/Footer";
import ForgotPasswordOTP from "../../user/components/ForgetPasswordOTP";

const AdminForgetOTPPage = () => {
  return (
    <div>
      <Header />
        <ForgotPasswordOTP/>
      <Footer />
    </div>
  );
};

export default AdminForgetOTPPage;
