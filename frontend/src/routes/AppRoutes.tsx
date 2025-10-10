import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Bouncy } from 'ldrs/react'
import 'ldrs/react/Bouncy.css'
import { Toaster } from "react-hot-toast";

// User Routes imports
const Home = lazy(() => import('../features/user/pages/Home'))
const SignUpForm = lazy(() => import('../features/user/pages/SignUpForm'))
const UserLogin = lazy(() => import('../features/user/pages/LoginForm'))
const ForgetPassword = lazy(() => import('../features/user/pages/ForgotPassword'))
const UserOTP = lazy(() => import('../features/user/pages/UserOTP'))
const ResetPasswordPage = lazy(() => import('../features/user/pages/ResetPassword'))
const ForgetOTP = lazy(() => import('../features/user/pages/ForgertOtp'))

// Service Provider Routes imports
const TechHome = lazy(() => import('../features/serviceProvider/pages/TechHome'))
const TechSignUp = lazy(() => import('../features/serviceProvider/pages/TechSignUp'))
const TechnicianApplication = lazy(() => import('../features/serviceProvider/pages/TechnicianApplication'))
const TechLogin = lazy(() => import('../features/serviceProvider/pages/TechLogin'))
const TechForgotPassword = lazy(() => import('../features/serviceProvider/pages/TechForgotPassword'))
const TechOTP = lazy(() => import('../features/serviceProvider/pages/TechOTP'))
const PendingTechnicianApplication = lazy(() => import('../features/serviceProvider/pages/PendingTechnician'))
const ApprovedTechnicianDashboard = lazy(() => import('../features/serviceProvider/pages/ApprovedTechnician'))

// AdminRoutes imports
const AdminLogin = lazy(() => import('../features/admin/pages/AdminLogin'))
const AdminDashboard = lazy(() => import('../features/admin/pages/AdminDashboard'))
const ProtectedRoute = lazy(() => import('../components/ProtectedRoute'))
const AdminForgotPassword = lazy(() => import('../features/admin/pages/AdminForgotPassword'))
const AdminForgotOTP = lazy(() => import('../features/admin/pages/AdminForgotOTP'))
const UserManagement = lazy(() => import('../features/admin/pages/UserManagement'))
const AdminResetPasswordPage = lazy(() => import('../features/admin/pages/AdminResetPassword'))
const TechnicianManagement = lazy(() => import('../features/admin/pages/TechnicianManagement'))
const TechnicianProfile = lazy(() => import('../features/admin/pages/TechnicianProfile'))
const PendingApplicationProfile = lazy(() => import('../features/admin/pages/PendingTechnicianProfile'))

const AppRoutes = () => {
    return (
        <>
            <Toaster position="top-center" reverseOrder={false} />
            <Router>
                <Suspense fallback={
                    <div className="#bg-[#F6F6F6] flex justify-center items-center h-screen">
                        <Bouncy size="45" speed="1.75" color="FE4F00"/>
                    </div>
                }>
                    <Routes>
                        <Route path='/' element={<Home/>}/>
                        <Route path='/login' element={<UserLogin/>}/>
                        <Route path='/signUp' element={<SignUpForm/>}/>
                        <Route path='/otp' element={<UserOTP/>} />
                        <Route path='/forgot-password' element={<ForgetPassword/>}/>
                        <Route path='/verify-otp' element={<ForgetOTP/>}/>
                        <Route path='/reset-password' element={<ResetPasswordPage/>}/>

                        {/* technicians routes */}
                        <Route path='/technicians' element={<TechHome/>}/>
                        <Route path='/technicians/signup' element={<TechSignUp/>}/>
                        <Route path='/technicians/apply' element={<TechnicianApplication/>}/>
                        <Route path='/technicians/login' element={<TechLogin/>}/>
                        <Route path='/technicians/forgot-password' element={<TechForgotPassword/>}/>
                        <Route path='/technicians/verify-otp' element={<TechOTP/>}/>
                        <Route path='/pending-technician/dashboard' element={<PendingTechnicianApplication/>}/>
                        <Route path='/technician/dashboard' element={<ApprovedTechnicianDashboard/>}/>

                        {/* admin routes */}
                        <Route path='/admin/login'element={<AdminLogin/>}/>
                        <Route path='/admin/dashboard'element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminDashboard/>
                            </ProtectedRoute>
                        }/>
                        <Route path='/admin/forgot-password' element={<AdminForgotPassword/>}/>
                        <Route path='/admin/verify-otp' element={<AdminForgotOTP/>}/>
                        <Route path='/admin/reset-password' element={<AdminResetPasswordPage />} />
                        <Route path='/admin/user-management' element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <UserManagement/>
                            </ProtectedRoute>
                        }/>
                        <Route path='/admin/technician-management' element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <TechnicianManagement/>
                            </ProtectedRoute>
                        }/>
                        <Route path='/admin/technicians/:technicianId' element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <TechnicianProfile/>
                            </ProtectedRoute>
                        }/>
                        <Route path='/admin/technicians/:technicianId/:tabId' element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <TechnicianProfile/>
                                </ProtectedRoute>
                            }/>
                        <Route path='/admin/pending-applications/:applicationId' element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <PendingApplicationProfile/>
                            </ProtectedRoute>
                        }/>
                    </Routes>
                </Suspense>
            </Router>
        </>
    )
}

export default AppRoutes