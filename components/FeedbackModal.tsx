import React, { useState } from 'react';
import { X, Star, MessageSquarePlus, Send } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, send to backend here
    setTimeout(() => {
        setSubmitted(true);
    }, 500);
  };

  const handleClose = () => {
      setSubmitted(false);
      setRating(0);
      setComment('');
      onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all scale-100">
        <div className="flex justify-between items-center p-6 border-b border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center space-x-2">
            <MessageSquarePlus className="text-blue-400" size={20} />
            <h3 className="text-lg font-bold">Your Feedback</h3>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send size={32} />
                </div>
                <h4 className="text-xl font-bold mb-2">Thank You!</h4>
                <p className="text-slate-400 mb-6">Your feedback helps us improve EduVoyager for everyone.</p>
                <button onClick={handleClose} className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-colors">
                    Close
                </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
                <div className="mb-6 text-center">
                    <p className="text-slate-400 mb-3 text-sm">How was your experience?</p>
                    <div className="flex justify-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="transition-transform hover:scale-110 focus:outline-none"
                            >
                                <Star 
                                    size={32} 
                                    className={`${(hoverRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} 
                                    strokeWidth={1.5}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Comments (Optional)</label>
                    <textarea
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none h-32"
                        placeholder="Tell us what you liked or what we can improve..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                </div>

                <div className="flex justify-end space-x-3">
                    <button 
                        type="button" 
                        onClick={handleClose}
                        className="px-4 py-2 text-slate-400 hover:text-white font-medium"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={rating === 0}
                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20"
                    >
                        Submit Feedback
                    </button>
                </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};