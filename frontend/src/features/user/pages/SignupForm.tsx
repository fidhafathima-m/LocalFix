import Header from "../../../components/common/Header";
import Footer from "../../../components/common/Footer";
import SignUp from "../../../components/common/Signup";

const SignUpForm = () => {
  return (
    <div>
      <Header />
      <SignUp userType="user" />
      <Footer />
    </div>
  );
};

export default SignUpForm;
