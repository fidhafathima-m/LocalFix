import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ForgetPassword from '../../components/ForgetPassword/ForgetPassword'

const ForgotPassword = () => {
  return (
    <div>
        <Header/>
        <ForgetPassword userType='user'/>
        <Footer/>
    </div>
  )
}

export default ForgotPassword