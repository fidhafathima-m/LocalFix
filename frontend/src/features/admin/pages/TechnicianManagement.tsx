import React, { useState, useEffect } from 'react'
import { AdminSidebar } from '../components/AdminSidebar'
import { 
  SearchOutlined, 
  ExpandMoreOutlined, 
  FileDownloadOutlined, 
  RemoveRedEyeOutlined, 
  EditOutlined, 
  BlockOutlined,
  CheckCircleOutlined,
  PeopleAltOutlined,
  VerifiedUserOutlined,
  PersonOffOutlined,
  PersonAddAltOutlined,
  // CancelOutlined
} from '@mui/icons-material'
import Search from '../components/Search'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../../hooks/redux'
import { fetchApplicationsFailure, fetchApplicationsStart, fetchApplicationsSuccess, fetchTechniciansFailure, fetchTechniciansStart, fetchTechniciansSuccess, removeApplication, updateApplicationStatus, updateTechnicianStatus } from '../../../store/slices/adminSlice'
import { adminAPI } from '../../../services/adminApi'

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

// Type guards to distinguish between Technician and TechnicianApplication
const isTechnician = (item: Technician | TechnicianApplication): item is Technician => {
  return 'displayName' in item && 'services' in item && 'experienceYears' in item;
}

const isTechnicianApplication = (item: Technician | TechnicianApplication): item is TechnicianApplication => {
  return 'personal' in item && 'skills' in item;
}

