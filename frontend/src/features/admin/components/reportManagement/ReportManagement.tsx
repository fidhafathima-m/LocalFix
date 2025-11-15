import { AdminSidebar } from "../adminDashboard/actions/AdminSidebar";
import ReportDashboard from "./sections/ReportDashboard";

const ReportManagement = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar activePage="Reports" />
      <div className="flex-1 overflow-y-auto ml-[240px]">
        <ReportDashboard />
      </div>
    </div>
  );
};

export default ReportManagement;
