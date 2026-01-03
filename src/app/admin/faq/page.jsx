"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Edit, Trash2, Search, ArrowLeft } from "lucide-react";
import { ConfirmModal } from "@/components/Modal/Modal";

export default function AdminFAQPage() {
  const router = useRouter();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/faq");
      if (res.ok) {
        const data = await res.json();
        setFaqs(data);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (faq) => {
    setDeleteConfirm(faq);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    
    try {
      setIsDeleting(deleteConfirm.id);
      const res = await fetch(`/api/admin/faq/${deleteConfirm.id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        setFaqs(faqs.filter(faq => faq.id !== deleteConfirm.id));
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
    } finally {
      setIsDeleting(null);
      setDeleteConfirm(null);
    }
  };

  const filteredFaqs = faqs.filter(faq => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query)
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
            Manage FAQs
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 font-urbanist">
            Create and manage frequently asked questions
          </p>
        </div>

        {/* Actions Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/admin/faq/add")}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-urbanist font-medium cursor-pointer"
          >
            <Plus size={20} />
            Add New FAQ
          </button>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white font-urbanist focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* FAQ List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 font-urbanist">
              No FAQs found. Create your first FAQ to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-urbanist">
                        Order: {faq.order}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 font-urbanist">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-2 font-urbanist">
                      {faq.answer}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/faq/edit/${faq.id}`)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(faq)}
                      disabled={isDeleting === faq.id}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      title="Delete"
                    >
                      {isDeleting === faq.id ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <Trash2 size={20} />
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
        title="Delete FAQ"
        message={`Are you sure you want to delete "${deleteConfirm?.question}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
