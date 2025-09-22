import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext';


interface HeaderProps {
    isApproved?: boolean,
    userType?: 'user' | 'serviceProvider' | 'admin'
}

const Header: React.FC<HeaderProps> = ({isApproved, userType: propUserType}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const {isLoggedIn, logout, user} = useAuth()
    const userType = propUserType || user?.role || 'user';

    // Close mobile menu when window is resized to desktop size
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileMenuOpen(false);
            }
        };

        // Handle scroll to add shadow
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const signUpButtonStyles = "bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium";
    const mobileSignUpButtonStyles = "bg-blue-600 text-white px-6 py-3.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center mx-4 my-2";

    const links = () => {
        switch(userType) {
            case 'user':
                if(!isLoggedIn) {
                    return (
                    <>
                        <a href="/services" className="px-3 hover:text-blue-600 transition-colors" onClick={closeMobileMenu}>Services</a>
                        <a href="/how-it-works" className="px-3 hover:text-blue-600 transition-colors" onClick={closeMobileMenu}>How it works</a>
                        <a href="/technicians" className="px-3 hover:text-blue-600 transition-colors" onClick={closeMobileMenu}>For Technicians</a>
                        <a href="/login" className="px-3 hover:text-blue-600 transition-colors" onClick={closeMobileMenu}>Login</a>
                        <a href="/signup" className={`ml-2 ${signUpButtonStyles}`} onClick={closeMobileMenu}>Sign up</a>
                    </>
                    )
                } else {
                    return (
                    <>
                        <a href="/services" className="px-3 hover:text-blue-600 transition-colors" onClick={closeMobileMenu}>Services</a>
                        <a href="/how-it-works" className="px-3 hover:text-blue-600 transition-colors" onClick={closeMobileMenu}>How it works</a>
                        <a href="/technicians" className="px-3 hover:text-blue-600 transition-colors" onClick={closeMobileMenu}>For Technicians</a>
                        <a href="/my-orders" className="px-3 hover:text-blue-600 transition-colors" onClick={closeMobileMenu}>My Orders</a>
                        <a href="/my-profile" className="px-3 hover:text-blue-600 transition-colors" onClick={closeMobileMenu}>Profile</a>
                        <button 
                            onClick={logout} 
                            className="px-3 text-red-500 hover:text-blue-600 transition-colors"
                        >
                            Logout
                        </button>

                    </>
                    )
                }
            case 'serviceProvider':
                if(!isLoggedIn) {
                    return (
                    <>
                        <a href="/technicians/services" className="px-3 hover:text-blue-600 transition-colors" onClick={closeMobileMenu}>Services</a>
                        <a href="/technicians/how-it-works" className="px-3 hover:text-blue-600 transition-colors" onClick={closeMobileMenu}>How it works</a>
                        <a href="/technicians/why-join" className="px-3 hover:text-blue-600 transition-colors" onClick={closeMobileMenu}>Why Join</a>
                        <a href="/" className="px-3 hover:text-blue-600 transition-colors" onClick={closeMobileMenu}>Users</a>
                        <a href="/technicians/login" className="px-3 hover:text-blue-600 transition-colors" onClick={closeMobileMenu}>Login</a>
                        <a href="/technicians/apply" className={`ml-2 ${signUpButtonStyles}`} onClick={closeMobileMenu}>Apply Now</a>
                    </>
                    )
                } else {
                    if(!isApproved) {
                        return (
                        <>
                            <a href="/pending-technician/dashboard" className="px-3 hover:text-blue-600 transition-colors" onClick={closeMobileMenu}>Dashboard</a>
                            <a href="/pending-technician/profile" className="px-3 hover:text-blue-600 transition-colors" onClick={closeMobileMenu}>Profile</a>
                            <a href="/pending-technician/logout" className="px-3 hover:text-blue-600 transition-colors" onClick={closeMobileMenu}>Logout</a>
                        </>
                        )
                    } else {
                        return (
                        <>
                            <a href="/approved-technician/dashboard" className="px-3 hover:text-blue-600 transition-colors" onClick={closeMobileMenu}>Dashboard</a>
                            <a href="/approved-technician/bookings" className="px-3 hover:text-blue-600 transition-colors" onClick={closeMobileMenu}>Bookings</a>
                            <a href="/approved-technician/messages" className="px-3 hover:text-blue-600 transition-colors" onClick={closeMobileMenu}>Messages</a>
                            <a href="/approved-technician/profile" className="px-3 hover:text-blue-600 transition-colors" onClick={closeMobileMenu}>Profile</a>
                            <a href="/approved-technician/logout" className="px-3 hover:text-blue-600 transition-colors" onClick={closeMobileMenu}>Logout</a>
                        </>
                        )
                    }
                    
                }
            case 'admin':
                if(isLoggedIn) {
                    return (
                    <>
                        <a href="/admin/dashboard" className="px-3 hover:text-blue-600 transition-colors" onClick={closeMobileMenu}>Dashboard</a>
                        <a href="/admin/profile" className="px-3 hover:text-blue-600 transition-colors" onClick={closeMobileMenu}>Profile</a>
                        <a href="/admin/logout" className="px-3 hover:text-blue-600 transition-colors" onClick={closeMobileMenu}>Logout</a>
                    </>
                    )
                } else {
                    return (
                    <>
                       
                    </>
                    )
                }
                
        }
    }

    const mobileLinks = () => {
        const desktopLinks = links();
        
        // For mobile, we need to handle the sign up button differently
        return React.Children.map(desktopLinks, (link) => {
            if (link.props.className && link.props.className.includes(signUpButtonStyles)) {
                return React.cloneElement(link, {
                    className: mobileSignUpButtonStyles,
                    onClick: closeMobileMenu
                });
            }
            
            return React.cloneElement(link, {
                className: "block w-full px-6 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium border-b border-gray-100",
                onClick: closeMobileMenu
            });
        });
    }

    return (
        <header className={`sticky top-0 z-50 bg-white transition-shadow ${isScrolled ? 'shadow-md' : 'shadow-sm'}`}>
            {/* Main Header */}
            <div className='flex items-center justify-between mx-auto px-4'>
                <h1 className='text-blue-600 text-xl py-5 font-bold'>
                    {userType === 'serviceProvider' ? <a href="/technicians">Localfix</a> : <a href="/">Localfix</a>}
                    
                </h1>

                {/* Desktop Navigation */}
                <nav className='hidden lg:flex gap-1 items-center text-sm'>
                    {links()}
                </nav>

                {/* Mobile Hamburger Button */}
                <button
                    className='lg:hidden p-5 focus:outline-none'
                    onClick={toggleMobileMenu}
                    aria-label="Toggle mobile menu"
                    aria-expanded={isMobileMenuOpen}
                >
                    <div className="w-6 h-6 flex flex-col justify-center items-center relative">
                        <span className={`bg-gray-800 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                            isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'
                        }`}></span>
                        <span className={`bg-gray-800 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${
                            isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                        }`}></span>
                        <span className={`bg-gray-800 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                            isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'
                        }`}></span>
                    </div>
                </button>
            </div>

            {/* Mobile Navigation Overlay */}
            <div className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-300 ease-in-out ${
                isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}>
                <div 
                    className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm" 
                    onClick={closeMobileMenu}
                ></div>
                <div className={`absolute top-0 right-0 h-full w-4/5 max-w-sm bg-white/95 shadow-xl transform transition-transform duration-300 ease-in-out ${
                    isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>
                    <div className="flex flex-col h-full overflow-y-auto">
                        <div className="flex justify-between items-center p-5 border-b">
                            <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
                            <button 
                                onClick={closeMobileMenu}
                                className="p-2 rounded-full hover:bg-gray-100"
                                aria-label="Close menu"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <nav className="flex-1 py-2">
                            <div className="flex flex-col">
                                {mobileLinks()}
                            </div>
                        </nav>
                        <div className="p-5 border-t border-gray-100 text-center text-sm text-gray-500">
                            © {new Date().getFullYear()} Localfix
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header