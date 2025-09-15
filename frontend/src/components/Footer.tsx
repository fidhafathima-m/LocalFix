import React from 'react'
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

const Footer = () => {
    const services = ['AC Repair', 'Washing Machine', 'Refrigerator', 'Fan Repair', 'TV Repair'];
    const company = ['About Us', 'Careers', 'Blog', 'Terms of Service', 'Privary Policy'];

  return (
    <div className='flex gap-[14%]'>
        {/* socials */}
        <div className='p-5'>
            <div>
               <h1 className='text-[#2563EB] text-xl font-bold'>LocalFix</h1> 
            </div>
            <div className='w-50 text-gray-500 py-3'>
                <p>Connecting homeowners in Kannur with verified local technicians for all your appliance repair needs.</p>
            </div>
            <div className='flex gap-4'>
                <FacebookOutlinedIcon sx={{ fontSize: 24, color: 'grey' }}/>
                <InstagramIcon sx={{ fontSize: 24, color: 'grey' }}/>
                <TwitterIcon sx={{ fontSize: 24, color: 'grey' }}/>
            </div>

        </div>
        {/* services */}
        <div>
            <h1 className='font-bold py-3'>Services</h1>
            <ul className='text-sm'>
                {services.map(list => (
                    <li className='pb-3 text-gray-500'>{list}</li>
                ))}
            </ul>
        </div>
        {/* comapny */}
        <div>
            <h1 className='font-bold py-3'>Company</h1>
            <ul className='text-sm'>
                {company.map(list => (
                    <li className='pb-3 text-gray-500'>{list}</li>
                ))}
            </ul>
        </div>
        {/* contact */}
        <div>
            <h1 className='font-bold py-3'>Contact</h1>
            <ul className='text-sm'>
                <li className='pb-3 text-gray-500'><LocalPhoneOutlinedIcon/> +91 9876543221</li>
                <li className='pb-3 text-gray-500'><EmailOutlinedIcon/> support@localFix.in</li>
                <li className='pb-3 text-gray-500'><LocationOnOutlinedIcon/> Localfix Office, Town Center, Kannur</li>
            </ul>
        </div>
    </div>
  )
}

export default Footer