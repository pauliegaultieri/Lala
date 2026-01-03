import { requireAdmin } from "@/lib/admin-auth";
import { adminDb } from "@/lib/firebase-admin";
import Link from "next/link";
import { PlusCircle, ArrowLeft } from "lucide-react";
import BrainrotsAdminList from "@/components/Admin/BrainrotsAdminList";

export const metadata = {
  title: "Manage Brainrots - Admin Dashboard",
  description: "Manage brainrot items in the Sabrvalues database",
};

export default async function BrainrotsAdminPage() {
  // Check if user is authorized
  await requireAdmin();
  
  // Fetch all brainrots
  const snapshot = await adminDb.collection("brainrots").orderBy("name").get();
  const brainrots = snapshot.docs.map((doc) => {
    const data = doc.data();
    const plain = JSON.parse(JSON.stringify(data));
    return {
      id: doc.id,
      ...plain,
    };
  });
  
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 md:px-12 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
          <div>
            <Link 
              href="/admin"
              className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="mt-3 text-[2.25rem] sm:text-[2.5rem] font-pp-mori font-semibold text-[#020617] dark:text-white">
              Manage <span className="text-[#4F46E5] dark:text-[#6366F1]">Brainrots</span>
            </h1>
          </div>
          
          <Link
            href="/admin/brainrots/add"
            className="flex items-center gap-2 px-6 py-3 rounded-[10px] bg-[#4F46E5] text-white text-sm font-medium font-urbanist hover:bg-[#6366F1] hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.4)] active:scale-[0.98] transition-all duration-200"
          >
            <PlusCircle className="h-4 w-4" />
            Add New Brainrot
          </Link>
        </div>
        
        <BrainrotsAdminList brainrots={brainrots} />
      </div>
    </div>
  );
}
