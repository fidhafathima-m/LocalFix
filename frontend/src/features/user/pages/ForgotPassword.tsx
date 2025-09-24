import Header from '../../../components/common/Header'
import Footer from '../../../components/common/Footer'
import ForgetPassword from '../../../components/common/ForgetPassword'

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