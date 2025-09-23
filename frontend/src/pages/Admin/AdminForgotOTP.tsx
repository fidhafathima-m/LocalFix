import Header from '../../components/Header'
import Footer from '../../components/Footer'
import OTP from '../../components/OTP'

const AdminForgotOTP = () => {
  return (
    <div>
        <Header/>
        <OTP userType='admin' context='forgot'/>
        <Footer/>
    </div>
  )
}

export default AdminForgotOTP