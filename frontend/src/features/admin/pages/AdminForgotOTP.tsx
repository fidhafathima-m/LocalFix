import Header from '../../../components/common/Header'
import Footer from '../../../components/common/Footer'
import OTP from '../../../components/common/OTP'

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