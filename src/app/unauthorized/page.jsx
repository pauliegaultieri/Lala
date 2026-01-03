import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-500 dark:text-red-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          
          <h1 className="text-3xl font-pp-mori font-semibold text-gray-900 dark:text-white">
            Access Denied
          </h1>
          
          <p className="text-base font-urbanist text-gray-600 dark:text-gray-300">
            You don&apos;t have permission to access this page. This area is restricted to authorized administrators only.
          </p>
        </div>
        
        <div className="pt-6">
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
