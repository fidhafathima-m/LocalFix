import AccordionSection from './AccordianSections'
import {
  FileUploadOutlined,
  DescriptionOutlined,
  CheckCircleOutlineOutlined,
  ErrorOutlineOutlined,
  AccessTimeOutlined,
} from '@mui/icons-material';
const DocumentsVerification = () => {
  return (
    <AccordionSection title="Documents & Verification" number={6}>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium">Uploaded Documents</h3>
          <button className="flex items-center bg-blue-500 text-white px-3 py-1.5 rounded">
            <FileUploadOutlined className=" h-5 w-5 mr-1" />
            Upload New
          </button>
        </div>
        <div className="bg-white rounded-lg overflow-hidden mb-6">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded On
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <DescriptionOutlined className="h-5 w-5 text-gray-400 mr-2" />
                    <span>ID Proof.pdf</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">ID</td>
                <td className="py-3 px-4 text-sm text-gray-500">2023-08-15</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center w-fit">
                    <CheckCircleOutlineOutlined className="h-5 w-5 mr-1" />
                    Approved
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <DescriptionOutlined className="h-5 w-5 text-gray-400 mr-2" />
                    <span>Police Verification.pdf</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">
                  Police Verification
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">2023-08-20</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center w-fit">
                    <AccessTimeOutlined className="h-5 w-5 mr-1" />
                    Pending
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <DescriptionOutlined className="h-5 w-5 text-gray-400 mr-2" />
                    <span>HVAC Certificate.pdf</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">Certificate</td>
                <td className="py-3 px-4 text-sm text-gray-500">2023-08-10</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center w-fit">
                    <CheckCircleOutlineOutlined className="h-5 w-5 mr-1" />
                    Approved
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <DescriptionOutlined className="h-5 w-5 text-gray-400 mr-2" />
                    <span>Training Certificate.pdf</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">Certificate</td>
                <td className="py-3 px-4 text-sm text-gray-500">2023-08-05</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center w-fit">
                    <ErrorOutlineOutlined className="h-5 w-5 mr-1" />
                    Needs Re-upload
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Upload New Document</h3>
          <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
            <div className="mb-3">
              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                <FileUploadOutlined className=" h-5 w-5 text-blue-500" />
              </div>
            </div>
            <button className="text-blue-500 font-medium mb-1">
              Upload a file
            </button>
            <p className="text-sm text-gray-500">or drag and drop</p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, PDF up to 5MB
            </p>
          </div>
        </div>
      </div>
    </AccordionSection>
  )
}
export default DocumentsVerification
