// components/categoryManagement/EditServiceModal.tsx
import { useState } from 'react'
import { CloseOutlined, FileUploadOutlined, AddOutlined, RemoveOutlined } from '@mui/icons-material'
import { AdminSidebar } from '../AdminSidebar'
import type { Service, UpdateServiceData } from '../../../../services/common/adminApi'

interface EditServiceModalProps {
  service: Service
  categoryName: string
  onClose: () => void
  onSubmit: (serviceId: string, updateData: UpdateServiceData) => Promise<{ success: boolean; message?: string }>
}

export function EditServiceModal({
  service,
  categoryName,
  onClose,
  onSubmit,
}: EditServiceModalProps) {
  const [serviceName, setServiceName] = useState(service.name)
  const [description, setDescription] = useState(service.description)
  const [avgBasePrice, setAvgBasePrice] = useState(service.avgBasePrice.toString())
  const [rating, setRating] = useState(service.rating?.toString() || '4.5')
  const [estimatedDuration, setEstimatedDuration] = useState(service.estimatedDuration || '2-4 hours')
  const [features, setFeatures] = useState<string[]>(service.features || [''])
  const [popular, setPopular] = useState(service.popular || false)
  const [status, setStatus] = useState<'active' | 'inactive'>(service.status)
  const [iconUrl, setIconUrl] = useState(service.iconUrl || '')
  const [loading, setLoading] = useState(false)

  const addFeature = () => {
    setFeatures([...features, ''])
  }

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features]
    newFeatures[index] = value
    setFeatures(newFeatures)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!serviceName.trim() || !description.trim()) {
      return
    }

    setLoading(true)
    try {
      const updateData: UpdateServiceData = {}
      
      // Only include changed fields
      if (serviceName !== service.name) updateData.name = serviceName.trim()
      if (description !== service.description) updateData.description = description.trim()
      if (parseFloat(avgBasePrice) !== service.avgBasePrice) updateData.avgBasePrice = parseFloat(avgBasePrice)
      if (parseFloat(rating) !== service.rating) updateData.rating = parseFloat(rating)
      if (estimatedDuration !== service.estimatedDuration) updateData.estimatedDuration = estimatedDuration.trim()
      if (JSON.stringify(features.filter(f => f.trim() !== '')) !== JSON.stringify(service.features || [])) {
        updateData.features = features.filter(f => f.trim() !== '')
      }
      if (popular !== service.popular) updateData.popular = popular
      if (status !== service.status) updateData.status = status
      if (iconUrl !== service.iconUrl) updateData.iconUrl = iconUrl.trim() || undefined

      // Only submit if there are changes
      if (Object.keys(updateData).length === 0) {
        onClose()
        return
      }

      const result = await onSubmit(service.id, updateData)

      if (result.success) {
        onClose()
      }
    } catch (error) {
      console.error('Error updating service:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 text-gray-400 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <AdminSidebar activePage='Category'/>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit Service - {categoryName}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <input
                  type="number"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  placeholder="4.5"
                  min="0"
                  max="5"
                  step="0.1"
                  disabled={loading}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Estimated Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Duration
              </label>
              <input
                type="text"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                placeholder="e.g., 2-4 hours"
                disabled={loading}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features
              </label>
              <div className="space-y-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder={`Feature ${index + 1}`}
                      disabled={loading}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                    {features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        disabled={loading}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <RemoveOutlined className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <AddOutlined className="w-4 h-4" />
                  Add Feature
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Popular */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="popular"
                  checked={popular}
                  onChange={(e) => setPopular(e.target.checked)}
                  disabled={loading}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="popular" className="ml-2 block text-sm text-gray-700">
                  Mark as Popular Service
                </label>
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
            </div>

            {/* Icon Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon URL (optional)
              </label>
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                  {service.iconUrl ? (
                    <img
                      src={service.iconUrl}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileUploadOutlined className="w-6 h-6 text-gray-400" />
                  )}
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
              {loading ? 'Updating...' : 'Update Service'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}