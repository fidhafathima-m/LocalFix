import React from 'react'
import { AdminSidebar } from '../../components/Admin/AdminSidebar'
import { StatsCard } from '../../components/Admin/StatsCard'
import { ApprovalCard } from '../../components/Admin/ApprovalCard'
import { ActivityItem } from '../../components/Admin/ActivityItem'
import {
  PeopleAltOutlined,
  CalendarMonthOutlined,
  ManageAccountsOutlined,
  CurrencyRupeeOutlined,
  
  ErrorOutlineOutlined,
  CheckCircleOutlined,
  QueryBuilderOutlined,
} from '@mui/icons-material';
import Search from '../../components/Admin/Search'
export const AdminDashboard: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar activePage='Dashboard'/>
      {/* Main content  */}
      <div className="flex-1 overflow-y-auto ml-[240px]">
        {/* Header with search */}
       <Search />

        {/* Dashboard content */}
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Users"
              value="1,256"
              icon={<PeopleAltOutlined className="h-6 w-6 text-blue-500" />}
              linkText="View all users"
              linkUrl="#"
              color="blue"
            />
            <StatsCard
              title="Active Bookings"
              value="42"
              icon={<CalendarMonthOutlined className="h-6 w-6 text-green-500" />}
              linkText="View active bookings"
              linkUrl="#"
              color="green"
            />
            <StatsCard
              title="Technicians"
              value="128"
              icon={<ManageAccountsOutlined className="h-6 w-6 text-yellow-500" />}
              linkText="View all technicians"
              linkUrl="#"
              color="yellow"
            />
            <StatsCard
              title="Monthly Revenue"
              value="₹125,000"
              icon={<CurrencyRupeeOutlined className="h-6 w-6 text-purple-500" />}
              linkText="View financial reports"
              linkUrl="#"
              color="purple"
            />
          </div>
          {/* Pending Approvals */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Pending Approvals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ApprovalCard
                title="Technician Applications"
                count={8}
                countLabel="pending approvals"
                actionText="Review applications"
                actionUrl="#"
                icon={<ManageAccountsOutlined className="h-5 w-5 text-yellow-500" />}
                color="yellow"
              />
              <ApprovalCard
                title="Booking Requests"
                count={12}
                countLabel="pending assignments"
                actionText="Assign technicians"
                actionUrl="#"
                icon={<CalendarMonthOutlined className="h-5 w-5 text-blue-500" />}
                color="blue"
              />
              <ApprovalCard
                title="Payment Verifications"
                count={5}
                countLabel="pending verifications"
                actionText="Process payments"
                actionUrl="#"
                icon={<CurrencyRupeeOutlined className="h-5 w-5 text-green-500" />}
                color="green"
              />
              <ApprovalCard
                title="Support Tickets"
                count={7}
                countLabel="unresolved tickets"
                actionText="Resolve tickets"
                actionUrl="#"
                icon={<ErrorOutlineOutlined className="h-5 w-5 text-red-500" />}
                color="red"
              />
            </div>
          </div>
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <ActivityItem
                name="Amit Sharma"
                action="booked a AC Repair service"
                time="2 hours ago"
                icon={<CalendarMonthOutlined className="h-5 w-5 text-blue-500" />}
                iconBg="bg-blue-100"
              />
              <ActivityItem
                name="Sakshi Kumar"
                action="applied as a Plumbing technician"
                time="3 hours ago"
                icon={<ManageAccountsOutlined className="h-5 w-5 text-yellow-500" />}
                iconBg="bg-yellow-100"
              />
              <ActivityItem
                name="Priya Patel"
                action="reviewed: Refrigerator Repair"
                time="5 hours ago"
                icon={<CheckCircleOutlined className="h-5 w-5 text-green-500" />}
                iconBg="bg-green-100"
                rating={4}
              />
              <ActivityItem
                name="Vikram Malhotra"
                action="paid ₹1,200 for AC Repair"
                time="6 hours ago"
                icon={<CurrencyRupeeOutlined className="h-5 w-5 text-purple-500" />}
                iconBg="bg-purple-100"
              />
              <ActivityItem
                name="Neha Singh"
                action="cancelled Fan Repair booking"
                time="8 hours ago"
                icon={<QueryBuilderOutlined className="h-5 w-5 text-red-500" />}
                iconBg="bg-red-100"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
