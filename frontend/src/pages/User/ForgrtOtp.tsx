import Header from '../../components/Header'
import Footer from '../../components/Footer'
import OTP from '../../components/OTP'

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