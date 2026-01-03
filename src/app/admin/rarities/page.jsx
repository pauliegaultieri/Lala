"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Edit, Trash2, Search, ArrowLeft } from "lucide-react";
import { ConfirmModal } from "@/components/Modal/Modal";
import { invalidateRaritiesCache } from "@/lib/rarities-cache";

export default function AdminRaritiesPage() {
  const router = useRouter();
  const [rarities, setRarities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchRarities();
  }, []);

  const fetchRarities = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/rarities");
      if (res.ok) {
        const data = await res.json();
        setRarities(data);
      }
    } catch (error) {
      console.error("Error fetching rarities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (rarity) => {
    setDeleteConfirm(rarity);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    
    try {
      setIsDeleting(deleteConfirm.id);
      const res = await fetch(`/api/admin/rarities/${deleteConfirm.id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        setRarities(rarities.filter(rarity => rarity.id !== deleteConfirm.id));
        invalidateRaritiesCache();
      }
    } catch (error) {
      console.error("Error deleting rarity:", error);
    } finally {
      setIsDeleting(null);
      setDeleteConfirm(null);
    }
  };

  const filteredRarities = rarities.filter(rarity => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      rarity.id.toLowerCase().includes(query) ||
      rarity.label.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 font-urbanist transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-pp-mori">
            Manage Rarities
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 font-urbanist">
            Create and manage brainrot rarity types
          </p>
        </div>

        {/* Actions Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/admin/rarities/add")}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-urbanist font-medium cursor-pointer"
          >
            <Plus size={20} />
            Add New Rarity
          </button>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search rarities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white font-urbanist focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Rarities List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : filteredRarities.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 font-urbanist">
              No rarities found. Create your first rarity to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRarities.map((rarity) => (
              <div
                key={rarity.id}
                className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-slate-700"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {rarity.image && (
                        <img 
                          src={rarity.image} 
                          alt={rarity.label}
                          className="w-8 h-8 object-contain"
                        />
                      )}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-urbanist">
                        {rarity.label}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-urbanist">
                      <span className="font-mono bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">
                        {rarity.id}
                      </span>
                      <span>•</span>
                      <span>Order: {rarity.order}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div 
                        className="w-full h-8 rounded"
                        style={{ backgroundColor: rarity.color }}
                      />
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                        {rarity.color}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => router.push(`/admin/rarities/edit/${rarity.id}`)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors font-urbanist cursor-pointer"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(rarity)}
                    disabled={isDeleting === rarity.id}
                    className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isDeleting === rarity.id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Rarity"
        message={`Are you sure you want to delete "${deleteConfirm?.label}" (${deleteConfirm?.id})? This action cannot be undone and may affect existing brainrots.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
