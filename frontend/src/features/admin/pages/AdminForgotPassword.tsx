import Header from '../../../components/common/Header'
import Footer from '../../../components/common/Footer'
import ForgetPassword from '../../../components/common/ForgetPassword'

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