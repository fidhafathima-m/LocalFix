import { useState } from "react";
import { CloseOutlined } from "@mui/icons-material";
import toast from "react-hot-toast";

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

  // Character limits
  const NAME_MAX_LENGTH = 50;
  const DESCRIPTION_MAX_LENGTH = 200;
  const ICON_URL_MAX_LENGTH = 500;

  // Character count calculations
  const nameCharCount = categoryName.length;
  const descriptionCharCount = description.length;
  const iconUrlCharCount = iconUrl.length;

  // Validation states
  const isNameValid =
    categoryName.trim().length > 0 && nameCharCount <= NAME_MAX_LENGTH;
  const isDescriptionValid =
    description.trim().length > 0 &&
    descriptionCharCount <= DESCRIPTION_MAX_LENGTH;
  const isIconUrlValid =
    iconUrl.length === 0 ||
    (iconUrl.trim().length > 0 && iconUrlCharCount <= ICON_URL_MAX_LENGTH);

  const isFormValid = isNameValid && isDescriptionValid && isIconUrlValid;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= NAME_MAX_LENGTH) {
      setCategoryName(value);
    }
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    if (value.length <= DESCRIPTION_MAX_LENGTH) {
      setDescription(value);
    }
  };

  const handleIconUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= ICON_URL_MAX_LENGTH) {
      setIconUrl(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
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
      } else {
        // Show error message from backend
        toast.error(result.message || "Failed to create category");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error submitting category:", error);

      // Extract and display the actual error message
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create category. Please try again.";

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get character count color
  const getCharCountColor = (current: number, max: number) => {
    if (current === 0) return "text-gray-400";
    if (current > max * 0.9) return "text-red-500";
    if (current > max * 0.75) return "text-yellow-500";
    return "text-gray-500";
  };

  return (
    <div className="fixed inset-0 text-gray-400 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Category Name *
              </label>
              <span
                className={`text-xs ${getCharCountColor(
                  nameCharCount,
                  NAME_MAX_LENGTH
                )}`}
              >
                {nameCharCount}/{NAME_MAX_LENGTH}
              </span>
            </div>
            <input
              type="text"
              required
              value={categoryName}
              onChange={handleNameChange}
              placeholder="Enter category name"
              disabled={loading}
              className={`w-full px-3 py-2.5 bg-white/80 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm transition-all duration-200 ${
                !isNameValid && nameCharCount > 0
                  ? "border-red-300 focus:border-red-500/50 focus:ring-red-500/50"
                  : "border-gray-300/80 focus:border-blue-500/50"
              }`}
            />
            {!isNameValid && nameCharCount > 0 && (
              <p className="text-red-500 text-xs mt-1">
                {nameCharCount === 0
                  ? "Category name is required"
                  : `Category name must be ${NAME_MAX_LENGTH} characters or less`}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <span
                className={`text-xs ${getCharCountColor(
                  descriptionCharCount,
                  DESCRIPTION_MAX_LENGTH
                )}`}
              >
                {descriptionCharCount}/{DESCRIPTION_MAX_LENGTH}
              </span>
            </div>
            <textarea
              value={description}
              onChange={handleDescriptionChange}
              rows={3}
              placeholder="Enter category description"
              disabled={loading}
              className={`w-full px-3 py-2.5 bg-white/80 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm resize-none transition-all duration-200 ${
                !isDescriptionValid && descriptionCharCount > 0
                  ? "border-red-300 focus:border-red-500/50 focus:ring-red-500/50"
                  : "border-gray-300/80 focus:border-blue-500/50"
              }`}
            />
            {!isDescriptionValid && descriptionCharCount > 0 && (
              <p className="text-red-500 text-xs mt-1">
                {descriptionCharCount === 0
                  ? "Description is required"
                  : `Description must be ${DESCRIPTION_MAX_LENGTH} characters or less`}
              </p>
            )}
          </div>

          {/* Icon Upload */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Icon URL (optional)
              </label>
              <span
                className={`text-xs ${getCharCountColor(
                  iconUrlCharCount,
                  ICON_URL_MAX_LENGTH
                )}`}
              >
                {iconUrlCharCount}/{ICON_URL_MAX_LENGTH}
              </span>
            </div>
            <input
              type="url"
              value={iconUrl}
              onChange={handleIconUrlChange}
              placeholder="https://example.com/icon.png"
              disabled={loading}
              className={`w-full px-3 py-2.5 bg-white/80 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm transition-all duration-200 ${
                !isIconUrlValid && iconUrlCharCount > 0
                  ? "border-red-300 focus:border-red-500/50 focus:ring-red-500/50"
                  : "border-gray-300/80 focus:border-blue-500/50"
              }`}
            />
            {!isIconUrlValid && iconUrlCharCount > 0 && (
              <p className="text-red-500 text-xs mt-1">
                Icon URL must be {ICON_URL_MAX_LENGTH} characters or less
              </p>
            )}
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
              disabled={loading || !isFormValid}
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
