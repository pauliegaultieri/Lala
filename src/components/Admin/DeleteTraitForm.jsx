"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function DeleteTraitForm({ trait }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/traits/${trait.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete trait");
      }

      router.push("/admin/traits");
      router.refresh();
    } catch (err) {
      setError(err?.message || "Failed to delete trait");
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
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

      <div className="bg-red-50 dark:bg-red-900/30 rounded-[16px] p-4 border border-red-200/60 dark:border-red-800/40">
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
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Warning</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              <p>You are about to permanently delete this trait. This action cannot be undone.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 rounded-[16px] overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Trait Details</h3>
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">{trait.name}</h4>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: trait.color, color: "white" }}
                  >
                    {trait.multiplier}x
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {trait.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <Link
            href="/admin/traits"
            className="inline-flex items-center justify-center px-6 py-3 rounded-[10px] bg-white dark:bg-slate-900 text-[#020617] dark:text-white text-sm font-medium font-urbanist border border-[#E5E7EB] dark:border-slate-700 hover:border-[#4F46E5]/50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="ml-3 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[10px] text-white text-sm font-medium font-urbanist bg-red-500 hover:bg-red-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isDeleting ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Deleting...
              </>
            ) : (
              "Delete Trait"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
