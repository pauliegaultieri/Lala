"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";

export default function FAQForm({ initialData = null }) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [formData, setFormData] = useState({
    question: initialData?.question || "",
    answer: initialData?.answer || "",
    order: initialData?.order || 0,
    published: initialData?.published !== undefined ? initialData.published : true,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.question.trim() || !formData.answer.trim()) {
      setError("Question and answer are required");
      return;
    }

    try {
      setIsSubmitting(true);

      const url = isEditing 
        ? `/api/admin/faq/${initialData.id}`
        : "/api/admin/faq";
      
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: formData.question,
          answer: formData.answer,
          order: parseInt(formData.order) || 0,
          published: formData.published,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save FAQ");
      }

      router.push("/admin/faq");
      router.refresh();
    } catch (err) {
      console.error("Error saving FAQ:", err);
      setError(err.message || "Failed to save FAQ");
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
            onClick={() => router.push("/admin/faq")}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 font-urbanist cursor-pointer"
          >
            <ArrowLeft size={20} />
            Back to FAQs
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-pp-mori">
            {isEditing ? "Edit FAQ" : "Add New FAQ"}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 font-urbanist">{error}</p>
            </div>
          )}

          {/* Question */}
          <div className="mb-6">
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-urbanist">
              Question *
            </label>
            <input
              type="text"
              id="question"
              name="question"
              value={formData.question}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-urbanist focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter the question"
            />
          </div>

          {/* Answer */}
          <div className="mb-6">
            <label htmlFor="answer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-urbanist">
              Answer *
            </label>
            <textarea
              id="answer"
              name="answer"
              value={formData.answer}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-urbanist focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-vertical"
              placeholder="Enter the answer"
            />
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
              Lower numbers appear first
            </p>
          </div>

          {/* Published */}
          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="published"
                checked={formData.published}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-urbanist">
                Published
              </span>
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
                <>{isEditing ? "Update FAQ" : "Create FAQ"}</>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/faq")}
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
