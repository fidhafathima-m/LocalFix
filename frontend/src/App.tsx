import './App.css'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Home from './pages/User/Home'
import UserLogin from './pages/User/UserLogin'
import SignUp from './pages/User/SignUp'
import TechHome from './pages/ServiceProvider/TechHome'
import { TechnicianApplication } from './pages/ServiceProvider/TechnicianApplication'
import TechLogin from './pages/ServiceProvider/TechLogin'
import ForgetPassword from './pages/User/ForgotPassword'
import UserOTP from './pages/User/UserOTP'
import ForgetOTP from './pages/User/ForgrtOtp'
import ResetPasswordPage from './pages/User/ResetPassword'
import TechForgotPassword from './pages/ServiceProvider/TechForgotPassword'
import OTP from './components/OTP'
import AdminLogin from './pages/Admin/AdminLogin'
import { AdminDashboard } from './pages/Admin/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import AdminForgotPassword from './pages/Admin/AdminForgotPassword'
import { UserManagement } from './pages/Admin/UserManagement'
import AdminForgotOTP from './pages/Admin/AdminForgotOTP'
import AdminResetPasswordPage from './pages/Admin/AdminResetPassword'
import { TechnicianManagement } from './pages/Admin/TechnicianManagement'
import { Toaster } from 'react-hot-toast'

function App() {

  return (
    <>
    <Toaster position="top-center" reverseOrder={false} />
      <Router>
        <Routes>
          {/* user routes */}
          <Route path='/' element={<Home/>}/>
          <Route path='/login' element={<UserLogin/>}/>
          <Route path='/signUp' element={<SignUp/>}/>
          <Route path='/otp' element={<UserOTP/>} />
          <Route path='/forgot-password' element={<ForgetPassword/>}/>
          <Route path='/verify-otp' element={<ForgetOTP/>}/>
          <Route path='/reset-password' element={<ResetPasswordPage/>}/>

          {/* technicians routes */}

          <Route path='/technicians' element={<TechHome/>}/>
          <Route path='/technicians/apply' element={<TechnicianApplication/>}/>
          <Route path='/technicians/login' element={<TechLogin/>}/>
          <Route path='/technicians/forgot-password' element={<TechForgotPassword/>}/>
          <Route path='/technicians/verify-otp' element={<OTP userType='serviceProvider' context='signup'/>}/>

          {/* admin routes */}
          <Route path='/admin/login'element={<AdminLogin/>}/>
          <Route path='/admin/dashboard'element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard/></ProtectedRoute>}/>
          <Route path='/admin/forgot-password' element={<AdminForgotPassword/>}/>
          <Route path='/admin/verify-otp' element={<AdminForgotOTP/>}/>
          <Route path='/admin/reset-password' element={<AdminResetPasswordPage />} />
          <Route path='/admin/user-management' element={<ProtectedRoute allowedRoles={['admin']}><UserManagement/></ProtectedRoute>}/>
          <Route path='/admin/technician-management' element={<ProtectedRoute allowedRoles={['admin']}><TechnicianManagement/></ProtectedRoute>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App
