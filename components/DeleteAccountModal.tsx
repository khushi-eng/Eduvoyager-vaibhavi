import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setIsDeleting(true);
    // Simulate a small delay for effect
    setTimeout(() => {
        onConfirm(reason);
        setIsDeleting(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1e293b] border border-red-500/30 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-700/50 bg-red-500/5">
          <div className="flex items-center space-x-2 text-red-500">
            <AlertTriangle size={24} />
            <h3 className="text-lg font-bold">Delete Account</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
            <div className="text-slate-300 mb-6">
                <p className="font-semibold mb-2">Are you absolutely sure?</p>
                <p className="text-sm text-slate-400">
                    This action cannot be undone. This will permanently delete your account, roadmap progress, and remove your data from our servers.
                </p>
            </div>

            <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Why are you leaving? (Optional)</label>
                <textarea
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none h-24 text-sm"
                    placeholder="We're sorry to see you go. Tell us how we can improve..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                ></textarea>
            </div>

            <div className="flex justify-end space-x-3">
                <button 
                    type="button" 
                    onClick={onClose}
                    className="px-4 py-2 text-slate-400 hover:text-white font-medium transition-colors"
                >
                    Cancel
                </button>
                <button 
                    type="button" 
                    onClick={handleConfirm}
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-lg shadow-red-900/20 flex items-center"
                    disabled={isDeleting}
                >
                    {isDeleting ? 'Deleting...' : (
                        <>
                            <Trash2 size={16} className="mr-2" />
                            Delete Account
                        </>
                    )}
                </button>
            </div>
        </div>
      </motion.div>
    </div>
  );
};