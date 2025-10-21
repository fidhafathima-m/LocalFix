import AccordionSection from "./AccordianSections";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
const DangerZone = () => {
  return (
    <AccordionSection title="Danger Zone" number={8}>
      <div className="bg-red-50 rounded-lg p-4 border border-red-100">
        <div className="flex items-start mb-6">
          <WarningAmberOutlinedIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
          <div>
            <h3 className="text-red-500 font-medium mb-4">
              Deactivate Profile
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Temporarily deactivate your profile. You won't receive any new job
              requests until you reactivate.
            </p>
            <button className="bg-amber-50 text-amber-600 border border-amber-200 px-4 py-2 rounded">
              Deactivate Profile
            </button>
          </div>
        </div>
        <div className="border-t border-red-200 pt-6">
          <h3 className="text-red-500 font-medium mb-4">Delete Account</h3>
          <p className="text-sm text-gray-600 mb-4">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </p>
          <button className="bg-red-50 text-red-500 border border-red-200 px-4 py-2 rounded">
            Delete Account
          </button>
        </div>
      </div>
    </AccordionSection>
  );
};
export default DangerZone;
