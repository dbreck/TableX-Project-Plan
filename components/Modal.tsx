import React from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  isLoading: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, content, isLoading }) => {
  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    alert("Copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-slate-100 dark:border-zinc-800">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-lg">
            <Sparkles size={20} />
            {title}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-zinc-400">
              <Loader2 size={40} className="animate-spin text-teal-500 mb-4" />
              <p>Consulting Gemini...</p>
            </div>
          ) : (
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
                {content}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 rounded-b-xl flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-600 rounded-lg text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700"
          >
            Close
          </button>
          <button 
             onClick={handleCopy}
             className="ml-3 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 shadow-sm"
          >
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;