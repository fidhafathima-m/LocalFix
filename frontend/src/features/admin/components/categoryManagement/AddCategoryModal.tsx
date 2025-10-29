import { useState } from "react";
import { CloseOutlined } from "@mui/icons-material";
import { AdminSidebar } from "../AdminSidebar";

interface AddCategoryModalProps {
  onClose: () => void;
  onSubmit: (categoryData: {
    name: string;
    description: string;
    iconUrl?: string;
  }) => Promise<{ success: boolean; message?: string }>;
}

export function AddCategoryModal({ onClose, onSubmit }: AddCategoryModalProps) {
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryName.trim() || !description.trim()) {
      return;
    }

    setLoading(true);
    try {
      const result = await onSubmit({
        name: categoryName.trim(),
        description: description.trim(),
        iconUrl: iconUrl.trim() || undefined,
      });

      if (result.success) {
        onClose();
      }
    } catch (error) {
      console.error("Error submitting category:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 text-gray-400 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <AdminSidebar activePage="Category" />
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <h2 className="text-xl font-semibold text-gray-900">
            Add New Category
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-100/50 rounded-full p-1"
          >
            <CloseOutlined className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category name"
              disabled={loading}
              className="w-full px-3 py-2.5 bg-white/80 border border-gray-300/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-200"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Enter category description (optional)"
              disabled={loading}
              className="w-full px-3 py-2.5 bg-white/80 border border-gray-300/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm resize-none transition-all duration-200"
            />
          </div>

          {/* Icon Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon URL (optional)
            </label>
            <input
              type="url"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              placeholder="https://example.com/icon.png"
              disabled={loading}
              className="w-full px-3 py-2.5 bg-white/80 border border-gray-300/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-200 disabled:opacity-50"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white/80 border border-gray-300/80 rounded-lg hover:bg-gray-50/90 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 backdrop-blur-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !categoryName.trim() || !description.trim()}
              className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600/90 hover:bg-blue-700/90 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-white/50 transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
