import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

const Footer = () => {
    const services = ['AC Repair', 'Washing Machine', 'Refrigerator', 'Fan Repair', 'TV Repair'];
    const company = ['About Us', 'Careers', 'Blog', 'Terms of Service', 'Privacy Policy'];

  return (
    <>
        {/* Main Footer Content */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-[14%] p-6 lg:p-10'>
            {/* Company Info & Socials */}
            <div className='lg:p-5 col-span-1 md:col-span-2 lg:col-span-1'>
                <div>
                    <h1 className='text-[#2563EB] text-xl font-bold'>LocalFix</h1> 
                </div>
                <div className='max-w-xs lg:w-50 text-gray-500 py-3'>
                    <p>Connecting homeowners in Kannur with verified local technicians for all your appliance repair needs.</p>
                </div>
                <div className='flex gap-4'>
                    <FacebookOutlinedIcon sx={{ fontSize: 24, color: 'grey', cursor: 'pointer' }} className="hover:text-blue-600 transition-colors"/>
                    <InstagramIcon sx={{ fontSize: 24, color: 'grey', cursor: 'pointer' }} className="hover:text-pink-600 transition-colors"/>
                    <TwitterIcon sx={{ fontSize: 24, color: 'grey', cursor: 'pointer' }} className="hover:text-blue-400 transition-colors"/>
                </div>
            </div>

            {/* Services */}
            <div className='col-span-1'>
                <h1 className='font-bold py-3 text-gray-800'>Services</h1>
                <ul className='text-sm space-y-2'>
                    {services.map((list, index) => (
                        <li key={index} className='text-gray-500 hover:text-gray-700 cursor-pointer transition-colors'>
                            {list}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Company */}
            <div className='col-span-1'>
                <h1 className='font-bold py-3 text-gray-800'>Company</h1>
                <ul className='text-sm space-y-2'>
                    {company.map((list, index) => (
                        <li key={index} className='text-gray-500 hover:text-gray-700 cursor-pointer transition-colors'>
                            {list}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Contact */}
            <div className='col-span-1'>
                <h1 className='font-bold py-3 text-gray-800'>Contact</h1>
                <ul className='text-sm space-y-3'>
                    <li className='text-gray-500 flex items-center gap-2'>
                        <LocalPhoneOutlinedIcon sx={{ fontSize: 18 }}/> 
                        <span className="hover:text-gray-700 cursor-pointer transition-colors">+91 9876543221</span>
                    </li>
                    <li className='text-gray-500 flex items-center gap-2'>
                        <EmailOutlinedIcon sx={{ fontSize: 18 }}/> 
                        <span className="hover:text-gray-700 cursor-pointer transition-colors">support@localFix.in</span>
                    </li>
                    <li className='text-gray-500 flex items-start gap-2'>
                        <LocationOnOutlinedIcon sx={{ fontSize: 18 }} className="mt-0.5"/> 
                        <span className="hover:text-gray-700 cursor-pointer transition-colors">Localfix Office, Town Center, Kannur</span>
                    </li>
                </ul>
            </div>
        </div>

        {/* Copyright Section */}
        <div className='border-t border-gray-200 bg-gray-50'>
            <div className='flex flex-col sm:flex-row justify-between items-center p-4 lg:p-5 lg:pl-15 text-gray-500 text-sm gap-4 sm:gap-0'>
                <p>© 2024 LocalFix. All rights reserved.</p>
                <div className='flex gap-4 lg:gap-2 lg:pr-10'>
                    <p className="hover:text-gray-700 cursor-pointer transition-colors">Terms</p>
                    <p className="hover:text-gray-700 cursor-pointer transition-colors">Privacy</p>
                    <p className="hover:text-gray-700 cursor-pointer transition-colors">Cookies</p>
                </div>
            </div>
        </div>
    </>
  )
}

export default Footer