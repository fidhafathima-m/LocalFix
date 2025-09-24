import Header from '../../../components/common/Header'
import Footer from '../../../components/common/Footer'
import OTP from '../../../components/common/OTP'

const UserOTP = () => {
  return (
    <div>
        <Header/>
        <OTP userType='user' context='signup'/>
        <Footer/>
    </div>
  )
}

export default UserOTP