"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Edit, Trash2, Search, Eye, ArrowLeft } from "lucide-react";
import { ConfirmModal } from "@/components/Modal/Modal";

export default function AdminGuidesPage() {
  const router = useRouter();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/guides");
      if (res.ok) {
        const data = await res.json();
        setGuides(data);
      }
    } catch (error) {
      console.error("Error fetching guides:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (guide) => {
    setDeleteConfirm(guide);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    
    try {
      setIsDeleting(deleteConfirm.id);
      const res = await fetch(`/api/admin/guides/${deleteConfirm.id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        setGuides(guides.filter(guide => guide.id !== deleteConfirm.id));
      }
    } catch (error) {
      console.error("Error deleting guide:", error);
    } finally {
      setIsDeleting(null);
      setDeleteConfirm(null);
    }
  };

  const filteredGuides = guides.filter(guide => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      guide.title.toLowerCase().includes(query) ||
      guide.description?.toLowerCase().includes(query) ||
      guide.tag?.toLowerCase().includes(query)
    );
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return "Not published";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
            Manage Guides
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 font-urbanist">
            Create and manage comprehensive guides with rich content
          </p>
        </div>

        {/* Actions Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/admin/guides/add")}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-urbanist font-medium cursor-pointer"
          >
            <Plus size={20} />
            Create New Guide
          </button>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white font-urbanist focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Guides List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : filteredGuides.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 font-urbanist">
              No guides found. Create your first guide to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide) => (
              <div
                key={guide.id}
                className="bg-white dark:bg-slate-900 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Cover Image */}
                <div className="relative h-48 bg-gray-200 dark:bg-slate-800">
                  {guide.coverImage ? (
                    <img 
                      src={guide.coverImage} 
                      alt={guide.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                      No cover image
                    </div>
                  )}
                  
                  {/* Tag */}
                  {guide.tag && (
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-indigo-600 text-white font-urbanist">
                        {guide.tag}
                      </span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full font-urbanist ${
                      guide.published 
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}>
                      {guide.published ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 font-urbanist line-clamp-2">
                    {guide.title}
                  </h3>
                  {guide.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 font-urbanist">
                      {guide.description}
                    </p>
                  )}
                  
                  {/* Author & Date */}
                  <div className="flex items-center gap-2 mb-4 text-xs text-gray-500 dark:text-gray-400 font-urbanist">
                    {guide.author?.avatar && (
                      <img 
                        src={guide.author.avatar} 
                        alt={guide.author.displayName}
                        className="w-5 h-5 rounded-full"
                      />
                    )}
                    <span>{guide.author?.displayName || "Unknown"}</span>
                    <span>•</span>
                    <span>{formatDate(guide.publishedAt)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {guide.published && (
                      <button
                        type="button"
                        onClick={() => router.push(`/guides/${guide.slug}`)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors font-urbanist cursor-pointer"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/guides/edit/${guide.id}`)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors font-urbanist cursor-pointer"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(guide)}
                      disabled={isDeleting === guide.id}
                      className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isDeleting === guide.id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
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
        title="Delete Guide"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
