import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Login from '../../components/Login'

const TechLogin = () => {
  return (
    <div>
        <Header userType='serviceProvider' isLoggedIn={false}/>
        <Login userType='serviceProvider'/>
        <Footer/>
    </div>
  )
}

export default TechLogin