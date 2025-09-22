import React from 'react'
import {
  DashboardOutlined,
  SellOutlined,
  ConstructionOutlined,
  PeopleAltOutlined,
  AccountBalanceWalletOutlined,
  EventAvailableOutlined,
  CreditCardOutlined,
  BarChartOutlined,
  StarBorderOutlined,
  LogoutOutlined, 
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext'; 
import { useNavigate } from 'react-router-dom';

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => {
  return (
    <a
      href="#"
      onClick={onClick}
      className={`flex items-center px-4 py-3 rounded-md transition-colors cursor-pointer ${
        active ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </a>
  )
}

interface AdminSidebarProps {
  activePage: string
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activePage }) => {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout();
    if (user?.role === 'admin') navigate('/admin/login');
    else navigate('/login'); 
};

  return (
    <div className="w-[240px] bg-white shadow-md fixed left-0 top-0 bottom-0 z-20 overflow-y-auto flex flex-col justify-between">
      {/* Top navigation */}
      <div>
        {/* Logo */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-blue-600 font-bold text-xl">LocalFix Admin</h1>
        </div>

        {/* Navigation */}
        <nav className="p-3">
          <div className="space-y-1">
            <SidebarItem
              icon={<DashboardOutlined className="h-5 w-5" />}
              label="Dashboard"
              active={activePage === 'Dashboard'}
            />
            <SidebarItem
              icon={<PeopleAltOutlined className="h-5 w-5" />}
              label="Users"
              active={activePage === 'Users'}
            />
            <SidebarItem
              icon={<ConstructionOutlined className="h-5 w-5" />}
              label="Technicians"
              active={activePage === 'Technicians'}
            />
            <SidebarItem
              icon={<SellOutlined className="h-5 w-5" />}
              label="Category"
              active={activePage === 'Category'}
            />
            <SidebarItem
              icon={<CreditCardOutlined className="h-5 w-5" />}
              label="Subscription Plans"
              active={activePage === 'Subscription Plans'}
            />
            <SidebarItem
              icon={<EventAvailableOutlined className="h-5 w-5" />}
              label="Bookings"
              active={activePage === 'Bookings'}
            />
            <SidebarItem
              icon={<AccountBalanceWalletOutlined className="h-5 w-5" />}
              label="Payments"
              active={activePage === 'Payments'}
            />
            <SidebarItem
              icon={<StarBorderOutlined className="h-5 w-5" />}
              label="Reviews"
              active={activePage === 'Reviews'}
            />
            <SidebarItem
              icon={<BarChartOutlined className="h-5 w-5" />}
              label="Reports"
              active={activePage === 'Reports'}
            />
          </div>
        </nav>
      </div>

      {/* Logout at the bottom */}
      <div className="p-3 border-t border-gray-200">
        <SidebarItem
          icon={<LogoutOutlined className="h-5 w-5 text-red-500" />}
          label="Logout"
          onClick={handleLogout}
        />
      </div>
    </div>
  )
}
