import axios from "axios";
import { useAppSelector } from "../../../../hooks/redux";

interface User {
  _id: string;
  fullName?: string;
  phone?: string;
  roles?: string[];
}

interface ApplicationResponse {
  data?: {
    redirectTo?: string;
    applicationId?: string;
  };
}

const LoggedInBanner = ({ user }: { user: User | null }) => {
  const { accessToken } = useAppSelector((state) => state.auth);

  const handleApplyNow = async () => {
    if (!user?._id) {
      alert("Please log in to apply");
      return;
    }

    try {
      // Check if user already has an application
      const checkResponse = await axios.post<ApplicationResponse>(
        `${import.meta.env.VITE_BASE_URL}/technician-application/start`,
        {
          phone: user.phone || "",
          userId: user._id,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const responseData = checkResponse.data.data;

      if (responseData?.redirectTo) {
        // Redirect to appropriate dashboard
        window.location.href = responseData.redirectTo;
        return;
      }

      if (responseData?.applicationId) {
        localStorage.setItem("applicationId", responseData.applicationId);
        localStorage.setItem("currentTechnicianApplication", user._id);
        window.location.href = "/technicians/apply";
      }
    } catch (error) {
      console.error("Error checking application:", error);
      localStorage.removeItem("applicationId");
      localStorage.removeItem("currentTechnicianApplication");
      window.location.href = "/technicians/apply";
    }
  };

  return (
    <section>
      <div className="bg-gradient-to-r from-[#1D4ED8] to-[#3B82F6] min-h-[400px] lg:h-96 relative">
        <div className="text-white p-6 sm:p-8 lg:p-20 flex flex-col justify-center items-center text-center">
          {/* Welcome message */}
          <div className=" text-white p-6 rounded-lg mb-6 max-w-2xl">
            <h2 className="font-bold text-2xl mb-4">
              Welcome, {user?.fullName || "Technician"}! 👋
            </h2>
            <p className="text-lg mb-4">You're signed in as a technician.</p>
            <p className="text-sm">
              Next step: Complete your application to start receiving service
              requests.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className="p-3 px-6 rounded bg-white text-blue-600 font-semibold hover:bg-gray-100 transition cursor-pointer"
              onClick={handleApplyNow}
            >
              Apply Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoggedInBanner