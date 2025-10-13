import type { TechnicianDetails } from "../../../../../validation/types/technicianTypes";

interface EarningsJobsTabProps {
  technician: TechnicianDetails;
  isSuspended?: boolean;
}

const EarningsJobsTab: React.FC<EarningsJobsTabProps> = ({
  technician,
  isSuspended,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {isSuspended && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">
            <strong>Note:</strong> No new earnings while technician is
            suspended.
          </p>
        </div>
      )}
      <h2 className="text-lg font-medium mb-6">Earnings & Jobs</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-2xl font-bold text-green-800">
            ₹{technician.totalEarnings?.toLocaleString() || "0"}
          </p>
          <p className="text-green-600 text-sm">Total Earnings</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-2xl font-bold text-blue-800">
            {technician.totalJobs || 0}
          </p>
          <p className="text-blue-600 text-sm">Total Jobs</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-2xl font-bold text-purple-800">
            {technician.completedJobs || 0}
          </p>
          <p className="text-purple-600 text-sm">Completed Jobs</p>
        </div>
      </div>
    </div>
  );
};

export default EarningsJobsTab;
