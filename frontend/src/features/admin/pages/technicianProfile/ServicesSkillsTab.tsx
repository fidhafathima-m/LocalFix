import React from 'react'
import { AdminActions } from '../../components/technicianManagement/AdminActions'
export const ServicesSkillsTab: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Services & Skills</h2>
        <button className="flex items-center text-blue-600 hover:text-blue-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          <span className="ml-1">Edit</span>
        </button>
      </div>
      <div className="space-y-8">
        <div>
          <h3 className="text-base font-medium mb-3">Main Services</h3>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
              AC Repair
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
              Refrigerator
            </span>
          </div>
        </div>
        <div>
          <h3 className="text-base font-medium mb-3">Sub Services</h3>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
              Gas Refill
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
              Compressor Repair
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
              Cooling Issues
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
              General Maintenance
            </span>
          </div>
        </div>
        <div>
          <h3 className="text-base font-medium mb-3">Experience</h3>
          <p className="text-gray-700">5 years</p>
        </div>
        <div>
          <h3 className="text-base font-medium mb-4">Certifications</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <h4 className="font-medium">AC Repair Certification</h4>
                <p className="text-gray-500 text-sm mt-1">
                  Carrier Training Institute
                </p>
                <p className="text-gray-500 text-sm">2018</p>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm">
                View
              </button>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">Refrigerator Repair Course</h4>
                <p className="text-gray-500 text-sm mt-1">LG Service Academy</p>
                <p className="text-gray-500 text-sm">2019</p>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm">
                View
              </button>
            </div>
          </div>
        </div>
      </div>
      <AdminActions />
    </div>
  )
}