const TechnicianManagement: React.FC = () => {

  const {technicians, applications, techniciansLoading, applicationsLoading} = useAppSelector((state) => state.admin)
  const dispatch = useAppDispatch()

  const [searchQuery, setSearchQuery] = useState('')
  const [serviceFilter, setServiceFilter] = useState('All Services')
  const [ratingFilter, setRatingFilter] = useState('All Ratings')
  const [activeTab, setActiveTab] = useState('active') 
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Fetch technicians and applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(fetchTechniciansStart());
        dispatch(fetchApplicationsStart());
        
        const [techniciansResponse, applicationsResponse] = await Promise.all([
          adminAPI.getTechnicians(),
          adminAPI.getPendingApplications()
        ]);

        if (techniciansResponse.data.success && techniciansResponse.data.data) {
          dispatch(fetchTechniciansSuccess(techniciansResponse.data.data.technicians || []));
        }

        if (applicationsResponse.data.success && applicationsResponse.data.data) {
          dispatch(fetchApplicationsSuccess(applicationsResponse.data.data.applications || []));
        }
        
      } catch (error) {
        console.error('❌ Error fetching data:', error);
        dispatch(fetchTechniciansFailure('Failed to load technician data'));
        dispatch(fetchApplicationsFailure('Failed to load applications data'));
        toast.error('Failed to load technician data');
      } 
    };

    fetchData();
  }, [dispatch]);

  // Filter technicians based on active tab
  const filteredTechnicians = technicians.filter(tech => {
    if (activeTab === 'pending') {
      return false // Pending applications are handled separately
    } else if (activeTab === 'suspended') {
      return tech.status === 'suspended'
    } else if (activeTab === 'active') {
      return tech.status === 'approved'
    } else if (activeTab === 'rejected') {
      return tech.status === 'rejected'
    }
    return true
  })

  // Filter applications for pending tab
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.personal?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.personal?.phoneNumber?.includes(searchQuery)
    
    const matchesService = serviceFilter === 'All Services' || 
                          (app.skills?.services?.includes(serviceFilter) ?? false)
    
    return matchesSearch && matchesService
  })

  // Filter technicians with all filters (excluding status since we have separate tabs)
  const filteredTechs = filteredTechnicians.filter(tech => {
    const matchesSearch = tech.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       tech.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       tech.user?.phone?.includes(searchQuery) ||
                       tech.workAreas.some(area => area.toLowerCase().includes(searchQuery.toLowerCase()))
  
    const matchesService = serviceFilter === 'All Services' || 
                        tech.services.includes(serviceFilter)
  
    const matchesRating = ratingFilter === 'All Ratings' || 
                       (ratingFilter === '5 Star' && tech.averageRating >= 4.8) ||
                       (ratingFilter === '4+ Star' && tech.averageRating >= 4.0) ||
                       (ratingFilter === '3+ Star' && tech.averageRating >= 3.0)

    return matchesSearch && matchesService && matchesRating
  })

  // Get current items based on active tab
  const getCurrentItems = (): (Technician | TechnicianApplication)[] => {
    if (activeTab === 'pending') {
      return filteredApplications;
    } else {
      return filteredTechs;
    }
  }

  // Pagination calculations
  const currentItems = getCurrentItems();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItemsPage = currentItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(currentItems.length / itemsPerPage);

  // Reset to page 1 when filters or tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, serviceFilter, ratingFilter, activeTab]);

  // Count calculations based on real data
  const allTechnicians = technicians.length;
  const pendingApplications = applications.length;
  const suspendedTechnicians = technicians.filter(t => t.status === 'suspended').length;
  const approvedTechnicians = technicians.filter(t => t.status === 'approved').length;
  const rejectedTechnicians = technicians.filter(t => t.status === 'rejected').length;

  // Service badge colors
  const getServiceColor = (service: string): string => {
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
    };
    return colors[service] || 'bg-gray-100 text-gray-800';
  };

  // Status badge colors
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'approved': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'suspended': 'bg-red-100 text-red-800',
      'rejected': 'bg-gray-100 text-gray-800',
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800'
    };
    
    const labels: Record<string, string> = {
      'approved': 'Active',
      'pending': 'Pending',
      'suspended': 'Suspended',
      'rejected': 'Rejected',
      'active': 'Active',
      'inactive': 'Inactive'
    };

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

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
        await adminAPI.approveApplication(applicationId);
        dispatch(updateApplicationStatus({ applicationId, status: 'approved' }));
        toast.success(`Application approved! ${applicantName} is now an active technician.`);
        
      } catch (error) {
        console.error('Error approving application:', error);
        toast.error('Failed to approve application. Please try again.');
      }
    }
  };

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
      await adminAPI.rejectApplication(applicationId, reason);
      dispatch(removeApplication(applicationId));
      toast.success(`Application rejected. ${applicantName} has been notified.`);
      
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
        await adminAPI.updateTechnicianStatus(technicianId, newStatus);
        
        const successMessage = newStatus === 'suspended' 
          ? `${technicianName} has been suspended successfully.`
          : `${technicianName} has been activated successfully.`;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          dispatch(updateTechnicianStatus({ technicianId, status: newStatus as any }));
        
        toast.success(successMessage);
        
        
      } catch (error) {
        console.error('Error updating technician status:', error);
        toast.error(`Failed to ${action} technician. Please try again.`);
      }
    }
  };

  // Render table rows based on item type
  const renderTableRows = () => {
    if (activeTab === 'pending') {
      return currentItemsPage.map((item) => {
        if (isTechnicianApplication(item)) {
          return (
            <tr key={item._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-medium">
                      {item.personal?.fullName?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {item.personal?.fullName || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      #{item._id.slice(-6)}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {item.personal?.phoneNumber || 'N/A'}
                </div>
                <div className="text-sm text-gray-500">
                  {item.email}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-1">
                  {item.skills?.services?.slice(0, 2).map((service: string) => (
                    <span
                      key={service}
                      className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full ${getServiceColor(service)}`}
                    >
                      {service}
                    </span>
                  ))}
                  {item.skills?.services && item.skills.services.length > 2 && (
                    <span className="px-2 py-1 text-xs text-gray-500">
                      +{item.skills.services.length - 2} more
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.skills?.yearsOfExperience || 0} years
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(item.submittedAt || item.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button 
                    onClick={() => handleApproveApplication(item._id, item.personal?.fullName || 'Applicant')}
                    className="p-1 rounded-full text-green-600 hover:bg-green-100 transition-colors"
                    title="Approve"
                  >
                    <CheckCircleOutlined className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleRejectApplication(item._id, item.personal?.fullName || 'Applicant')}
                    className="p-1 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                    title="Reject"
                  >
                    <BlockOutlined className="h-5 w-5" />
                  </button>
                  <Link 
                    to={`/admin/pending-applications/${item._id}`}
                    className="p-1 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                    title="View Details"
                  >
                    <RemoveRedEyeOutlined className="h-5 w-5" />
                  </Link>
                </div>
              </td>
            </tr>
          );
        }
        return null;
      });
    } else {
      return currentItemsPage.map((item) => {
        if (isTechnician(item)) {
          return (
            <tr key={item._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 text-sm font-medium">
                      {item.displayName.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {item.displayName}
                    </div>
                    <div className="text-sm text-gray-500">
                      #{item._id.slice(-6)}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {item.user?.phone || 'N/A'}
                </div>
                <div className="text-sm text-gray-500">
                  {item.user?.email || item.email}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-1">
                  {item.services.slice(0, 2).map((service: string) => (
                    <span
                      key={service}
                      className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full ${getServiceColor(service)}`}
                    >
                      {service}
                    </span>
                  ))}
                  {item.services.length > 2 && (
                    <span className="px-2 py-1 text-xs text-gray-500">
                      +{item.services.length - 2} more
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.experienceYears} years
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(item.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Link 
                    to={`/admin/technicians/${item._id}/personal-info`}
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
                  {item.status === 'approved' && (
                    <button 
                      onClick={() => handleStatusChange(item._id, 'suspended', item.displayName)}
                      className="p-1 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                      title="Suspend"
                    >
                      <BlockOutlined className="h-5 w-5" />
                    </button>
                  )}
                  {item.status === 'suspended' && (
                    <button 
                      onClick={() => handleStatusChange(item._id, 'approved', item.displayName)}
                      className="p-1 rounded-full text-green-600 hover:bg-green-100 transition-colors"
                      title="Activate"
                    >
                      <CheckCircleOutlined className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        }
        return null;
      });
    }
  };

  if (techniciansLoading || applicationsLoading) {
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
    );
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

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg flex items-start">
              <div className="p-2 bg-blue-100 rounded-md mr-3">
                <PeopleAltOutlined className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Technicians</p>
                <p className="text-xl font-bold">{allTechnicians}</p>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg flex items-start">
              <div className="p-2 bg-green-100 rounded-md mr-3">
                <VerifiedUserOutlined className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Technicians</p>
                <p className="text-xl font-bold">{approvedTechnicians}</p>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg flex items-start">
              <div className="p-2 bg-red-100 rounded-md mr-3">
                <PersonOffOutlined className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Suspended Technicians</p>
                <p className="text-xl font-bold">{suspendedTechnicians}</p>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg flex items-start">
              <div className="p-2 bg-yellow-100 rounded-md mr-3">
                <PersonAddAltOutlined className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Pending Applications
                </p>
                <p className="text-xl font-bold">{pendingApplications}</p>
              </div>
            </div>
          </div>

          {/* Tabs - Now with 4 tabs: Active, Pending, Suspended, Rejected */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex space-x-8">
              <button
                className={`py-2 px-1 -mb-px flex items-center space-x-1 ${activeTab === 'active' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('active')}
              >
                <span>Active Technicians</span>
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                  {approvedTechnicians}
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
              <button
                className={`py-2 px-1 -mb-px flex items-center space-x-1 ${activeTab === 'rejected' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('rejected')}
              >
                <span>Rejected Technicians</span>
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                  {rejectedTechnicians}
                </span>
              </button>
            </div>
          </div>

          {/* Search and filters - Removed status filter */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {activeTab === 'pending' ? (
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Services</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied On</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Technician</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Services</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  )}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItemsPage.length > 0 ? (
                    renderTableRows()
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        {activeTab === 'pending' ? 'No pending applications found' : 
                         activeTab === 'active' ? 'No active technicians found' : 
                         activeTab === 'suspended' ? 'No suspended technicians found' :
                         'No rejected technicians found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {currentItems.length > 0 && (
              <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>

                <div className="flex space-x-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-gray-300 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    Previous
                  </button>

                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        currentPage === index + 1
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-gray-300 hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      currentPage === totalPages
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-gray-300 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TechnicianManagement