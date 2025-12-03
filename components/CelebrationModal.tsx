import React, { useEffect, useState } from 'react';
import { Milestone } from '../types';
import { X, Gift, Sparkles } from 'lucide-react';

interface CelebrationModalProps {
  milestone: Milestone;
  onClose: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({ milestone, onClose }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#FDFBF7]/90 backdrop-blur-sm transition-opacity duration-500">
      <div 
        className={`relative w-full max-w-md bg-white border border-stone-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] p-10 transform transition-all duration-700 ${showContent ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
      >
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-300 hover:text-stone-600 transition-colors"
        >
            <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 border border-stone-100 rounded-full flex items-center justify-center bg-[#FDFBF7]">
              <Sparkles className="w-6 h-6 text-stone-400 stroke-[1]" />
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest block">
              Milestone Completed
            </span>
            <h2 className="text-2xl font-serif text-stone-800 leading-snug">
              {milestone.title}
            </h2>
          </div>

          <div className="py-8 border-t border-b border-stone-100">
             <p className="text-stone-500 italic mb-3 text-sm font-serif">你的静心时刻：</p>
             <p className="text-xl text-stone-800">
               "{milestone.reward}"
             </p>
          </div>

          <p className="text-stone-400 text-xs leading-relaxed font-light">
            不必急于赶路。此刻，只属于你。
          </p>

          <button
            onClick={onClose}
            className="w-full py-3 bg-stone-800 text-stone-50 hover:bg-stone-700 transition-colors text-xs font-medium tracking-widest uppercase"
          >
            我已收下
          </button>
        </div>
      </div>
    </div>
  );
};