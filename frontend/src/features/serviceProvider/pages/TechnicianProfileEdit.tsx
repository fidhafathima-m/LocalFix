import PersonalInformation from "../components/technicianProfile/PersonalInformation";
import IdentityVerification from "../components/technicianProfile/IdentityVerification";
import SkillsServices from "../components/technicianProfile/SkillsServices";
import AvailabilityPreferences from "../components/technicianProfile/AvailabilityPreferences";
import BankPaymentDetails from "../components/technicianProfile/BankPaymentDetails";
import DocumentsVerification from "../components/technicianProfile/DocumentsVerification";
import SecuritySettings from "../components/technicianProfile/SecuritySettings";
import DangerZone from "../components/technicianProfile/DangerZone";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import Header from "../../../components/common/Header";
import Footer from "../../../components/common/Footer";
import { useNavigate } from "react-router-dom";
const TechnicianProfileEdit = () => {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate(-1);
  };
  return (
    <>
      <Header userType="serviceProvider" isApproved={true} />
      <div className="max-w-3xl mx-auto p-4">
        <button
          className="flex items-center text-blue-500 mb-4 cursor-pointer hover:text-blue-600"
          onClick={handleBack}
        >
          <ChevronLeftOutlinedIcon />
          <span className="ml-1">Back</span>
        </button>
        <h1 className="text-2xl font-bold mb-1">Technician Profile</h1>
        <p className="text-gray-500 mb-6">
          Manage your personal information and settings
        </p>
        <div className="space-y-4">
          <PersonalInformation />
          <IdentityVerification />
          <SkillsServices />
          <AvailabilityPreferences />
          <BankPaymentDetails />
          <DocumentsVerification />
          <SecuritySettings />
          <DangerZone />
        </div>
      </div>
      <Footer />
    </>
  );
};
export default TechnicianProfileEdit;
