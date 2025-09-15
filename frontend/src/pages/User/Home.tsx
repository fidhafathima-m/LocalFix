import Header from '../../components/Header'
import Footer from '../../components/Footer'
import services from '../../data/User/services';
import workingSteps from '../../data/User/working';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';

const Home = () => {
  return (
    <div>
        <Header userType='user' isLoggedIn={false}/>
        {/* main section */}
        <section>
            {/* banner */}
            <div className='bg-gradient-to-r from-[#1D4ED8] to-[#3B82F6] h-120'>
                <div className='flex gap-[20%]'>
                    <div className='text-white p-20'>
                        <div>
                            <h1 className='font-bold text-3xl w-80'>Expert Appliance Repairs at Your Doorstep</h1>
                        </div>
                        <div className='py-4 w-70 text-light'>
                            <p>Connect with verified local techniciansfor quick and reliable home appliance repairs.</p>
                        </div>
                        <div className='flex gap-3 py-4'>
                            <button className='p-3 outline-1 outline-blue-600 rounded bg-white text-black font-semibold'>Book a Service</button>
                            <button className='p-3 outline-1 outline-white rounded font-semibold'>How it works</button>
                        </div>
                    </div>
                    {/* form */}
                    <div className=' flex items-center justify-center'>
                        <div className='bg-white rounded shadow-md p-10 w-[400px]'>
                            <h1 className='font-bold pb-4'>Book a service now</h1>
                            <div className='flex flex-col space-y-4'>
                                <input 
                                className='p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400' 
                                type="text" 
                                placeholder='Enter your location'/>

                                <input 
                                className='p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400' 
                                type="text" 
                                name="" id="" 
                                placeholder='Select service type'/>
                                <button className='bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition'>
                                    Find Technicians
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full overflow-hidden -mt-25">
                    <svg width="1440" height="130" viewBox="0 0 1440 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M79.9424 9.78223C159.941 19.0678 319.968 37.6426 480 37.6426C560.018 37.6426 640.032 32.9993 720.034 27.5801C800.04 22.1606 880.028 15.9649 960.019 12.8604C1120 6.88345 1279.98 12.6872 1359.98 15.9951H1359.98L1439.5 19.0527V129.5H0.5V0.561523L79.9424 9.78223Z" fill="#F9FAFB" stroke="black"/>
                    </svg>
                </div>
            </div>
        </section>

        {/* services overview */}
        <section>
            <div className='bg-[#eeeeee]'>
                <div>
                    <div className='items-center justify-center text-center p-5 py-10'>
                        <h1 className='text-2xl font-bold'>Our Repair services</h1>
                        <p className='text-gray-500'>Professional repair services for all your home appliances with same-day service availability</p>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-10'>
                        {services.map((service, idx) => (
                        <div key={idx} className="p-10 shadow rounded bg-white">
                            {service.popular && (
                              <div className="flex justify-end">
                                <span className="bg-blue-300 p-2 text-blue-600 text-sm rounded-full">Popular</span>
                            </div>  
                            )}
                            

                            <div className="mb-4">
                                <img src={service.icon} alt="Service icon" className="w-8 h-8" />
                            </div>
                            <h2 className="text-lg font-bold">{service.title}</h2>
                            <p>{service.description}</p>
                            <button className="mt-4 text-blue-600 py-2 ">
                            {service.button} <ArrowForwardOutlinedIcon sx={{fontSize: 18}}/>
                            </button>
                        </div>
                    ))}
                    </div>
                </div>
                <div className='text-center p-5'>
                    <p className='text-gray-500 font-semibold'>View All Services</p>
                </div>
            </div>
        </section>
            

        {/* how it workd */}
        <section>
            <div>
                <div className='p-10 text-center'>
                    <h1 className='font-bold text-2xl'>How LocalFix Works</h1>
                    <p className='text-gray-500'>Get your appliances fixed in 4 simple steps</p>
                </div>
                <div className='flex'>
                    {workingSteps.map((step, idx) => (
                        <div key={idx}>
                            <div><step.icon/></div>
                            <h1>{step.title}</h1>
                            <p>{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
            

        {/* speciality */}
        <section>
            <div></div>
        </section>
            

        {/* call to action */}
        <section>
            <div></div>
        </section>
        <Footer/>
    </div>
  )
}

export default Home