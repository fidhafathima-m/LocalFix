import React from 'react'

type UserType = 'user' | 'serviceProvider' | 'admin';

interface HeaderProps {
    userType: UserType;
    isApproved?: boolean,
    isLoggedIn: boolean
}
const signUpButtonStyles = "bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition items-center justify-center"

const Header: React.FC<HeaderProps> = ({userType, isApproved, isLoggedIn}) => {
    const links = () => {
        switch(userType) {
            case 'user':
                if(!isLoggedIn) {
                    return (
                    <>
                        <a href="/services">Services</a>
                        <a href="/how-it-works">How it works</a>
                        <a href="/technicians">For Technician</a>
                        <a href="/login">Login</a>
                        <a href="/signup" className={signUpButtonStyles}>Sign up</a>
                    </>
                    )
                } else {
                    return (
                    <>
                        <a href="/services">Services</a>
                        <a href="/how-it-works">How it works</a>
                        <a href="/technicians">For Technician</a>
                        <a href="/my-orders">My Orders</a>
                        <a href="/my-profile">Profile</a>
                        <a href="/logout">Logout</a>
                    </>
                    )
                }
            case 'serviceProvider':
                if(!isLoggedIn) {
                    return (
                    <>
                        <a href="/technicians/services">Services</a>
                        <a href="/technicians/how-it-works">How it works</a>
                        <a href="/technicians/why-join">Why Join</a>
                        <a href="/users">Users</a>
                        <a href="/technicians/login">Login</a>
                        <a href="/technicians/apply-now">Apply Now</a>
                    </>
                    )
                } else {
                    if(!isApproved) {
                        return (
                        <>
                            <a href="/pending-technician/dashboard">Dashboard</a>
                            <a href="/pending-technician/profile">Profile</a>
                            <a href="/pending-technician/logout">Logout</a>
                        </>
                        )
                    } else {
                        return (
                        <>
                            <a href="/approved-technician/dashboard">Dashboard</a>
                            <a href="/approved-technician/bookings">Bookings</a>
                            <a href="/approved-technician/messages">Messages</a>
                            <a href="/approved-technician/profile">Profile</a>
                            <a href="/approved-technician/logout">Logout</a>
                        </>
                        )
                    }
                    
                }
            case 'admin':
                if(!isLoggedIn) {
                    return (
                    <>
                        <a href="/services">Services</a>
                        <a href="/how-it-workd">How it works</a>
                        <a href="/technicians">For Technician</a>
                        <a href="/login">Login</a>
                        <a href="/signup">Sign up</a>
                    </>
                    )
                } else {
                    return (
                    <>
                        <a href="/services">Services</a>
                        <a href="/how-it-workd">How it works</a>
                        <a href="/technicians">For Technician</a>
                        <a href="/my-orders">My Orders</a>
                        <a href="/my-profile">Profile</a>
                    </>
                    )
                }
                
        }
    }
  return (
    <header className='flex items-center justify-between '>
        <h1 className='text-[#2563EB] text-xl p-5 font-bold'>
            Localfix
        </h1>
        <nav className='flex gap-6 p-5 items-center text-sm'>
            {links()}
        </nav>
    </header>
  )
}

export default Header