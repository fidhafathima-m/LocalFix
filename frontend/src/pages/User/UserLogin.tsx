import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Login from '../../components/Login'

const UserLogin = () => {
  return (
    <div>
        <Header/>
        <Login userType='user'/>
        <Footer/>
    </div>
  )
}

export default UserLogin