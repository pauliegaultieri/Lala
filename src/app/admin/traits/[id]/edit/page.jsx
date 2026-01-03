"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import TraitForm from "@/components/Admin/TraitForm";

export default function EditTraitPage() {
  const params = useParams();
  const router = useRouter();

  const [trait, setTrait] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTrait() {
      if (!params?.id) {
        setError("Missing trait ID");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/admin/traits/${params.id}`);

        if (!response.ok) {
          if (response.status === 404) {
            router.push("/admin/traits");
            return;
          }
          throw new Error(`Failed to fetch trait: ${response.statusText}`);
        }

        const data = await response.json();
        setTrait(data);
      } catch (err) {
        console.error("Error fetching trait:", err);
        setError(err?.message || "Failed to load trait");
      } finally {
        setLoading(false);
      }
    }

    fetchTrait();
  }, [params?.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
          <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">Loading trait...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error Loading Trait</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <Link
                    href="/admin/traits"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Traits
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!trait) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 md:px-12 py-12">
        <div className="mb-10">
          <Link
            href="/admin/traits"
            className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Traits
          </Link>
          <h1 className="mt-3 text-[2.25rem] sm:text-[2.5rem] font-pp-mori font-semibold text-[#020617] dark:text-white">
            Edit <span className="text-[#4F46E5] dark:text-[#6366F1]">Trait</span>
          </h1>
          <p className="mt-2 text-sm font-urbanist text-gray-600 dark:text-gray-400">Update the details for {trait.name}.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 rounded-[20px] overflow-hidden transition-colors">
          <div className="p-6">
            <TraitForm initialData={trait} />
          </div>
        </div>
      </div>
    </div>
  );
}
