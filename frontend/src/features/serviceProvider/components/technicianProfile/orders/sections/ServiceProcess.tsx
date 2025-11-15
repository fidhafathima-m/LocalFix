import { CheckCircleOutlineOutlined } from "@mui/icons-material";

interface ServiceProgressProps {
  status: string;
}

const ServiceProgress: React.FC<ServiceProgressProps> = ({ status }) => {
  const steps = [
    { label: "Pending", status: "pending" },
    { label: "Accepted", status: "accepted" },
    { label: "On the way", status: "on_the_way" },
    { label: "In Progress", status: "in_progress" },
    { label: "Completed", status: "completed" },
  ];

  const getStepStatus = (stepStatus: string, currentStatus: string) => {
    const statusOrder = [
      "pending",
      "accepted",
      "on_the_way",
      "in_progress",
      "completed",
    ];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "upcoming";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
      <h3 className="text-sm font-medium text-gray-900 mb-6">
        Service Progress
      </h3>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepStatus = getStepStatus(step.status, status);
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    stepStatus === "completed"
                      ? "bg-blue-600 text-white"
                      : stepStatus === "current"
                      ? "bg-blue-100 text-blue-600 border-2 border-blue-600"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {stepStatus === "completed" ? (
                    <CheckCircleOutlineOutlined />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 ${
                      stepStatus === "completed" ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
              <span className="text-xs text-gray-600 mt-2 text-center">
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceProgress;
