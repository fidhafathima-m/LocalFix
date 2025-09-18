import React from 'react'
import Header from '../../components/Header'
import { ApplicationForm } from '../../components/Service Provider/ApplicationForm'
import Footer from '../../components/Footer'
export const TechnicianApplication: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header userType='serviceProvider' isLoggedIn={false} isApproved={false}/>
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Technician Application</h1>
          <p className="text-gray-600 mt-2">
            Join LocalFix as a technician and grow your business
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <ApplicationForm />
        </div>
      </main>
      <Footer/>
    </div>
  )
}
