"use client";

import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  isConfirm?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function Modal({
  isOpen,
  title,
  message,
  isConfirm = false,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel"
}: ModalProps) {
  // Prevent scrolling on background when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200 border border-gray-100"
        role="dialog"
        aria-modal="true"
      >
        {title && (
          <h2 className="text-xl font-bold font-serif text-olive mb-2">{title}</h2>
        )}
        <p className="text-gray-600 mb-8 whitespace-pre-wrap">{message}</p>
        
        <div className="flex justify-end gap-3">
          {isConfirm ? (
            <>
              <button 
                onClick={onCancel}
                className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              >
                {cancelText}
              </button>
              <button 
                onClick={onConfirm}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded hover:bg-red-700 transition-colors shadow-sm"
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button 
              onClick={onConfirm}
              className="px-6 py-2 text-sm font-bold text-olive bg-gold rounded hover:bg-gold-light transition-colors shadow-sm"
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
