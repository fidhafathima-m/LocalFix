import Header from "../../../components/common/Header";
import Footer from "../../../components/common/Footer";
import TechnicianSignUp from "../components/technicianApplication/techAuth/TechnicianSignup";

const TechSignUp = () => {
  return (
    <div>
      <Header userType="serviceProvider" />
        <TechnicianSignUp/>
      <Footer />
    </div>
  );
};

export default TechSignUp;
