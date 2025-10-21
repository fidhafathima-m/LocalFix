import { Link } from "react-router-dom";
import { SuccessIcon } from "../components/SuccessIcon";

export const ApplicationSubmitted: React.FC = () => {

  const handleDashboardRedirect = () => {
    // Clear any remaining application data
    localStorage.removeItem("applicationId");
    localStorage.removeItem("currentTechnicianApplication");
    window.location.replace("/pending-technician/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <SuccessIcon />
        </div>
        <h1 className="text-2xl font-bold mb-2">Application Submitted!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for applying to be a LocalFix technician.
          <br />
          Your application has been received and is being reviewed.
        </p>
        <div className="space-y-4">
          <button
            onClick={handleDashboardRedirect}
            className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
          <Link
            to="/"
            className="block text-blue-600 hover:text-blue-800"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};