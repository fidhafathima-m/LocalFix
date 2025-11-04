import Header from "../../../components/common/Header";
import Footer from "../../../components/common/Footer";
import TechnicianLogin from "../components/technicianApplication/techAuth/TechnicianLogin";

const TechLoginPage = () => {
  return (
    <div>
      <Header userType="serviceProvider" />
        <TechnicianLogin/>
      <Footer />
    </div>
  );
};

export default TechLoginPage;
