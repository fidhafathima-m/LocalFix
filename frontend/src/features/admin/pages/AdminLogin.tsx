import Header from '../../../components/common/Header'
import Footer from '../../../components/common/Footer'
import Login from '../../../components/common/Login'

const AdminLogin = () => {
  return (
    <div>
        <Header userType='admin'/>
        <Login userType='admin'/>
        <Footer/>
    </div>
  )
}

export default AdminLogin