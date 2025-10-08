import React, { useState, useEffect } from 'react'
import { AdminSidebar } from '../components/AdminSidebar'
import { 
  SearchOutlined, 
  ExpandMoreOutlined, 
  FileDownloadOutlined, 
  RemoveRedEyeOutlined, 
  EditOutlined, 
  BlockOutlined,
  CheckCircleOutlined
} from '@mui/icons-material'
import Search from '../components/Search'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import toast from 'react-hot-toast'
import { approveApplication, fetchPendingApplications, fetchTechnicians, rejectApplication, updateTechnicianStatus } from '../api/technicianApi'

interface Technician {
  _id: string
  userId: string
  displayName: string
  email?: string
  phone?: string
  services: string[]
  experienceYears: number
  workAreas: string[]
  serviceRadiusKm: number
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  averageRating: number
  ratingCount: number
  totalJobs?: number
  profilePictureUrl?: string
  createdAt: string
  updatedAt: string
  user?: {
    email: string
    phone: string
    fullName: string
  }
}

interface TechnicianApplication {
  _id: string
  technicianId: string
  email: string
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
  personal: {
    fullName?: string
    phoneNumber?: string
    email?: string
  }
  skills: {
    services?: string[]
    yearsOfExperience?: number
  }
  submittedAt?: string
  createdAt: string
}

