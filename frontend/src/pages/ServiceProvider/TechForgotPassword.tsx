import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ForgetPassword from '../../components/ForgetPassword/ForgetPassword'

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