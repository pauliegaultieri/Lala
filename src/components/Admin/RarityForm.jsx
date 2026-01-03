"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Upload, X } from "lucide-react";
import { invalidateRaritiesCache } from "@/lib/rarities-cache";

export default function RarityForm({ initialData = null }) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [formData, setFormData] = useState({
    id: initialData?.id || "",
    label: initialData?.label || "",
    color: initialData?.color || "#000000",
    image: initialData?.image || "",
    order: initialData?.order || 0,
    showInForm: initialData?.showInForm !== false,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.image || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (file) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.id.trim() || !formData.label.trim() || !formData.color.trim()) {
      setError("ID, Label, and Color are required");
      return;
    }

    try {
      setIsSubmitting(true);

      const url = isEditing 
        ? `/api/admin/rarities/${initialData.id}`
        : "/api/admin/rarities";
      
      const method = isEditing ? "PUT" : "POST";

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append("label", formData.label);
      submitData.append("color", formData.color);
      submitData.append("order", parseInt(formData.order) || 0);
      submitData.append("showInForm", formData.showInForm ? "true" : "false");
      
      if (!isEditing) {
        submitData.append("id", formData.id);
      }

      // Handle image
      if (imageFile) {
        submitData.append("image", imageFile);
      } else if (formData.image) {
        // Keep existing image URL if no new file
        submitData.append("existingImageUrl", formData.image);
      }

      const res = await fetch(url, {
        method,
        body: submitData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save rarity");
      }

      invalidateRaritiesCache();
      router.push("/admin/rarities");
      router.refresh();
    } catch (err) {
      console.error("Error saving rarity:", err);
      setError(err.message || "Failed to save rarity");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push("/admin/rarities")}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 font-urbanist cursor-pointer"
          >
            <ArrowLeft size={20} />
            Back to Rarities
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-pp-mori">
            {isEditing ? "Edit Rarity" : "Add New Rarity"}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 font-urbanist">{error}</p>
            </div>
          )}

          {/* ID */}
          <div className="mb-6">
            <label htmlFor="id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-urbanist">
              ID * {isEditing && <span className="text-xs text-gray-500">(cannot be changed)</span>}
            </label>
            <input
              type="text"
              id="id"
              name="id"
              value={formData.id}
              onChange={handleChange}
              required
              disabled={isEditing}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-urbanist font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="e.g., common, rare, legendary"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-urbanist">
              Lowercase, no spaces (used as database key)
            </p>
          </div>

          {/* Label */}
          <div className="mb-6">
            <label htmlFor="label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-urbanist">
              Label *
            </label>
            <input
              type="text"
              id="label"
              name="label"
              value={formData.label}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-urbanist focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Common, Rare, Legendary"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-urbanist">
              Display name shown to users
            </p>
          </div>

          {/* Color */}
          <div className="mb-6">
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-urbanist">
              Color *
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                required
                className="h-12 w-20 border border-gray-300 dark:border-slate-700 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                required
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-urbanist font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="#000000"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-urbanist">
              Hex color code for this rarity
            </p>
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-urbanist">
              Rarity Icon <span className="text-xs text-gray-500">(optional)</span>
            </label>
            <div className="flex items-start gap-4">
              {imagePreview ? (
                <div className="relative w-full max-w-[200px] h-32 border-2 border-[#E5E7EB] dark:border-slate-700 rounded-[12px] overflow-hidden bg-white dark:bg-slate-900">
                  <img
                    src={imagePreview}
                    alt="Rarity icon preview"
                    className="w-full h-full object-contain p-2"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                      setFormData(prev => ({ ...prev, image: "" }));
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex justify-center items-center w-full max-w-[200px] h-32 border-2 border-[#E5E7EB] dark:border-slate-700 border-dashed rounded-[12px] bg-white/60 dark:bg-slate-900/30">
                  <label htmlFor="rarity-image-upload" className="cursor-pointer">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <span className="relative rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 transition-colors">
                          Upload icon
                        </span>
                      </div>
                    </div>
                    <input
                      id="rarity-image-upload"
                      name="rarity-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageChange(file);
                      }}
                      className="sr-only"
                    />
                  </label>
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 font-urbanist">
              PNG, JPG, GIF up to 5MB (recommended: 64x64px)
            </p>
          </div>

          {/* Order */}
          <div className="mb-6">
            <label htmlFor="order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-urbanist">
              Display Order
            </label>
            <input
              type="number"
              id="order"
              name="order"
              value={formData.order}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-urbanist focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-urbanist">
              Lower numbers appear first in lists
            </p>
          </div>

          {/* Show in Form */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                id="showInForm"
                name="showInForm"
                checked={formData.showInForm}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-300 dark:border-slate-700 text-indigo-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-urbanist">
                  Show on Values Page
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-urbanist">
                  Display this rarity as a category card on the values overview page
                </p>
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-urbanist font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Saving...
                </>
              ) : (
                <>{isEditing ? "Update Rarity" : "Create Rarity"}</>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/rarities")}
              className="px-6 py-3 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors font-urbanist font-medium cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
