"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, UserPlus, Trash2, Crown, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [admins, setAdmins] = useState([]);
  const [ownerIds, setOwnerIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newRobloxId, setNewRobloxId] = useState("");
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/admins");
      
      if (res.status === 403) {
        router.push("/unauthorized");
        return;
      }
      
      if (!res.ok) {
        throw new Error("Failed to fetch admins");
      }
      
      const data = await res.json();
      setAdmins(data.admins || []);
      setOwnerIds(data.ownerIds || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddAdmin(e) {
    e.preventDefault();
    
    if (!newRobloxId.trim()) return;
    
    try {
      setAdding(true);
      setError(null);
      
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ robloxId: newRobloxId.trim() }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to add admin");
      }
      
      setNewRobloxId("");
      fetchAdmins();
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  }

  async function handleRemoveAdmin(robloxId) {
    if (!confirm("Are you sure you want to remove this admin?")) return;
    
    try {
      setRemoving(robloxId);
      setError(null);
      
      const res = await fetch(`/api/admin/admins/${robloxId}`, {
        method: "DELETE",
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to remove admin");
      }
      
      fetchAdmins();
    } catch (err) {
      setError(err.message);
    } finally {
      setRemoving(null);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 md:px-12 py-12">
        {/* Back to Dashboard */}
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 mb-6 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-[#4F46E5] dark:hover:text-[#6366F1] transition-colors font-urbanist"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-10">
          <h1 className="text-[2.5rem] sm:text-[3rem] font-semibold text-center font-pp-mori">
            <span className="text-[#4F46E5] dark:text-[#6366F1] transition-colors duration-300">Admin</span>{" "}
            <span className="text-[#020617] dark:text-white transition-colors duration-300">Management</span>
          </h1>
          <p className="mt-3 text-center font-urbanist text-[1rem] text-[#9ca3af] dark:text-gray-400">
            Manage who has admin access to Sabrvalues. Only owners can access this page.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 dark:text-red-400 font-urbanist">{error}</p>
          </div>
        )}

        {/* Add Admin Form */}
        <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-[#E5E7EB] dark:border-slate-700 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#4F46E5]/10 dark:bg-[#4F46E5]/20">
              <UserPlus className="w-5 h-5 text-[#4F46E5]" />
            </div>
            <h2 className="text-lg font-semibold text-[#020617] dark:text-white font-pp-mori">
              Add New Admin
            </h2>
          </div>
          
          <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newRobloxId}
              onChange={(e) => setNewRobloxId(e.target.value)}
              placeholder="Enter Roblox User ID"
              className="flex-1 px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#020617] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-urbanist focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50 focus:border-[#4F46E5] transition-all"
            />
            <button
              type="submit"
              disabled={adding || !newRobloxId.trim()}
              className="px-6 py-3 rounded-xl bg-[#4F46E5] text-white font-medium font-urbanist hover:bg-[#6366F1] hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.4)] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {adding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              Add Admin
            </button>
          </form>
          
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 font-urbanist">
            Enter the Roblox User ID of the person you want to make an admin. They will have access to the admin panel.
          </p>
        </div>

        {/* Owners Section */}
        <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-[#E5E7EB] dark:border-slate-700 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-amber-500/10 dark:bg-amber-500/20">
              <Crown className="w-5 h-5 text-amber-500" />
            </div>
            <h2 className="text-lg font-semibold text-[#020617] dark:text-white font-pp-mori">
              Owners
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium font-urbanist">
              Permanent
            </span>
          </div>
          
          <div className="space-y-3">
            {ownerIds.map((ownerId) => (
              <div
                key={ownerId}
                className="flex items-center justify-between p-4 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="font-medium text-[#020617] dark:text-white font-urbanist">
                      Roblox ID: {ownerId}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-urbanist">
                      Owner (cannot be removed)
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admins Section */}
        <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-[#E5E7EB] dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#4F46E5]/10 dark:bg-[#4F46E5]/20">
              <Shield className="w-5 h-5 text-[#4F46E5]" />
            </div>
            <h2 className="text-lg font-semibold text-[#020617] dark:text-white font-pp-mori">
              Admins
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#4F46E5]/10 dark:bg-[#4F46E5]/20 text-[#4F46E5] text-xs font-medium font-urbanist">
              {admins.length} total
            </span>
          </div>
          
          {admins.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-urbanist">
                No admins added yet. Add someone using the form above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {admins.map((admin) => (
                <div
                  key={admin.robloxId}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50"
                >
                  <div className="flex items-center gap-3">
                    {admin.avatarUrl ? (
                      <img
                        src={admin.avatarUrl}
                        alt={admin.username || "Admin"}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#4F46E5]/10 dark:bg-[#4F46E5]/20 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-[#4F46E5]" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-[#020617] dark:text-white font-urbanist">
                        {admin.displayName || admin.username || `ID: ${admin.robloxId}`}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-urbanist">
                        {admin.username ? `@${admin.username}` : ""} • Roblox ID: {admin.robloxId}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleRemoveAdmin(admin.robloxId)}
                    disabled={removing === admin.robloxId}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                    title="Remove admin"
                  >
                    {removing === admin.robloxId ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
