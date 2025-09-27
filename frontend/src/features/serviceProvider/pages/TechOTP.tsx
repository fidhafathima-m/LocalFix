import Header from '../../../components/common/Header'
import Footer from '../../../components/common/Footer'
import OTP from '../../../components/common/OTP'

const TechOTP = () => {
  return (
    <div>
        <Header/>
        <OTP userType='serviceProvider' context='signup'/>
        <Footer/>
    </div>
  )
}

export default TechOTP