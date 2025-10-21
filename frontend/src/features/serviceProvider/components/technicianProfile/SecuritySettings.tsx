import AccordionSection from "./AccordianSections";
const SecuritySettings = () => {
  return (
    <AccordionSection title="Security & Settings" number={7}>
      <div>
        <h3 className="text-sm font-medium mb-4">Change Password</h3>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm mb-1">Current Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter current password"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">New Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 8 characters with a number and a special
              character
            </p>
          </div>
          <div>
            <label className="block text-sm mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              Update Password
            </button>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-4">Login Activity</h3>
          <div className="bg-gray-50 rounded p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Last Login Time</span>
              <span className="text-sm font-medium">
                Aug 25, 2023, 10:45 AM
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Device Info</span>
              <span className="text-sm font-medium">Chrome on Android</span>
            </div>
          </div>
          <div className="flex justify-end mb-2">
            <button className="text-blue-500 text-sm">
              View All Login Activity
            </button>
          </div>
          <div className="flex justify-end">
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </AccordionSection>
  );
};
export default SecuritySettings;
