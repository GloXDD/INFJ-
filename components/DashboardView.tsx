import React from 'react';
import { Project, CollectedReward } from '../types';
import { Plus, ArrowRight, Trophy, Calendar, Sparkles, ScrollText, Trash2, CheckCircle2 } from 'lucide-react';

interface DashboardViewProps {
  projects: Project[];
  treasury: CollectedReward[];
  onNavigateToProject: (projectId: string) => void;
  onStartNew: () => void;
  onDeleteProject: (projectId: string) => void;
  onUseReward: (rewardId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  projects, 
  treasury, 
  onNavigateToProject, 
  onStartNew,
  onDeleteProject,
  onUseReward
}) => {
  return (
    <div className="w-full max-w-4xl px-6 py-12 fade-in space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-serif text-stone-800 tracking-tight">旅程概览</h1>
        <p className="text-stone-500 font-light tracking-wide text-sm">
          定序方寸地， 理清万里途
        </p>
      </div>

      {/* Projects Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-2">
           <h3 className="text-lg font-serif text-stone-700 flex items-center gap-2">
             <ScrollText className="w-4 h-4" /> 进行中
           </h3>
           <button 
             onClick={onStartNew}
             className="text-xs font-medium text-stone-500 hover:text-stone-800 flex items-center gap-1 transition-colors uppercase tracking-wider"
           >
             <Plus className="w-3 h-3" /> 新旅程
           </button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-stone-200 rounded-sm">
             <p className="text-stone-400 font-serif italic mb-4">暂无行旅，何不即刻启程？</p>
             <button
               onClick={onStartNew}
               className="px-6 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-sm text-sm transition-colors"
             >
               开始探索
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => {
              const completedCount = project.milestones.filter(m => m.isCompleted).length;
              const totalCount = project.milestones.length;
              const percent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
              const isDone = completedCount === totalCount && totalCount > 0;

              return (
                <div 
                  key={project.id} 
                  className="group relative bg-white border border-stone-100 hover:border-stone-300 p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                  onClick={() => onNavigateToProject(project.id)}
                >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4 text-stone-400" />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                        {new Date(project.startedAt).toLocaleDateString('zh-CN')}
                      </span>
                      <h4 className={`text-xl font-serif mt-1 ${isDone ? 'text-stone-400 line-through decoration-stone-200' : 'text-stone-800'}`}>
                        {project.name}
                      </h4>
                    </div>

                    <div className="space-y-2">
                       <div className="flex justify-between text-xs text-stone-400">
                         <span>进度</span>
                         <span>{completedCount} / {totalCount}</span>
                       </div>
                       <div className="h-1 w-full bg-stone-100 overflow-hidden rounded-full">
                          <div 
                            className={`h-full transition-all duration-500 ${isDone ? 'bg-amber-500' : 'bg-stone-600'}`}
                            style={{ width: `${percent}%` }}
                          ></div>
                       </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Treasury Section */}
      <div className="space-y-6 pt-8 border-t border-stone-100">
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
           <Trophy className="w-4 h-4 text-amber-600/70" />
           <h3 className="text-lg font-serif text-stone-700">奖励宝库</h3>
        </div>

        {treasury.length === 0 ? (
          <p className="text-sm text-stone-400 font-light">
            当你完成里程碑时，这里将收藏你的每一份“微型节日”。
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {treasury.map((item) => {
              const isUsed = item.isUsed;
              return (
                <div 
                  key={item.id} 
                  className={`group relative p-4 border rounded-sm flex flex-col gap-2 transition-all duration-500 ${
                      isUsed 
                      ? 'bg-stone-50 border-stone-100 opacity-60 grayscale' 
                      : 'bg-[#FAF9F6] border-stone-100 hover:border-amber-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                     <Sparkles className={`w-3 h-3 shrink-0 mt-1 transition-colors ${isUsed ? 'text-stone-300' : 'text-amber-400'}`} />
                     <span className="text-[10px] text-stone-300 font-mono">
                       {new Date(item.earnedAt).toLocaleDateString()}
                     </span>
                  </div>
                  
                  <p className={`text-sm font-serif italic ${isUsed ? 'text-stone-400 line-through decoration-stone-300' : 'text-stone-700'}`}>
                    "{item.content}"
                  </p>
                  
                  <div className="mt-auto pt-2 border-t border-stone-200/50 flex items-center justify-between">
                    <p className="text-[10px] text-stone-400 truncate max-w-[60%]">
                      {item.sourceProjectName}
                    </p>
                    {isUsed ? (
                        <span className="text-[10px] text-stone-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> 已兑现
                        </span>
                    ) : (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onUseReward(item.id);
                            }}
                            className="text-[10px] text-amber-600 hover:text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                        >
                            兑现
                        </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};