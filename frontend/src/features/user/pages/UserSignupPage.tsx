import Header from "../../../components/common/Header";
import Footer from "../../../components/common/Footer";
import UserSignUp from "../components/userAuth/UserSignup";

const UserSignupForm = () => {
  return (
    <div>
      <Header />
        <UserSignUp/>
      <Footer />
    </div>
  );
};

export default UserSignupForm;
