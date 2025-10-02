import './App.css'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Home from './features/user/pages/Home'
import UserLogin from './features/user/pages/LoginForm'
import TechHome from './features/serviceProvider/pages/TechHome'
import { TechnicianApplication } from './features/serviceProvider/pages/TechnicianApplication'
import TechLogin from './features/serviceProvider/pages/TechLogin'
import ForgetPassword from './features/user/pages/ForgotPassword'
import UserOTP from './features/user/pages/UserOTP'
import ForgetOTP from './features/user/pages/ForgertOtp'
import ResetPasswordPage from './features/user/pages/ResetPassword'
import TechForgotPassword from './features/serviceProvider/pages/TechForgotPassword'
import AdminLogin from './features/admin/pages/AdminLogin'
import { AdminDashboard } from './features/admin/pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import AdminForgotPassword from './features/admin/pages/AdminForgotPassword'
import { UserManagement } from './features/admin/pages/UserManagement'
import AdminForgotOTP from './features/admin/pages/AdminForgotOTP'
import AdminResetPasswordPage from './features/admin/pages/AdminResetPassword'
import { TechnicianManagement } from './features/admin/pages/TechnicianManagement'
import { Toaster } from 'react-hot-toast'
import TechSignUp from './features/serviceProvider/pages/TechSignUp'
import TechOTP from './features/serviceProvider/pages/TechOTP'
import SignUpForm from './features/user/pages/SignUpForm'
import { PendingTechnicianApplication } from './features/serviceProvider/pages/PendingTechnician'

function App() {
  return (
    <>
    <Toaster position="top-center" reverseOrder={false} />
      <Router>
        <Routes>
          {/* user routes */}
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