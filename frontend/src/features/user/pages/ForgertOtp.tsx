import Header from '../../../components/common/Header'
import Footer from '../../../components/common/Footer'
import OTP from '../../../components/common/OTP'

const ForgetOTP = () => {
  return (
    <div>
        <Header/>
        <OTP userType='user' context='forgot'/>
        <Footer/>
    </div>
  )
}

export default ForgetOTP