import Header from '../../../components/common/Header'
import Footer from '../../../components/common/Footer'
import SignUp from '../../../components/common/Signup'

const TechSignUp = () => {
  return (
    <div>
        <Header userType='serviceProvider'/>
        <SignUp userType='serviceProvider'/>
        <Footer/>
    </div>
  )
}

export default TechSignUp