import Header from '../../components/Header'
import Footer from '../../components/Footer'
import OTP from '../../components/OTP'

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