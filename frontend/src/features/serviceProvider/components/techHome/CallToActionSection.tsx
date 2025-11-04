import { Link } from "react-router-dom";

const CallToActionSection = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  return (
    <section>
      <div className="bg-[#2563EB] text-white text-center">
        <div>
          <div className="p-6 lg:p-10">
            <h1 className="font-bold text-xl sm:text-2xl max-w-2xl mx-auto">
              {isLoggedIn
                ? "Ready to start your journey?"
                : "Ready to grow your business?"}
            </h1>
          </div>
          <div className="pb-6 lg:pb-10 px-4">
            <p className="text-base lg:text-lg text-gray-200 max-w-3xl mx-auto">
              {isLoggedIn
                ? "Complete your application and start receiving service requests today!"
                : "Join LocalFix and connect with customers in your area"}
            </p>
          </div>
          <div className="pb-6 lg:pb-10 px-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              {isLoggedIn ? (
                <Link
                  to="/technicians/apply"
                  className="bg-white text-blue-600 p-3 font-semibold rounded w-full sm:w-auto text-center"
                >
                  Complete Application
                </Link>
              ) : (
                <Link
                  to="/technicians/signup"
                  className="bg-white text-blue-600 p-3 font-semibold rounded w-full sm:w-auto text-center"
                >
                  Sign Up
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection