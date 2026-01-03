import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link 
            href="/admin/brainrots"
            className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Brainrots
          </Link>
          <h1 className="mt-2 text-3xl font-pp-mori font-semibold text-gray-900 dark:text-white">
            Brainrot Not Found
          </h1>
          <p className="mt-2 text-sm font-urbanist text-gray-600 dark:text-gray-400">
            The brainrot you're looking for doesn't exist or has been removed.
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 shadow overflow-hidden sm:rounded-lg border border-gray-200 dark:border-slate-700 transition-colors">
          <div className="px-4 py-5 sm:p-6 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No brainrot found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              The brainrot you're looking for may have been deleted or never existed.
            </p>
            <div className="mt-6">
              <Link
                href="/admin/brainrots/add"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Create New Brainrot
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
