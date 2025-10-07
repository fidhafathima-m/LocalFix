import React from 'react'
import { Link } from 'react-router-dom'
interface TechnicianProfileTabsProps {
  technicianId: string
  activeTab: string
}
export const TechnicianProfileTabs: React.FC<TechnicianProfileTabsProps> = ({
  technicianId,
  activeTab,
}) => {
  const tabs = [
    {
      id: 'personal-info',
      name: 'Personal Info',
    },
    {
      id: 'services-skills',
      name: 'Services & Skills',
    },
    {
      id: 'verification-documents',
      name: 'Verification & Documents',
    },
    {
      id: 'availability',
      name: 'Availability',
    },
    {
      id: 'earnings-jobs',
      name: 'Earnings & Jobs',
    },
    {
      id: 'reviews-ratings',
      name: 'Reviews & Ratings',
    },
    {
      id: 'active-bookings',
      name: 'Active Bookings',
    },
  ]
  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-6 px-6">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            to={`/admin/technicians/${technicianId}/${tab.id}`}
            className={`py-3 px-1 border-b-2 text-sm font-medium ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            {tab.name}
          </Link>
        ))}
      </nav>
    </div>
  )
}
