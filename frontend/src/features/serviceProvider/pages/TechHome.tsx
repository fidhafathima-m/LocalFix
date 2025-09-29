import Header from '../../../components/common/Header'
import Footer from '../../../components/common/Footer'
import whyJoin from '../data/whyJoin';
import heroImage from '../../../assets/images/hero.jpg'; 
import { useAuth } from '../../../context/AuthContext';
import { Link } from 'react-router-dom';

interface TechnicianUser {
  fullName: string;
  role: 'serviceProvider' | 'customer' | string; 
  email?: string; 
}


const TechHome = () => {
  const { isLoggedIn, user } = useAuth();

  return (
    <div>
        <Header userType='serviceProvider'/>
        
        {/* Show different banner based on login status */}
        {isLoggedIn && user?.role === 'serviceProvider' ? (
          <LoggedInBanner user={user} />
        ) : (
          <PublicBanner />
        )}
        
        {/* Keep the rest of the page the same for both logged in and non-logged in users */}
        <WhyJoinSection />
        <CallToActionSection isLoggedIn={isLoggedIn} />
        
        <Footer/>
    </div>
  )
}

// Public banner for non-logged-in users
const PublicBanner = () => {
  return (
    <section>
      <div className='bg-gradient-to-r from-[#1D4ED8] to-[#3B82F6] min-h-[400px] lg:h-130 relative'>
        <div className='flex flex-col lg:flex-row lg:gap-[20%] h-full'>
          {/* Content */}
          <div className='text-white p-6 sm:p-8 lg:p-20 flex-1 flex flex-col justify-center'>
            <div>
              <h1 className='font-bold text-2xl sm:text-3xl lg:text-3xl w-full lg:w-80 mb-4'>Join LocalFix as a Technician</h1>
            </div>
            <div className='mb-6 w-full lg:w-70'>
              <p className='text-base sm:text-lg text-blue-100'>Use your skills to earn more. Connect with customers in your area looking for reliable appliance repair services.</p>
            </div>
            <div className='flex flex-col sm:flex-row gap-3 mb-8 lg:mb-0'>
              <Link 
                to="/technicians/signup" 
                className='p-3 px-6 outline-1 outline-blue-600 rounded bg-white text-black font-semibold hover:bg-gray-100 transition text-center'
              >
                Sign Up Now
              </Link>
              <Link 
                to="/technicians/login" 
                className='p-3 px-6 outline-1 outline-white border border-white rounded font-semibold hover:bg-white hover:text-blue-600 transition text-center'
              >
                Login
              </Link>
            </div>
          </div>
          <div className="flex-1 p-20 ">
            <img src={heroImage} alt="hero" className="w-full h-full object-cover rounded-lg" />
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

// Banner for logged-in technicians
const LoggedInBanner = ({ user }: { user: TechnicianUser }) => {
  return (
    <section>
      <div className='bg-gradient-to-r from-[#1D4ED8] to-[#3B82F6] min-h-[400px] lg:h-96 relative'>
        <div className='text-white p-6 sm:p-8 lg:p-20 flex flex-col justify-center items-center text-center'>
          {/* Welcome message */}
          <div className=' text-white p-6 rounded-lg mb-6 max-w-2xl'>
            <h2 className='font-bold text-2xl mb-4'>Welcome back, {user?.fullName}! 👋</h2>
            <p className='text-lg mb-4'>You're signed in as a technician.</p>
            <p className='text-sm'>Next step: Complete your application to start receiving service requests.</p>
          </div>
          
          <div className='flex flex-col sm:flex-row gap-3'>
            <Link 
              to="/technicians/apply" 
              className='p-3 px-6 rounded bg-white text-blue-600 font-semibold hover:bg-gray-100 transition'
            >
              Apply Now
            </Link>
          </div>
        </div>
        
        
      </div>
    </section>
  );
};

// Why Join Section (same for both)
const WhyJoinSection = () => {
  return (
    <section id='why-join'>
      <div className='bg-gray-100'>
        <div>
          <div className='items-center justify-center text-center p-5 py-10'>
            <h1 className='text-xl sm:text-2xl font-bold'>Why Join Localfix?</h1>
            <p className='text-gray-500 max-w-3xl mx-auto'>Join hundreds of technicians already growing their business with LocalFix</p>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 lg:gap-6 p-4 lg:p-10'>
            {whyJoin.map((why, idx) => (
              <div key={idx} className="p-6 lg:p-10 shadow rounded bg-white">
                <span className='bg-blue-100 p-3 lg:p-5 rounded-full text-blue-700 inline-block'>
                  <why.icon/>
                </span>
                <h2 className="text-lg font-bold">{why.title}</h2>
                <p className="text-sm lg:text-base">{why.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Call to Action Section (different buttons based on login status)
const CallToActionSection = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  return (
    <section>
      <div className='bg-[#2563EB] text-white text-center'>
        <div>
          <div className='p-6 lg:p-10'>
            <h1 className='font-bold text-xl sm:text-2xl max-w-2xl mx-auto'>
              {isLoggedIn ? 'Ready to start your journey?' : 'Ready to grow your business?'}
            </h1>
          </div>
          <div className='pb-6 lg:pb-10 px-4'>
            <p className='text-base lg:text-lg text-gray-200 max-w-3xl mx-auto'>
              {isLoggedIn 
                ? 'Complete your application and start receiving service requests today!' 
                : 'Join LocalFix and connect with customers in your area'
              }
            </p>
          </div>
          <div className='pb-6 lg:pb-10 px-4'>
            <div className='flex flex-col sm:flex-row gap-3 justify-center items-center'>
              {isLoggedIn ? (
                <Link 
                  to="/technicians/apply" 
                  className='bg-white text-blue-600 p-3 font-semibold rounded w-full sm:w-auto text-center'
                >
                  Complete Application
                </Link>
              ) : (
                <Link 
                  to="/technicians/signup" 
                  className='bg-white text-blue-600 p-3 font-semibold rounded w-full sm:w-auto text-center'
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

export default TechHome;