import Header from "../../../components/common/Header";
import Footer from "../../../components/common/Footer";
import UserLogin from "../components/userAuth/UserLogin";

const UserLoginPage = () => {
  return (
    <div>
      <Header />
        <UserLogin/>
      <Footer />
    </div>
  );
};

export default UserLoginPage;
