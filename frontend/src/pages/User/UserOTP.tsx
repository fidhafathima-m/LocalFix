import Header from '../../components/Header'
import Footer from '../../components/Footer'
import OTP from '../../components/OTP'

const UserOTP = () => {
  return (
    <div>
        <Header userType='user' isLoggedIn={false}/>
        <OTP userType='user' phone='+91 987654321'/>
        <Footer/>
    </div>
  )
}

export default UserOTP