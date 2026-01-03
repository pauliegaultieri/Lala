"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

export default function Modal({ isOpen, onClose, title, children, size = "md" }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white font-pp-mori">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", variant = "danger" }) {
  const variantClasses = {
    danger: "bg-red-600 hover:bg-red-700",
    primary: "bg-indigo-600 hover:bg-indigo-700",
    warning: "bg-yellow-600 hover:bg-yellow-700",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="p-6">
        <p className="text-gray-700 dark:text-gray-300 font-urbanist mb-6">
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors font-urbanist font-medium cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-white rounded-lg transition-colors font-urbanist font-medium cursor-pointer ${variantClasses[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function PromptModal({ isOpen, onClose, onSubmit, title, message, placeholder = "", defaultValue = "", inputType = "text" }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get("input");
    if (value) {
      onSubmit(value);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <form onSubmit={handleSubmit} className="p-6">
        {message && (
          <p className="text-gray-700 dark:text-gray-300 font-urbanist mb-4">
            {message}
          </p>
        )}
        <input
          type={inputType}
          name="input"
          defaultValue={defaultValue}
          placeholder={placeholder}
          autoFocus
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-urbanist focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6"
        />
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors font-urbanist font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-urbanist font-medium cursor-pointer"
          >
            Submit
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function AlertModal({ isOpen, onClose, title, message, variant = "info" }) {
  const variantClasses = {
    info: "text-indigo-600 dark:text-indigo-400",
    success: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    error: "text-red-600 dark:text-red-400",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="p-6">
        <p className={`font-urbanist mb-6 ${variantClasses[variant]}`}>
          {message}
        </p>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-urbanist font-medium cursor-pointer"
          >
            OK
          </button>
        </div>
      </div>
    </Modal>
  );
}
