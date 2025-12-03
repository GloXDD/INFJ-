import React, { useState, useEffect } from 'react';
import { Project, Milestone, ViewState, CollectedReward } from './types';
import { SetupView } from './components/SetupView';
import { TrackerView } from './components/TrackerView';
import { DashboardView } from './components/DashboardView';
import { CelebrationModal } from './components/CelebrationModal';

const App: React.FC = () => {
  // State for Projects
  const [projects, setProjects] = useState<Project[]>(() => {
    // 1. Try to load multiple projects
    const savedProjects = localStorage.getItem('soulstep_projects');
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects);
        return parsed.map((p: any) => ({ ...p, startedAt: new Date(p.startedAt) }));
      } catch (e) {
        console.error("Failed to parse projects", e);
      }
    }

    // 2. Fallback: Migrate single project from old version
    const savedSingle = localStorage.getItem('soulstep_project');
    if (savedSingle) {
      try {
        const parsed = JSON.parse(savedSingle);
        const migratedProject: Project = {
           ...parsed, 
           id: parsed.id || crypto.randomUUID(),
           startedAt: new Date(parsed.startedAt)
        };
        return [migratedProject];
      } catch (e) {
        return [];
      }
    }
    
    return [];
  });

  // State for Treasury
  const [treasury, setTreasury] = useState<CollectedReward[]>(() => {
    const saved = localStorage.getItem('soulstep_treasury');
    if (saved) {
      try {
        return JSON.parse(saved).map((r: any) => ({ 
            ...r, 
            earnedAt: new Date(r.earnedAt),
            isUsed: r.isUsed || false,
            usedAt: r.usedAt ? new Date(r.usedAt) : undefined
        }));
      } catch(e) { return []; }
    }
    return [];
  });

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [view, setView] = useState<ViewState>('dashboard');
  const [activeCelebration, setActiveCelebration] = useState<Milestone | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('soulstep_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('soulstep_treasury', JSON.stringify(treasury));
  }, [treasury]);

  // View Routing Logic
  useEffect(() => {
    if (activeProjectId) {
      setView('tracker');
    } else if (view === 'tracker' && !activeProjectId) {
      setView('dashboard');
    }
  }, [activeProjectId]);

  const handleProjectCreated = (newProject: Project) => {
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
    setView('tracker');
  };

  const handleToggleMilestone = (milestoneId: string) => {
    if (!activeProjectId) return;

    setProjects(prevProjects => prevProjects.map(project => {
      if (project.id !== activeProjectId) return project;

      const updatedMilestones = project.milestones.map(m => {
        if (m.id === milestoneId && !m.isCompleted) {
          // Marking as COMPLETED
          const updated = { ...m, isCompleted: true, completedAt: new Date() };
          
          // Trigger celebration
          setActiveCelebration(updated);
          
          // Add to Treasury
          const newReward: CollectedReward = {
            id: crypto.randomUUID(),
            content: m.reward,
            earnedAt: new Date(),
            sourceProjectName: project.name,
            isUsed: false
          };
          setTreasury(prev => [newReward, ...prev]);

          return updated;
        } else if (m.id === milestoneId && m.isCompleted) {
          // Unmarking (Optional: Decide if we want to remove from treasury? 
          // For now, let's keep treasury as a log of "earned" moments, even if unchecked later.)
          return { ...m, isCompleted: false, completedAt: undefined };
        }
        return m;
      });

      return { ...project, milestones: updatedMilestones };
    }));
  };

  const handleDeleteProject = () => {
    if (activeProjectId) {
        setProjects(prev => prev.filter(p => p.id !== activeProjectId));
        setActiveProjectId(null);
        setView('dashboard');
    }
  };
  
  const handleDeleteFromDashboard = (id: string) => {
      setProjects(prev => prev.filter(p => p.id !== id));
  }

  const handleUseReward = (rewardId: string) => {
      setTreasury(prev => prev.map(item => {
          if (item.id === rewardId) {
              return { ...item, isUsed: true, usedAt: new Date() };
          }
          return item;
      }));
  }

  const handleCloseCelebration = () => {
    setActiveCelebration(null);
  };

  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 selection:bg-stone-200 selection:text-stone-900 flex flex-col items-center justify-center">
      
      <div className="relative z-10 w-full flex justify-center">
        {view === 'dashboard' && (
          <DashboardView 
            projects={projects}
            treasury={treasury}
            onNavigateToProject={(id) => setActiveProjectId(id)}
            onStartNew={() => setView('setup')}
            onDeleteProject={handleDeleteFromDashboard}
            onUseReward={handleUseReward}
          />
        )}

        {view === 'setup' && (
          <SetupView 
            onProjectCreated={handleProjectCreated} 
            onBack={() => setView('dashboard')}
          />
        )}

        {view === 'tracker' && activeProject && (
          <TrackerView 
            project={activeProject} 
            onToggleMilestone={handleToggleMilestone}
            onDelete={handleDeleteProject}
            onBack={() => {
                setActiveProjectId(null);
                setView('dashboard');
            }}
          />
        )}
      </div>

      {activeCelebration && (
        <CelebrationModal 
          milestone={activeCelebration} 
          onClose={handleCloseCelebration} 
        />
      )}
    </div>
  );
};

export default App;