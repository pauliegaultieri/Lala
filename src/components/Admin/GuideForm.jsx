"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import RichTextEditor from "./RichTextEditor";

export default function GuideForm({ initialData = null }) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    content: initialData?.content || "",
    tag: initialData?.tag || "Guide",
    coverImage: initialData?.coverImage || "",
    published: initialData?.published !== undefined ? initialData.published : false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Title and content are required");
      return;
    }

    try {
      setIsSubmitting(true);

      const url = isEditing 
        ? `/api/admin/guides/${initialData.id}`
        : "/api/admin/guides";
      
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save guide");
      }

      router.push("/admin/guides");
      router.refresh();
    } catch (err) {
      console.error("Error saving guide:", err);
      setError(err.message || "Failed to save guide");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push("/admin/guides")}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 font-urbanist cursor-pointer"
          >
            <ArrowLeft size={20} />
            Back to Guides
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-pp-mori">
            {isEditing ? "Edit Guide" : "Create New Guide"}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 font-urbanist">
            Write comprehensive guides with full formatting control
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 font-urbanist">{error}</p>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-urbanist">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-urbanist text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter guide title"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-urbanist">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-urbanist focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-vertical"
                placeholder="Brief description of the guide (shown in preview)"
              />
            </div>

            {/* Tag */}
            <div>
              <label htmlFor="tag" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-urbanist">
                Tag
              </label>
              <input
                type="text"
                id="tag"
                name="tag"
                value={formData.tag}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-urbanist focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., High Demand, Trading Tips, Beginner"
              />
            </div>

            {/* Cover Image */}
            <div>
              <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-urbanist">
                Cover Image URL
              </label>
              <input
                type="url"
                id="coverImage"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-urbanist focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://example.com/image.jpg"
              />
              {formData.coverImage && (
                <div className="mt-3">
                  <img 
                    src={formData.coverImage} 
                    alt="Cover preview" 
                    className="max-w-sm h-auto rounded-lg border border-gray-300 dark:border-slate-700"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 font-urbanist">
              Content *
            </label>
            <RichTextEditor 
              content={formData.content}
              onChange={handleContentChange}
            />
          </div>

          {/* Published Toggle */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="published"
                checked={formData.published}
                onChange={handleChange}
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-urbanist block">
                  Publish Guide
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-urbanist">
                  Make this guide visible to all users
                </span>
              </div>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 sticky bottom-4 bg-white dark:bg-slate-900 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
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
                <>{isEditing ? "Update Guide" : "Create Guide"}</>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/guides")}
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
