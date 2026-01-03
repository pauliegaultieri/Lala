import { requireAdmin } from "@/lib/admin-auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BrainrotForm from "@/components/Admin/BrainrotForm";

export const metadata = {
  title: "Add New Brainrot - Admin Dashboard",
  description: "Add a new brainrot to the Sabrvalues database",
};

export default async function AddBrainrotPage() {
  // Check if user is authorized
  await requireAdmin();
  
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link 
            href="/admin/brainrots"
            className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Brainrots
          </Link>
          <h1 className="mt-2 text-3xl font-pp-mori font-semibold text-gray-900 dark:text-white">
            Add New Brainrot
          </h1>
          <p className="mt-2 text-sm font-urbanist text-gray-600 dark:text-gray-400">
            Create a new brainrot entry in the database.
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 shadow overflow-hidden sm:rounded-lg border border-gray-200 dark:border-slate-700 transition-colors">
          <div className="px-4 py-6 sm:p-8">
            <BrainrotForm />
          </div>
        </div>
      </div>
    </div>
  );
}
