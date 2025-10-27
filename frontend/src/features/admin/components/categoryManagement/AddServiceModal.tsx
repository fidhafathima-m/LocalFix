import { useState } from 'react'
import { CloseOutlined, FileUploadOutlined } from '@mui/icons-material'
import { AdminSidebar } from '../AdminSidebar'
import type { CreateServiceData } from '../../../../services/common/adminApi'

interface AddServiceModalProps {
  categoryName: string
  onClose: () => void
  onSubmit: (serviceData: CreateServiceData) => Promise<{ success: boolean; message?: string }>
}

export function AddServiceModal({
  categoryName,
  onClose,
  onSubmit,
}: AddServiceModalProps) {
  const [serviceName, setServiceName] = useState('')
  const [description, setDescription] = useState('')
  const [avgBasePrice, setAvgBasePrice] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [iconUrl, setIconUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!serviceName.trim() || !description.trim()) {
      return
    }

    setLoading(true)
    try {
      const result = await onSubmit({
        name: serviceName.trim(),
        description: description.trim(),
        avgBasePrice: avgBasePrice ? parseFloat(avgBasePrice) : 0,
        status,
        iconUrl: iconUrl.trim() || undefined,
      })

      if (result.success) {
        onClose()
      }
    } catch (error) {
      console.error('Error submitting service:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 text-gray-400 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <AdminSidebar activePage='Category'/>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Add Service - {categoryName}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-100 rounded-full p-1"
          >
            <CloseOutlined className="h-5 w-5" />
          </button>
        </div>

        {/* Form - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Service Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Name *
              </label>
              <input
                type="text"
                required
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="Enter service name"
                disabled={loading}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Enter service description"
                disabled={loading}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200"
              />
            </div>

            {/* Average Base Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Average Base Price *
              </label>
              <input
                type="number"
                required
                value={avgBasePrice}
                onChange={(e) => setAvgBasePrice(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                disabled={loading}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                disabled={loading}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Icon Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon URL (optional)
              </label>
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <FileUploadOutlined className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex-1">
                  <input
                    type="url"
                    value={iconUrl}
                    onChange={(e) => setIconUrl(e.target.value)}
                    placeholder="https://example.com/icon.png"
                    disabled={loading}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG, GIF up to 2MB. Recommended size: 100×100px.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !serviceName.trim() || !description.trim() || !avgBasePrice}
              onClick={handleSubmit}
              className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Service'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}