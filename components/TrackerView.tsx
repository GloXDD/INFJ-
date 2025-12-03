import React, { useState, useEffect } from 'react';
import { Project, Milestone } from '../types';
import { Check, Circle, Trophy, Calendar, Sparkles, ChevronLeft, Trash2 } from 'lucide-react';

interface TrackerViewProps {
  project: Project;
  onToggleMilestone: (id: string) => void;
  onDelete: () => void;
  onBack: () => void;
}

// --- Zen Confetti Component ---
const ZenConfetti: React.FC = () => {
  const [particles, setParticles] = useState<Array<{ id: number; left: string; duration: string; delay: string; size: string; color: string }>>([]);

  useEffect(() => {
    const colors = ['bg-stone-200', 'bg-stone-300', 'bg-amber-100/50', 'bg-stone-400/30'];
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${Math.random() * 3 + 4}s`, // 4-7s slow fall
      delay: `${Math.random() * 5}s`,
      size: `${Math.random() * 8 + 4}px`, // 4-12px
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute rounded-full ${p.color} animate-float`}
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
            top: '-20px' 
          }}
        />
      ))}
    </div>
  );
};

// --- Milestone Row Component ---
const MilestoneRow: React.FC<{
  milestone: Milestone;
  onToggle: (id: string) => void;
}> = ({ milestone, onToggle }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const isDone = milestone.isCompleted;

  const handleClick = () => {
    if (!isDone) {
      setIsAnimating(true);
      onToggle(milestone.id);
      // Keep the animation state true for a short duration to show the sparkle
      // even after the parent state updates to 'completed'
      setTimeout(() => setIsAnimating(false), 2000);
    } else {
      // Allow unchecking without animation
      onToggle(milestone.id);
    }
  };

  return (
    <div 
        className={`group flex flex-col md:flex-row gap-6 p-8 border transition-all duration-500 relative z-10 ${
            isDone 
            ? 'border-transparent bg-stone-100/50' 
            : 'bg-white border-stone-100 hover:border-stone-300 shadow-sm'
        }`}
    >
      {/* Checkbox / Animation Area */}
      <div className="flex-shrink-0 md:pt-1">
        <button
            onClick={handleClick}
            disabled={isDone && !isAnimating} 
            className={`relative w-6 h-6 flex items-center justify-center transition-all duration-300 ${
                // If animating (just clicked) or done, handle styling
                (isDone && !isAnimating)
                ? 'bg-stone-400 border border-stone-400 cursor-default' 
                : isAnimating 
                  ? 'border-none bg-transparent' // Invisible container during animation
                  : 'border border-stone-300 hover:border-stone-600'
            }`}
        >
            {/* 1. Normal Check Mark (Static State) */}
            {isDone && !isAnimating && (
                 <Check className="w-3.5 h-3.5 text-white fade-in" />
            )}

            {/* 2. Celebration Animation (Transient State) */}
            {isAnimating && (
                <Sparkles className="w-6 h-6 text-amber-500 animate-pop-spin" />
            )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-3">
         <div className="flex justify-between items-start">
            <h3 className={`text-lg font-serif transition-colors duration-300 ${isDone ? 'text-stone-400 line-through decoration-stone-300' : 'text-stone-800'}`}>
                {milestone.title}
            </h3>
         </div>

         {/* Reward Text */}
         <div className={`flex items-center gap-3 pt-2 ${
             isDone ? 'opacity-50 grayscale' : 'opacity-100'
         }`}>
            <span className="w-4 h-px bg-stone-300"></span>
            <p className={`font-serif text-sm italic ${isDone ? 'text-stone-400' : 'text-stone-600'}`}>
                {milestone.reward}
            </p>
         </div>
         
         {!isDone && (
            <button
                onClick={handleClick}
                className="mt-4 text-xs font-medium text-stone-400 hover:text-stone-800 uppercase tracking-widest md:hidden"
            >
                Mark Complete
            </button>
         )}
      </div>
    </div>
  );
};

export const TrackerView: React.FC<TrackerViewProps> = ({ project, onToggleMilestone, onDelete, onBack }) => {
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const completedCount = project.milestones.filter(m => m.isCompleted).length;
  const totalCount = project.milestones.length;
  const progress = (completedCount / totalCount) * 100;
  const isAllComplete = completedCount === totalCount && totalCount > 0;

  const handleDeleteClick = () => {
    if (isDeleteConfirming) {
        onDelete();
    } else {
        setIsDeleteConfirming(true);
        setTimeout(() => setIsDeleteConfirming(false), 3000);
    }
  };

  return (
    <div className="w-full max-w-4xl px-6 py-12 fade-in relative">
      {/* Zen Confetti Animation - Only when all complete */}
      {isAllComplete && <ZenConfetti />}

      {/* Top Nav */}
      <div className="relative z-20 mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-1 text-stone-400 hover:text-stone-800 transition-colors text-xs uppercase tracking-widest"
        >
          <ChevronLeft className="w-4 h-4" /> 返回概览
        </button>
      </div>

      {/* Header */}
      <div className="mb-16 text-center space-y-4 relative z-10">
        <div className="flex items-center justify-center gap-2 text-stone-400 text-xs tracking-widest uppercase">
           <span>{new Date(project.startedAt).toLocaleDateString('zh-CN')}</span>
           <span className="w-px h-3 bg-stone-300"></span>
           <span>{isAllComplete ? 'COMPLETED' : 'IN PROGRESS'}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-stone-800">{project.name}</h1>
        
        <div className="pt-2">
            <button 
                onClick={handleDeleteClick}
                className={`text-xs transition-all duration-300 flex items-center justify-center gap-1 mx-auto tracking-wider ${
                    isDeleteConfirming 
                    ? 'text-red-800 font-medium scale-105' 
                    : 'text-stone-300 hover:text-red-800/60'
                }`}
            >
                {isDeleteConfirming ? (
                    <span>再次点击确认删除</span>
                ) : (
                    <>
                       <Trash2 className="w-3 h-3" />
                       <span>删除此行旅</span>
                    </>
                )}
            </button>
        </div>
      </div>

      {/* Progress Bar - Minimalist */}
      <div className="mb-16 max-w-lg mx-auto relative z-10">
        <div className="flex justify-between text-xs font-medium text-stone-500 mb-3 tracking-wide">
           <span>PROGRESS</span>
           <span>{completedCount} / {totalCount}</span>
        </div>
        <div className="h-1 w-full bg-stone-200 overflow-hidden">
          <div 
            className={`h-full bg-stone-700 transition-all duration-1000 ease-out ${isAllComplete ? 'bg-amber-600/70' : ''}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="mt-8 text-center min-h-[3rem] flex items-center justify-center">
            {isAllComplete ? (
                <div className="fade-in space-y-2">
                    <span className="block text-xl font-serif text-stone-800">
                        高山已越，此刻即是归途。
                    </span>
                    <span className="block text-xs text-stone-400 font-light tracking-widest uppercase">
                        Journey Completed
                    </span>
                </div>
            ) : (
                <span className="text-xs text-stone-400 font-light">
                    行而不辍，未来可期。
                </span>
            )}
        </div>
      </div>

      {/* Timeline/Milestone List */}
      <div className="space-y-4 max-w-2xl mx-auto relative z-10">
        {project.milestones.map((milestone) => (
            <MilestoneRow 
                key={milestone.id} 
                milestone={milestone} 
                onToggle={onToggleMilestone} 
            />
        ))}
      </div>
    </div>
  );
};