import type { TechnicianDetails } from "../../../../../validation/types/technicianTypes";

interface ServicesSkillsTabProps {
  technician: TechnicianDetails;
  isSuspended?: boolean;
}

const ServicesSkillsTab: React.FC<ServicesSkillsTabProps> = ({
  technician,
  isSuspended,
}) => {
  const getServiceColor = (service: string) => {
    const colors: Record<string, string> = {
      "AC Repair": "bg-blue-100 text-blue-800 border border-blue-200",
      "AC Installation": "bg-blue-100 text-blue-800 border border-blue-200",
      Refrigerator: "bg-green-100 text-green-800 border border-green-200",
      "Washing Machine":
        "bg-indigo-100 text-indigo-800 border border-indigo-200",
      "Fan Repair": "bg-purple-100 text-purple-800 border border-purple-200",
      "TV Repair": "bg-pink-100 text-pink-800 border border-pink-200",
      "Microwave Oven":
        "bg-orange-100 text-orange-800 border border-orange-200",
      "Water Purifier": "bg-cyan-100 text-cyan-800 border border-cyan-200",
      "Geyser/Water Heater": "bg-red-100 text-red-800 border border-red-200",
      Plumbing: "bg-teal-100 text-teal-800 border border-teal-200",
      Electrical: "bg-amber-100 text-amber-800 border border-amber-200",
    };
    return (
      colors[service] || "bg-gray-100 text-gray-800 border border-gray-200"
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {isSuspended && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">
            <strong>Note:</strong> Services are temporarily unavailable while
            technician is suspended.
          </p>
        </div>
      )}
      <h2 className="text-lg font-medium mb-6">Services & Skills</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Services Offered */}
        <div>
          <h3 className="text-base font-medium mb-4">Services Offered</h3>
          <div className="flex flex-wrap gap-2">
            {technician.services.map((service, index) => (
              <span
                key={index}
                className={`px-3 py-2 rounded-full text-sm font-medium ${getServiceColor(
                  service
                )}`}
              >
                {service}
              </span>
            ))}
          </div>
        </div>

        {/* Work Areas */}
        <div>
          <h3 className="text-base font-medium mb-4">Service Areas</h3>
          <div className="flex flex-wrap gap-2">
            {technician.workAreas.map((area, index) => (
              <span
                key={index}
                className="px-3 py-2 bg-gray-100 rounded-full text-sm border border-gray-200"
              >
                {area}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Service Radius: {technician.serviceRadiusKm} km
          </p>
        </div>

        {/* Experience */}
        <div>
          <h3 className="text-base font-medium mb-4">Experience</h3>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-2xl font-bold text-blue-800">
              {technician.experienceYears}{" "}
              {technician.experienceYears === 1 ? "Year" : "Years"}
            </p>
            <p className="text-blue-600 text-sm">Professional Experience</p>
          </div>
        </div>

        {/* Service Statistics */}
        <div>
          <h3 className="text-base font-medium mb-4">Service Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Jobs Completed</span>
              <span className="font-medium">
                {technician.completedJobs || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ongoing Jobs</span>
              <span className="font-medium">{technician.ongoingJobs || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Success Rate</span>
              <span className="font-medium text-green-600">
                {technician.completedJobs && technician.totalJobs
                  ? `${Math.round(
                      (technician.completedJobs / technician.totalJobs) * 100
                    )}%`
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesSkillsTab;