export const TechnicianManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [serviceFilter, setServiceFilter] = useState('All Services')
  const [ratingFilter, setRatingFilter] = useState('All Ratings')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [activeTab, setActiveTab] = useState('all')
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [applications, setApplications] = useState<TechnicianApplication[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch technicians and applications
  // Fetch technicians and applications
useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        
        const [techniciansData, applicationsData] = await Promise.all([
          fetchTechnicians(),
          fetchPendingApplications()
        ]);


        setTechnicians(Array.isArray(techniciansData) ? techniciansData : []);
        setApplications(Array.isArray(applicationsData) ? applicationsData : []);
        
      } catch (error) {
        console.error('❌ Error fetching data:', error);
        setTechnicians([]);
        setApplications([]);
        toast.error('Failed to load technician data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Count calculations based on real data
  const allTechnicians = technicians.length
  const pendingApplications = applications.length
  const suspendedTechnicians = technicians.filter(t => t.status === 'suspended').length

  // Filter technicians based on active tab and filters
  // Filter technicians based on active tab and filters
const filteredTechnicians = technicians.filter(tech => {
  if (activeTab === 'pending') {
    return false // Pending applications are handled separately
  } else if (activeTab === 'suspended') {
    return tech.status === 'suspended'
  } else if (activeTab === 'all') {
    // Include all statuses except pending (since pending has its own tab)
    return tech.status === 'approved' || tech.status === 'suspended' || tech.status === 'rejected'
  }
  return true
})

  // Filter applications for pending tab
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.personal?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.personal?.phoneNumber?.includes(searchQuery)
    
    const matchesService = serviceFilter === 'All Services' || 
                          app.skills?.services?.includes(serviceFilter)
    
    return matchesSearch && matchesService
  })

  // Filter technicians for search and other filters
  const filteredTechs = filteredTechnicians.filter(tech => {
    const matchesSearch = tech.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tech.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tech.user?.phone?.includes(searchQuery) ||
                         tech.workAreas.some(area => area.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesService = serviceFilter === 'All Services' || 
                          tech.services.includes(serviceFilter)
    
    const matchesStatus = statusFilter === 'All Statuses' || 
                         tech.status === statusFilter.toLowerCase()
    
    const matchesRating = ratingFilter === 'All Ratings' || 
                         (ratingFilter === '5 Star' && tech.averageRating >= 4.8) ||
                         (ratingFilter === '4+ Star' && tech.averageRating >= 4.0) ||
                         (ratingFilter === '3+ Star' && tech.averageRating >= 3.0)

    return matchesSearch && matchesService && matchesStatus && matchesRating
  })

  // Service badge colors
  const getServiceColor = (service: string) => {
    const colors: Record<string, string> = {
      'AC Repair': 'bg-blue-100 text-blue-800',
      'AC Installation': 'bg-blue-100 text-blue-800',
      'Refrigerator': 'bg-green-100 text-green-800',
      'Washing Machine': 'bg-indigo-100 text-indigo-800',
      'Fan Repair': 'bg-purple-100 text-purple-800',
      'TV Repair': 'bg-pink-100 text-pink-800',
      'Microwave Oven': 'bg-orange-100 text-orange-800',
      'Water Purifier': 'bg-cyan-100 text-cyan-800',
      'Geyser/Water Heater': 'bg-red-100 text-red-800',
      'Plumbing': 'bg-teal-100 text-teal-800',
      'Electrical': 'bg-amber-100 text-amber-800',
    }
    return colors[service] || 'bg-gray-100 text-gray-800'
  }

  // Status badge colors
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'approved': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'suspended': 'bg-red-100 text-red-800',
      'rejected': 'bg-gray-100 text-gray-800',
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800'
    }
    
    const labels: Record<string, string> = {
      'approved': 'Active',
      'pending': 'Pending',
      'suspended': 'Suspended',
      'rejected': 'Rejected',
      'active': 'Active',
      'inactive': 'Inactive'
    }

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    )
  }

  // Handle application approval with confirmation
  const handleApproveApplication = async (applicationId: string, applicantName: string) => {
    const result = await Swal.fire({
      title: 'Approve Application?',
      html: `Are you sure you want to approve <strong>${applicantName}</strong>'s application?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, Approve!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await approveApplication(applicationId);
        toast.success(`Application approved! ${applicantName} is now an active technician.`);
        
        // Refresh data
        const [updatedTechnicians, updatedApplications] = await Promise.all([
          fetchTechnicians(),
          fetchPendingApplications()
        ]);
        
        setTechnicians(updatedTechnicians);
        setApplications(updatedApplications);
        
      } catch (error) {
        console.error('Error approving application:', error);
        toast.error('Failed to approve application. Please try again.');
      }
    }
  };

  // Updated rejection function
  const handleRejectApplication = async (applicationId: string, applicantName: string) => {
    const { value: reason } = await Swal.fire({
      title: 'Reject Application?',
      html: `Please provide a reason for rejecting <strong>${applicantName}</strong>'s application:`,
      icon: 'warning',
      input: 'textarea',
      inputLabel: 'Rejection Reason',
      inputPlaceholder: 'Enter the reason for rejection...',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Reject Application',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) return 'Please provide a rejection reason!';
        if (value.length < 10) return 'Reason must be at least 10 characters long';
      }
    });

    if (reason) {
      try {
        await rejectApplication(applicationId, reason);
        toast.success(`Application rejected. ${applicantName} has been notified.`);
        
        // Refresh data
        const updatedApplications = await fetchPendingApplications();
        setApplications(updatedApplications);
        
      } catch (error) {
        console.error('Error rejecting application:', error);
        toast.error('Failed to reject application. Please try again.');
      }
    }
  };

  // Updated status change function
  const handleStatusChange = async (technicianId: string, newStatus: string, technicianName: string) => {
    const action = newStatus === 'suspended' ? 'suspend' : 'activate';
    const actionTitle = newStatus === 'suspended' ? 'Suspend Technician?' : 'Activate Technician?';
    const actionText = newStatus === 'suspended' 
      ? `Are you sure you want to suspend ${technicianName}? They will not be able to accept new jobs.`
      : `Are you sure you want to activate ${technicianName}? They will be able to accept new jobs.`;

    const result = await Swal.fire({
      title: actionTitle,
      html: actionText,
      icon: newStatus === 'suspended' ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: newStatus === 'suspended' ? '#EF4444' : '#10B981',
      cancelButtonColor: '#6B7280',
      confirmButtonText: newStatus === 'suspended' ? 'Yes, Suspend!' : 'Yes, Activate!',
    });

    if (result.isConfirmed) {
      try {
        await updateTechnicianStatus(technicianId, newStatus);
        
        const successMessage = newStatus === 'suspended' 
          ? `${technicianName} has been suspended successfully.`
          : `${technicianName} has been activated successfully.`;
        
        toast.success(successMessage);
        
        // Refresh technicians data
        const updatedTechnicians = await fetchTechnicians();
        setTechnicians(updatedTechnicians);
        
      } catch (error) {
        console.error('Error updating technician status:', error);
        toast.error(`Failed to ${action} technician. Please try again.`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar activePage="Technicians" />
        <div className="flex-1 overflow-y-auto ml-[240px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading technician data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar activePage="Technicians" />
      
      {/* Main content */}
      <div className="flex-1 overflow-y-auto ml-[240px]">
        {/* Header with search */}
        <Search/>
        
        {/* Dashboard content */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">Technician Management</h1>
              <p className="text-gray-600">
                Manage technicians, review applications, and monitor performance.
              </p>
            </div>
            <button className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <FileDownloadOutlined className="h-4 w-4 mr-2" />
              Export Technicians
            </button>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex space-x-8">
              <button
                className={`py-2 px-1 -mb-px flex items-center space-x-1 ${activeTab === 'all' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('all')}
              >
                <span>All Technicians</span>
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                  {allTechnicians}
                </span>
              </button>
              <button
                className={`py-2 px-1 -mb-px flex items-center space-x-1 ${activeTab === 'pending' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('pending')}
              >
                <span>Pending Applications</span>
                <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs">
                  {pendingApplications}
                </span>
              </button>
              <button
                className={`py-2 px-1 -mb-px flex items-center space-x-1 ${activeTab === 'suspended' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('suspended')}
              >
                <span>Suspended Technicians</span>
                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs">
                  {suspendedTechnicians}
                </span>
              </button>
            </div>
          </div>

          {/* Search and filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="col-span-1 md:col-span-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, email, phone, or location"
                    className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <SearchOutlined className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div>
                <div className="relative">
                  <select
                    className="appearance-none w-full pl-4 pr-10 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                  >
                    <option>All Services</option>
                    <option>AC Repair</option>
                    <option>AC Installation</option>
                    <option>Refrigerator</option>
                    <option>Washing Machine</option>
                    <option>Fan Repair</option>
                    <option>TV Repair</option>
                    <option>Microwave Oven</option>
                    <option>Water Purifier</option>
                    <option>Geyser/Water Heater</option>
                  </select>
                  <ExpandMoreOutlined className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <div className="relative">
                  <select
                    className="appearance-none w-full pl-4 pr-10 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option>All Statuses</option>
                    <option>Active</option>
                    <option>Pending</option>
                    <option>Suspended</option>
                    <option>Rejected</option>
                  </select>
                  <ExpandMoreOutlined className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="md:col-start-2 md:col-span-2">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <select
                        className="appearance-none w-full pl-4 pr-10 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={ratingFilter}
                        onChange={(e) => setRatingFilter(e.target.value)}
                      >
                        <option>All Ratings</option>
                        <option>5 Star</option>
                        <option>4+ Star</option>
                        <option>3+ Star</option>
                      </select>
                      <ExpandMoreOutlined className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <select className="appearance-none w-full pl-4 pr-10 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option>All Locations</option>
                        <option>Kannur</option>
                        <option>Kochi</option>
                        <option>Kollam</option>
                        <option>Thiruvananthapuram</option>
                        <option>Thrissur</option>
                        <option>Malappuram</option>
                        <option>Kozhikode</option>
                      </select>
                      <ExpandMoreOutlined className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'pending' ? (
            /* Pending Applications Table */
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Services</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied On</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredApplications.map((app) => (
                      <tr key={app._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 text-sm font-medium">
                                {app.personal?.fullName?.charAt(0) || 'A'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {app.personal?.fullName || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                #{app._id.slice(-6)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {app.personal?.phoneNumber || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {app.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {app.skills?.services?.slice(0, 2).map((service) => (
                              <span
                                key={service}
                                className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full ${getServiceColor(service)}`}
                              >
                                {service}
                              </span>
                            ))}
                            {app.skills?.services && app.skills.services.length > 2 && (
                              <span className="px-2 py-1 text-xs text-gray-500">
                                +{app.skills.services.length - 2} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {app.skills?.yearsOfExperience || 0} years
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(app.submittedAt || app.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => handleApproveApplication(app._id, app.personal?.fullName || 'Applicant')}
                              className="p-1 rounded-full text-green-600 hover:bg-green-100 transition-colors"
                              title="Approve"
                            >
                              <CheckCircleOutlined className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => handleRejectApplication(app._id, app.personal?.fullName || 'Applicant')}
                              className="p-1 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                              title="Reject"
                            >
                              <BlockOutlined className="h-5 w-5" />
                            </button>
                            <Link 
                              to={`/admin/pending-applications/${app._id}`}
                              className="p-1 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                              title="View Details"
                            >
                              <RemoveRedEyeOutlined className="h-5 w-5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Technicians Table */
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Technician</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Services</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTechs.map((tech) => (
                      <tr key={tech._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 bg-yellow-100 rounded-full flex items-center justify-center">
                              <span className="text-yellow-600 text-sm font-medium">
                                {tech.displayName.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {tech.displayName}
                              </div>
                              <div className="text-sm text-gray-500">
                                #{tech._id.slice(-6)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {tech.user?.phone || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {tech.user?.email || tech.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {tech.services.slice(0, 2).map((service) => (
                              <span
                                key={service}
                                className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full ${getServiceColor(service)}`}
                              >
                                {service}
                              </span>
                            ))}
                            {tech.services.length > 2 && (
                              <span className="px-2 py-1 text-xs text-gray-500">
                                +{tech.services.length - 2} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {tech.experienceYears} years
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(tech.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link 
                              to={`/admin/technicians/${tech._id}/personal-info`}
                              className="p-1 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                              title="View Details"
                            >
                              <RemoveRedEyeOutlined className="h-5 w-5" />
                            </Link>
                            <button 
                              className="p-1 rounded-full text-green-600 hover:bg-green-100 transition-colors"
                              title="Edit"
                            >
                              <EditOutlined className="h-5 w-5" />
                            </button>
                            {tech.status === 'approved' && (
                              <button 
                                onClick={() => handleStatusChange(tech._id, 'suspended', tech.displayName)}
                                className="p-1 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                                title="Suspend"
                              >
                                <BlockOutlined className="h-5 w-5" />
                              </button>
                            )}
                            {tech.status === 'suspended' && (
                              <button 
                                onClick={() => handleStatusChange(tech._id, 'approved', tech.displayName)}
                                className="p-1 rounded-full text-green-600 hover:bg-green-100 transition-colors"
                                title="Activate"
                              >
                                <CheckCircleOutlined className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}