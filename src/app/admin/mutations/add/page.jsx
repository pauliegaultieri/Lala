import { requireAdmin } from "@/lib/admin-auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MutationForm from "@/components/Admin/MutationForm";

export const metadata = {
  title: "Add New Mutation - Admin Dashboard",
  description: "Add a new mutation modifier to the Sabrvalues database",
};

export default async function AddMutationPage() {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 md:px-12 py-12">
        <div className="mb-10">
          <Link
            href="/admin/mutations"
            className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Mutations
          </Link>
          <h1 className="mt-3 text-[2.25rem] sm:text-[2.5rem] font-pp-mori font-semibold text-[#020617] dark:text-white">
            Add <span className="text-[#4F46E5] dark:text-[#6366F1]">Mutation</span>
          </h1>
          <p className="mt-2 text-sm font-urbanist text-gray-600 dark:text-gray-400">
            Create a new mutation entry in the database.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 rounded-[20px] overflow-hidden transition-colors">
          <div className="p-6">
            <MutationForm />
          </div>
        </div>
      </div>
    </div>
  );
}
