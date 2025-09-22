import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ForgetPassword from '../../components/ForgetPassword/ForgetPassword'

const AdminForgotPassword = () => {
  return (
    <div>
        <Header/>
        <ForgetPassword userType='admin'/>
        <Footer/>
    </div>
  )
}

export default AdminForgotPassword