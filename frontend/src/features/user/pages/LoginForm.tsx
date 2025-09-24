import Header from '../../../components/common/Header'
import Footer from '../../../components/common/Footer'
import Login from '../../../components/common/Login'

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