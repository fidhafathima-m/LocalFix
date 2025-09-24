import Header from '../../../components/common/Header'
import Footer from '../../../components/common/Footer'
import Login from '../../../components/common/Login'

const TechLogin = () => {
  return (
    <div>
        <Header userType='serviceProvider'/>
        <Login userType='serviceProvider'/>
        <Footer/>
    </div>
  )
}

export default TechLogin