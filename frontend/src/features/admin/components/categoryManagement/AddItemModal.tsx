import { useState } from 'react'
import { CloseOutlined } from '@mui/icons-material'
import { AdminSidebar } from '../AdminSidebar'

interface AddItemModalProps {
  serviceName: string
  categoryName: string
  onClose: () => void
  onSubmit: (itemData: {
    name: string
    description: string
    estimatedPrice?: number
    status: string
  }) => Promise<{ success: boolean; message?: string }>
}

export function AddItemModal({
  serviceName,
  categoryName,
  onClose,
  onSubmit,
}: AddItemModalProps) {
  const [itemName, setItemName] = useState('')
  const [description, setDescription] = useState('')
  const [estimatedPrice, setEstimatedPrice] = useState('')
  const [status, setStatus] = useState('Active')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!itemName.trim()) {
      return
    }

    setLoading(true)
    try {
      const result = await onSubmit({
        name: itemName.trim(),
        description: description.trim(),
        estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : undefined,
        status,
      })

      if (result.success) {
        onClose()
      }
    } catch (error) {
      console.error('Error submitting item:', error)
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
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Add Item - {serviceName}
            </h2>
            <p className="text-sm text-gray-600 mt-1">Category: {categoryName}</p>
          </div>
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
            {/* Item Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name *
              </label>
              <input
                type="text"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Enter item name"
                disabled={loading}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Enter item description"
                disabled={loading}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200"
              />
            </div>

            {/* Estimated Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Price (optional)
              </label>
              <input
                type="number"
                value={estimatedPrice}
                onChange={(e) => setEstimatedPrice(e.target.value)}
                placeholder="0.00"
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
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
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
              disabled={loading || !itemName.trim()}
              onClick={handleSubmit}
              className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Item'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}