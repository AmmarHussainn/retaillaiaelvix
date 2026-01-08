import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import Button from './Button';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
                {isDestructive && (
                    <div className="bg-red-50 p-2 rounded-full text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                )}
                <h3 id="modal-title" className="text-lg font-semibold text-gray-900">
                    {title}
                </h3>
            </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors p-1 rounded-md hover:bg-gray-100"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-500 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 bg-gray-50/50 border-t border-gray-100">
          <div className="w-full sm:w-auto">
             <Button 
                variant="secondary" 
                onClick={onClose}
                disabled={isLoading}
                className="w-full sm:w-auto"
            >
                {cancelText}
             </Button>
          </div>
          <div className="w-full sm:w-auto">
            <Button
                variant={isDestructive ? 'primary' : 'primary'} // Keep primary structure but override color
                className={`w-full sm:w-auto ${isDestructive ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
                onClick={onConfirm}
                isLoading={isLoading}
            >
                {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
