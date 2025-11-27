import { StarBorderOutlined } from "@mui/icons-material";
import { useEffect, useState } from "react";

interface AnalyticsSectionProps {
  title: string;
  data?: Array<{
    label: string;
    value: string;
    stars?: number;
  }>;
  showStars?: boolean;
  type?: "satisfaction" | "payments";
}

const AnalyticsSection = ({
  title,
  data,
  showStars = false,
}: AnalyticsSectionProps) => {
  const [sectionData, setSectionData] = useState(data || []);
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    if (data) {
      setSectionData(data);
      return;
    }

    setLoading(false);
  }, [data]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-medium">{title}</h2>
        </div>
        <div className="p-5">
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="flex justify-between items-center animate-pulse"
              >
                <div className="flex items-center">
                  {showStars && (
                    <div className="flex mr-2">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 bg-gray-200 rounded mr-1"
                        ></div>
                      ))}
                    </div>
                  )}
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-10"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-lg font-medium">{title}</h2>
      </div>
      <div className="p-5">
        <div className="space-y-3">
          {sectionData.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex items-center">
                {showStars && item.stars && (
                  <div className="flex mr-2">
                    {[...Array(5)].map((_, i) => (
                      <StarBorderOutlined
                        key={i}
                        className={
                          i < item.stars!
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }
                        fontSize="small"
                      />
                    ))}
                  </div>
                )}
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
              <span className="text-sm font-medium">{item.value}</span>
            </div>
          ))}
          {sectionData.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;
