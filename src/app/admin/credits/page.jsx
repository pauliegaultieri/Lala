"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Users, Plus, Trash2, Pencil, Loader2, AlertCircle, ArrowLeft, X, Link as LinkIcon, Image } from "lucide-react";
import Link from "next/link";

export default function CreditsManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCredit, setEditingCredit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    imageUrl: "",
    link: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    fetchCredits();
  }, []);

  async function fetchCredits() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/credits");
      
      if (res.status === 401) {
        router.push("/unauthorized");
        return;
      }
      
      if (!res.ok) {
        throw new Error("Failed to fetch credits");
      }
      
      const data = await res.json();
      setCredits(data.credits || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingCredit(null);
    setFormData({ name: "", title: "", imageUrl: "", link: "" });
    setShowModal(true);
  }

  function openEditModal(credit) {
    setEditingCredit(credit);
    setFormData({
      name: credit.name || "",
      title: credit.title || "",
      imageUrl: credit.imageUrl || "",
      link: credit.link || "",
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingCredit(null);
    setFormData({ name: "", title: "", imageUrl: "", link: "" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.title.trim()) {
      setError("Name and title are required");
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      const url = editingCredit 
        ? `/api/admin/credits/${editingCredit.id}`
        : "/api/admin/credits";
      
      const res = await fetch(url, {
        method: editingCredit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to save credit");
      }
      
      closeModal();
      fetchCredits();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(creditId) {
    if (!confirm("Are you sure you want to delete this credit?")) return;
    
    try {
      setDeleting(creditId);
      setError(null);
      
      const res = await fetch(`/api/admin/credits/${creditId}`, {
        method: "DELETE",
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete credit");
      }
      
      fetchCredits();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
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
            <span className="text-[#4F46E5] dark:text-[#6366F1] transition-colors duration-300">Credits</span>{" "}
            <span className="text-[#020617] dark:text-white transition-colors duration-300">Management</span>
          </h1>
          <p className="mt-3 text-center font-urbanist text-[1rem] text-[#9ca3af] dark:text-gray-400">
            Manage the credits displayed on the credits page.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 dark:text-red-400 font-urbanist">{error}</p>
          </div>
        )}

        {/* Add Credit Button */}
        <div className="mb-8">
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#4F46E5] text-white font-medium font-urbanist hover:bg-[#6366F1] hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.4)] active:scale-[0.98] transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Add Credit
          </button>
        </div>

        {/* Credits List */}
        <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-[#E5E7EB] dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-[#4F46E5]/10 dark:bg-[#4F46E5]/20">
              <Users className="w-5 h-5 text-[#4F46E5]" />
            </div>
            <h2 className="text-lg font-semibold text-[#020617] dark:text-white font-pp-mori">
              Credits
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#4F46E5]/10 dark:bg-[#4F46E5]/20 text-[#4F46E5] text-xs font-medium font-urbanist">
              {credits.length} total
            </span>
          </div>
          
          {credits.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-urbanist">
                No credits added yet. Add someone using the button above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {credits.map((credit) => (
                <div
                  key={credit.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50"
                >
                  <div className="flex items-center gap-4">
                    {credit.imageUrl ? (
                      <img
                        src={credit.imageUrl}
                        alt={credit.name}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-[#E8E8F0] dark:bg-slate-700 flex items-center justify-center">
                        <Users className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-[#020617] dark:text-white font-pp-mori">
                        {credit.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-urbanist">
                        {credit.title}
                      </p>
                      {credit.link && (
                        <a
                          href={credit.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#4F46E5] hover:underline font-urbanist flex items-center gap-1 mt-1"
                        >
                          <LinkIcon className="w-3 h-3" />
                          {credit.link.length > 40 ? credit.link.substring(0, 40) + "..." : credit.link}
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(credit)}
                      className="p-2 rounded-lg text-gray-500 hover:text-[#4F46E5] hover:bg-[#4F46E5]/10 transition-colors"
                      title="Edit credit"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(credit.id)}
                      disabled={deleting === credit.id}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                      title="Delete credit"
                    >
                      {deleting === credit.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeModal}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-[#020617] dark:text-white font-pp-mori">
                {editingCredit ? "Edit Credit" : "Add Credit"}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 font-urbanist">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#020617] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-urbanist focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50 focus:border-[#4F46E5] transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 font-urbanist">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Full Stack Developer"
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#020617] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-urbanist focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50 focus:border-[#4F46E5] transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 font-urbanist">
                  <span className="flex items-center gap-1.5">
                    <Image className="w-4 h-4" />
                    Image URL
                  </span>
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.png"
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#020617] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-urbanist focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50 focus:border-[#4F46E5] transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 font-urbanist">
                  <span className="flex items-center gap-1.5">
                    <LinkIcon className="w-4 h-4" />
                    Link
                  </span>
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://twitter.com/username"
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#020617] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-urbanist focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50 focus:border-[#4F46E5] transition-all"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-slate-700 text-[#020617] dark:text-white font-medium font-urbanist hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#4F46E5] text-white font-medium font-urbanist hover:bg-[#6366F1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  {editingCredit ? "Save Changes" : "Add Credit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
