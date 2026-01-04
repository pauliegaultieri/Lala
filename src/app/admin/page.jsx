import { requireAdmin, isOwner } from "@/lib/admin-auth";
import Link from "next/link";
import { Database, PlusCircle, List, Sparkles, Tags, HelpCircle, BookOpen, Palette, Shield, Users } from "lucide-react";

export const metadata = {
  title: "Admin Dashboard - Sabrvalues",
  description: "Admin dashboard for managing Sabrvalues content",
};

export default async function AdminPage() {
  // Check if user is authorized
  const user = await requireAdmin();
  
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 md:px-12 py-12">
        <div className="mb-10">
          <h1 className="text-[2.5rem] sm:text-[3rem] font-semibold text-center font-pp-mori">
            <span className="text-[#4F46E5] dark:text-[#6366F1] transition-colors duration-300">Admin</span>{" "}
            <span className="text-[#020617] dark:text-white transition-colors duration-300">Dashboard</span>
          </h1>
          <p className="mt-3 text-center font-urbanist text-[1rem] text-[#9ca3af] dark:text-gray-400">
            Welcome, {user.displayName}. Manage Sabrvalues content here.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brainrot Management Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-[#E5E7EB] dark:border-slate-700 transition-all duration-200 hover:border-[#4F46E5]/40 dark:hover:border-[#4F46E5]/30 hover:shadow-xl hover:shadow-indigo-500/10">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-[#4F46E5] rounded-[14px] p-3">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Brainrot Management
                    </dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        Manage Brainrots
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Link
                  href="/admin/brainrots"
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] bg-[#4F46E5] text-white text-sm font-medium font-urbanist hover:bg-[#6366F1] hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.4)] active:scale-[0.98] transition-all duration-200"
                >
                  <List className="h-4 w-4" />
                  View All
                </Link>
                <Link
                  href="/admin/brainrots/add"
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] bg-white dark:bg-slate-900 text-[#020617] dark:text-white text-sm font-medium font-urbanist border border-[#E5E7EB] dark:border-slate-700 hover:border-[#4F46E5]/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add New
                </Link>
              </div>
            </div>
          </div>

          {/* Rarities Management Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-[#E5E7EB] dark:border-slate-700 transition-all duration-200 hover:border-[#4F46E5]/40 dark:hover:border-[#4F46E5]/30 hover:shadow-xl hover:shadow-indigo-500/10">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-[#4F46E5] rounded-[14px] p-3">
                  <Palette className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Rarities
                    </dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        Manage Rarities
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Link
                  href="/admin/rarities"
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] bg-[#4F46E5] text-white text-sm font-medium font-urbanist hover:bg-[#6366F1] hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.4)] active:scale-[0.98] transition-all duration-200"
                >
                  <List className="h-4 w-4" />
                  View All
                </Link>
                <Link
                  href="/admin/rarities/add"
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] bg-white dark:bg-slate-900 text-[#020617] dark:text-white text-sm font-medium font-urbanist border border-[#E5E7EB] dark:border-slate-700 hover:border-[#4F46E5]/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add New
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-[#E5E7EB] dark:border-slate-700 transition-all duration-200 hover:border-[#4F46E5]/40 dark:hover:border-[#4F46E5]/30 hover:shadow-xl hover:shadow-indigo-500/10">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-[#4F46E5] rounded-[14px] p-3">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Mutations
                    </dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        Manage Mutations
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Link
                  href="/admin/mutations"
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] bg-[#4F46E5] text-white text-sm font-medium font-urbanist hover:bg-[#6366F1] hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.4)] active:scale-[0.98] transition-all duration-200"
                >
                  <List className="h-4 w-4" />
                  View All
                </Link>
                <Link
                  href="/admin/mutations/add"
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] bg-white dark:bg-slate-900 text-[#020617] dark:text-white text-sm font-medium font-urbanist border border-[#E5E7EB] dark:border-slate-700 hover:border-[#4F46E5]/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add New
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-[#E5E7EB] dark:border-slate-700 transition-all duration-200 hover:border-[#4F46E5]/40 dark:hover:border-[#4F46E5]/30 hover:shadow-xl hover:shadow-indigo-500/10">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-[#4F46E5] rounded-[14px] p-3">
                  <Tags className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Traits
                    </dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        Manage Traits
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Link
                  href="/admin/traits"
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] bg-[#4F46E5] text-white text-sm font-medium font-urbanist hover:bg-[#6366F1] hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.4)] active:scale-[0.98] transition-all duration-200"
                >
                  <List className="h-4 w-4" />
                  View All
                </Link>
                <Link
                  href="/admin/traits/add"
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] bg-white dark:bg-slate-900 text-[#020617] dark:text-white text-sm font-medium font-urbanist border border-[#E5E7EB] dark:border-slate-700 hover:border-[#4F46E5]/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add New
                </Link>
              </div>
            </div>
          </div>

          {/* FAQ Management Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-[#E5E7EB] dark:border-slate-700 transition-all duration-200 hover:border-[#4F46E5]/40 dark:hover:border-[#4F46E5]/30 hover:shadow-xl hover:shadow-indigo-500/10">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-[#4F46E5] rounded-[14px] p-3">
                  <HelpCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      FAQ
                    </dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        Manage FAQs
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Link
                  href="/admin/faq"
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] bg-[#4F46E5] text-white text-sm font-medium font-urbanist hover:bg-[#6366F1] hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.4)] active:scale-[0.98] transition-all duration-200"
                >
                  <List className="h-4 w-4" />
                  View All
                </Link>
                <Link
                  href="/admin/faq/add"
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] bg-white dark:bg-slate-900 text-[#020617] dark:text-white text-sm font-medium font-urbanist border border-[#E5E7EB] dark:border-slate-700 hover:border-[#4F46E5]/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add New
                </Link>
              </div>
            </div>
          </div>

          {/* Guides Management Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-[#E5E7EB] dark:border-slate-700 transition-all duration-200 hover:border-[#4F46E5]/40 dark:hover:border-[#4F46E5]/30 hover:shadow-xl hover:shadow-indigo-500/10">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-[#4F46E5] rounded-[14px] p-3">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Guides
                    </dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        Manage Guides
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Link
                  href="/admin/guides"
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] bg-[#4F46E5] text-white text-sm font-medium font-urbanist hover:bg-[#6366F1] hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.4)] active:scale-[0.98] transition-all duration-200"
                >
                  <List className="h-4 w-4" />
                  View All
                </Link>
                <Link
                  href="/admin/guides/add"
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] bg-white dark:bg-slate-900 text-[#020617] dark:text-white text-sm font-medium font-urbanist border border-[#E5E7EB] dark:border-slate-700 hover:border-[#4F46E5]/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add New
                </Link>
              </div>
            </div>
          </div>

          {/* Credits Management Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-[#E5E7EB] dark:border-slate-700 transition-all duration-200 hover:border-[#4F46E5]/40 dark:hover:border-[#4F46E5]/30 hover:shadow-xl hover:shadow-indigo-500/10">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-[#4F46E5] rounded-[14px] p-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Credits
                    </dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        Manage Credits
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-6">
                <Link
                  href="/admin/credits"
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] bg-[#4F46E5] text-white text-sm font-medium font-urbanist hover:bg-[#6366F1] hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.4)] active:scale-[0.98] transition-all duration-200 w-full"
                >
                  <Users className="h-4 w-4" />
                  Manage Credits
                </Link>
              </div>
            </div>
          </div>

          {/* Admin Management Card - Only visible to owners */}
          {user.isOwner && (
            <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-amber-200 dark:border-amber-800/50 transition-all duration-200 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-xl hover:shadow-amber-500/10">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-amber-500 rounded-[14px] p-3">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-amber-600 dark:text-amber-400 truncate flex items-center gap-2">
                        Owner Only
                      </dt>
                      <dd>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          Manage Admins
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-6">
                  <Link
                    href="/admin/admins"
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] bg-amber-500 text-white text-sm font-medium font-urbanist hover:bg-amber-600 hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(245,158,11,0.4)] active:scale-[0.98] transition-all duration-200 w-full"
                  >
                    <Shield className="h-4 w-4" />
                    Manage Admin Access
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
