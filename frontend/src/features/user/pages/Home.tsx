import Header from "../../../components/common/Header";
import Footer from "../../../components/common/Footer";
import fetchServices, { type Service, type ServicesResponse } from "../data/services";
import workingSteps from "../data/working";
import speciality from "../data/speciality";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        const servicesResponse: ServicesResponse = await fetchServices(1, 4); // Fetch first page with 4 services
        setServices(servicesResponse.services); // Extract just the services array
      } catch (err) {
        setError("Failed to load services");
        console.error("Error loading services:", err);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  // Only show first 4 services (already handled by the API call)
  const displayedServices = services;

  return (
    <div>
      <Header />
      {/* main section */}
      <section>
        {/* banner */}
        <div className="bg-gradient-to-r from-[#1D4ED8] to-[#3B82F6] min-h-[400px] lg:h-130 relative">
          <div className="flex flex-col lg:flex-row lg:gap-[20%] h-full">
            {/* Content */}
            <div className="text-white p-6 sm:p-8 lg:p-20 flex-1 flex flex-col justify-center">
              <div>
                <h1 className="font-bold text-2xl sm:text-3xl lg:text-3xl w-full lg:w-80 mb-4">
                  Expert Appliance Repairs at Your Doorstep
                </h1>
              </div>
              <div className="mb-6 w-full lg:w-70">
                <p className="text-base sm:text-lg text-blue-100">
                  Connect with verified local technicians for quick and reliable
                  home appliance repairs.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mb-8 lg:mb-0">
                <Link 
                className="p-3 px-6 outline-1 outline-blue-600 rounded bg-white text-black font-semibold hover:bg-gray-100 transition cursor-pointer"
                to="/services">
                  Book a Service
                </Link>
                <button className="p-3 px-6 outline-1 outline-white border border-white rounded font-semibold hover:bg-white hover:text-blue-600 transition">
                  How it works
                </button>
              </div>
            </div>

            {/* form - only visible on large screens */}
            <div className="hidden lg:flex items-center justify-center mr-10 lg:mr-10">
              <div className="bg-white rounded shadow-md p-10 w-[400px]">
                <h1 className="font-bold pb-4">Book a service now</h1>
                <div className="flex flex-col space-y-4">
                  <input
                    className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    type="text"
                    placeholder="Enter your location"
                  />

                  <input
                    className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    type="text"
                    name=""
                    id=""
                    placeholder="Select service type"
                  />
                  <button className="bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition">
                    Find Technicians
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Wave SVG - positioned absolutely at bottom */}
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

      {/* Services section */}
      <section>
        <div className="bg-gray-100">
          <div>
            <div className="items-center justify-center text-center p-5 py-10">
              <h1 className="text-xl sm:text-2xl font-bold">
                Our Repair services
              </h1>
              <p className="text-gray-500 max-w-3xl mx-auto">
                Professional repair services for all your home appliances with
                same-day service availability
              </p>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="flex justify-center items-center p-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="text-center p-10">
                <p className="text-red-500">{error}</p>
              </div>
            )}

            {/* Services grid */}
            {!loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 lg:gap-6 p-4 lg:p-10">
                {displayedServices.map((service) => (
                  <div
                    key={service.id}
                    className="p-6 lg:p-10 shadow rounded bg-white"
                  >
                    <div className="mb-4">
                      <img
                        src={service.iconUrl}
                        alt={service.name}
                        className="w-8 h-8"
                      />
                    </div>
                    <h2 className="text-lg font-bold">{service.name}</h2>
                    <p className="text-sm lg:text-base line-clamp-2">
                      {service.description}
                    </p>
                    <button
                      className="mt-4 text-blue-600 py-2 flex items-center cursor-pointer hover:text-blue-700"
                      onClick={() => navigate(`/service/${service.slug}`)}
                    >
                      Book Now{" "}
                      <ArrowForwardOutlinedIcon sx={{ fontSize: 18 }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="text-center p-5">
            <Link
              to="/services"
              className="text-gray-500 font-semibold cursor-pointer hover:text-gray-700"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* how it works */}
      <section id="how-it-works">
        <div>
          <div className="p-6 lg:p-10 text-center">
            <h1 className="font-bold text-xl sm:text-2xl">
              How LocalFix Works
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Get your appliances fixed in 4 simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 lg:gap-6 p-4 lg:p-10">
            {workingSteps.map((step, idx) => (
              <div key={idx} className="text-center pb-10 lg:pb-20">
                <div className="p-5 pb-6 lg:pb-10">
                  <span className="bg-blue-100 p-4 lg:p-5 rounded-full text-blue-700 inline-block">
                    <step.icon />
                  </span>
                </div>
                <h1 className="font-semibold text-base lg:text-lg">
                  {step.title}
                </h1>
                <p className="text-gray-500 text-sm lg:text-base max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* speciality */}
      <section>
        <div className="bg-gray-100 pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 p-4 lg:p-10 justify-center items-center gap-4 lg:gap-0">
            {speciality.map((spec, idx) => (
              <div key={idx} className="text-center pb-6 lg:pb-10">
                <div className="p-5 pb-6 lg:pb-10">
                  <span className="bg-blue-100 p-4 lg:p-5 rounded-full text-blue-700 inline-block">
                    <spec.icon />
                  </span>
                </div>
                <h1 className="font-semibold text-base lg:text-lg">
                  {spec.title}
                </h1>
                <p className="text-gray-500 text-sm lg:text-base max-w-xs mx-auto">
                  {spec.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* call to action */}
      <section>
        <div className="bg-[#2563EB] text-white text-center">
          <div>
            <div className="p-6 lg:p-10">
              <h1 className="font-bold text-xl sm:text-2xl max-w-2xl mx-auto">
                Ready to fix your appliance?
              </h1>
            </div>
            <div className="pb-6 lg:pb-10 px-4">
              <p className="text-base lg:text-lg text-gray-200 max-w-3xl mx-auto">
                Book a service now and get your appliances fixed by local
                experts in Kannur
              </p>
            </div>
            <div className="pb-6 lg:pb-10 px-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <button 
                  onClick={() => navigate("/services")}
                  className="bg-white text-black p-3 font-semibold rounded w-full sm:w-auto hover:bg-gray-100 transition cursor-pointer"
                >
                  Book a Service
                </button>
                <button className="p-3 outline-1 outline-white rounded font-semibold w-full sm:w-auto border border-white hover:bg-white hover:text-blue-600 transition">
                  Join as Technician
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Home;