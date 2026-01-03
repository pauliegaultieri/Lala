"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function MutationForm({ initialData = null }) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const initialGradient = initialData?.gradient || null;

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    color: initialData?.color || "#4F46E5",
    hasGradient: Boolean(initialGradient?.from && initialGradient?.to) || Boolean(initialGradient?.colors),
    gradientFrom: initialGradient?.from || "#4F46E5",
    gradientTo: initialGradient?.to || "#6366F1",
    gradientAngle: Number.isFinite(Number(initialGradient?.angle)) ? Number(initialGradient.angle) : 90,
    multiplier: initialData?.multiplier ?? 1,
    isActive: initialData?.isActive ?? true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const name = String(formData.name || "").trim();
      const color = String(formData.color || "").trim();
      const multiplier = Number(formData.multiplier);
      const hasGradient = Boolean(formData.hasGradient);
      const gradientFrom = String(formData.gradientFrom || "").trim();
      const gradientTo = String(formData.gradientTo || "").trim();
      const gradientAngle = Number(formData.gradientAngle);

      if (!name) throw new Error("Name is required");
      if (!color) throw new Error("Color is required");
      if (hasGradient && (!gradientFrom || !gradientTo)) throw new Error("Gradient colors are required");
      if (!Number.isFinite(multiplier) || multiplier <= 0) {
        throw new Error("Multiplier must be a positive number");
      }

      const url = isEditing ? `/api/admin/mutations/${initialData.id}` : "/api/admin/mutations";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          color,
          gradient: hasGradient
            ? {
                from: gradientFrom,
                to: gradientTo,
                angle: Number.isFinite(gradientAngle) ? gradientAngle : 90,
              }
            : null,
          multiplier,
          isActive: Boolean(formData.isActive),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save mutation");
      }

      router.push("/admin/mutations");
      router.refresh();
    } catch (err) {
      setError(err?.message || "Failed to save mutation");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Name *
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 rounded-[10px] border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-urbanist text-[#020617] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-colors"
              placeholder="Mutation name"
            />
          </div>
        </div>

        <div className="sm:col-span-6">
          <div className="flex items-center">
            <input
              id="hasGradient"
              name="hasGradient"
              type="checkbox"
              checked={Boolean(formData.hasGradient)}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-slate-700 rounded transition-colors"
            />
            <label htmlFor="hasGradient" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Use gradient
            </label>
          </div>
        </div>

        {formData.hasGradient ? (
          <>
            <div className="sm:col-span-3">
              <label htmlFor="gradientFrom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Gradient From *
              </label>
              <div className="mt-1 flex items-center gap-3">
                <input
                  type="color"
                  name="gradientFrom"
                  id="gradientFrom"
                  value={formData.gradientFrom}
                  onChange={handleChange}
                  className="h-10 w-12 rounded-[10px] border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <input
                  type="text"
                  name="gradientFrom"
                  value={formData.gradientFrom}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 rounded-[10px] border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-urbanist text-[#020617] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-colors"
                  placeholder="#4F46E5"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="gradientTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Gradient To *
              </label>
              <div className="mt-1 flex items-center gap-3">
                <input
                  type="color"
                  name="gradientTo"
                  id="gradientTo"
                  value={formData.gradientTo}
                  onChange={handleChange}
                  className="h-10 w-12 rounded-[10px] border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <input
                  type="text"
                  name="gradientTo"
                  value={formData.gradientTo}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 rounded-[10px] border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-urbanist text-[#020617] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-colors"
                  placeholder="#6366F1"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="gradientAngle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Gradient Angle
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="gradientAngle"
                  id="gradientAngle"
                  value={formData.gradientAngle}
                  onChange={handleChange}
                  step="1"
                  className="block w-full px-3 py-2 rounded-[10px] border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-urbanist text-[#020617] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-colors"
                />
              </div>
            </div>
          </>
        ) : null}

        <div className="sm:col-span-2">
          <label htmlFor="multiplier" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Multiplier *
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="multiplier"
              id="multiplier"
              value={formData.multiplier}
              onChange={handleChange}
              required
              step="any"
              min="0"
              className="block w-full px-3 py-2 rounded-[10px] border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-urbanist text-[#020617] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-colors"
            />
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Color *
          </label>
          <div className="mt-1 flex items-center gap-3">
            <input
              type="color"
              name="color"
              id="color"
              value={formData.color}
              onChange={handleChange}
              className="h-10 w-12 rounded-[10px] border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900"
            />
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="block w-full px-3 py-2 rounded-[10px] border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-urbanist text-[#020617] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-colors"
              placeholder="#4F46E5"
            />
          </div>
        </div>

        <div className="sm:col-span-6">
          <div className="flex items-center">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              checked={Boolean(formData.isActive)}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-slate-700 rounded transition-colors"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Active
            </label>
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="ml-3 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[10px] bg-[#4F46E5] text-white text-sm font-medium font-urbanist hover:bg-[#6366F1] hover:shadow-[0_4px_12px_rgba(79,70,229,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{isEditing ? "Update Mutation" : "Create Mutation"}</>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
