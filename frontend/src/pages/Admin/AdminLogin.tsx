import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Login from '../../components/Login'

const AdminLogin = () => {
  return (
    <div>
        <Header userType='admin' isLoggedIn={false}/>
        <Login userType='admin'/>
        <Footer/>
    </div>
  )
}

export default AdminLogin