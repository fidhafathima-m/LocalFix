import React from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

const Login = () => {
  return (
    <div>
        <Header userType='user' isLoggedIn={false}/>
        <Footer/>
    </div>
  )
}

export default Login