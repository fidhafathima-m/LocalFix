import Header from '../../../components/common/Header'
import Footer from '../../../components/common/Footer'
import ForgetPassword from '../../../components/common/ForgetPassword'

const TechForgotPassword = () => {
  return (
    <div>
        <Header/>
        <ForgetPassword userType='serviceProvider'/>
        <Footer/>
    </div>
  )
}

export default TechForgotPassword