import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ForgetPassword from '../../components/ForgetPassword/ForgetPassword'

const UserOTP = () => {
  return (
    <div>
        <Header userType='user' isLoggedIn={false}/>
        <ForgetPassword userType='user'/>
        <Footer/>
    </div>
  )
}

export default UserOTP