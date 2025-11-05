import { Link } from "react-router-dom";
import heroImage from "../../../../assets/images/hero.jpg"

const PublicBanner = () => {
  return (
    <section>
      <div className="bg-gradient-to-r from-[#1D4ED8] to-[#3B82F6] min-h-[400px] lg:h-130 relative">
        <div className="flex flex-col lg:flex-row lg:gap-[20%] h-full">
          {/* Content */}
          <div className="text-white p-6 sm:p-8 lg:p-20 flex-1 flex flex-col justify-center">
            <div>
              <h1 className="font-bold text-2xl sm:text-3xl lg:text-3xl w-full lg:w-80 mb-4">
                Join LocalFix as a Technician
              </h1>
            </div>
            <div className="mb-6 w-full lg:w-70">
              <p className="text-base sm:text-lg text-blue-100">
                Use your skills to earn more. Connect with customers in your
                area looking for reliable appliance repair services.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mb-8 lg:mb-0">
              <Link
                to="/technicians/signup"
                className="p-3 px-6 outline-1 outline-blue-600 rounded bg-white text-black font-semibold hover:bg-gray-100 transition text-center"
              >
                Sign Up Now
              </Link>
              <Link
                to="/technicians/login"
                className="p-3 px-6 outline-1 outline-white border border-white rounded font-semibold hover:bg-white hover:text-blue-600 transition text-center"
              >
                Login
              </Link>
            </div>
          </div>
          <div className="flex-1 p-20 ">
            <img
              src={heroImage}
              alt="hero"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>

        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg
            className="relative block w-full h-[60px] sm:h-[80px] lg:h-[130px]"
            viewBox="0 0 1440 130"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M79.9424 9.78223C159.941 19.0678 319.968 37.6426 480 37.6426C560.018 37.6426 640.032 32.9993 720.034 27.5801C800.04 22.1606 880.028 15.9649 960.019 12.8604C1120 6.88345 1279.98 12.6872 1359.98 15.9951H1359.98L1439.5 19.0527V129.5H0.5V0.561523L79.9424 9.78223Z"
              fill="#F9FAFB"
              stroke="none"
            />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default PublicBanner