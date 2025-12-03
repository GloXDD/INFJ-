export interface Milestone {
  id: string;
  title: string;
  reward: string;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface Project {
  id: string;
  name: string;
  milestones: Milestone[];
  startedAt: Date;
}

export interface CollectedReward {
  id: string;
  content: string;
  earnedAt: Date;
  sourceProjectName: string;
  isUsed?: boolean;
  usedAt?: Date;
}

export type ViewState = 'dashboard' | 'setup' | 'tracker';

export interface AISuggestion {
  milestones: {
    title: string;
    reward: string;
  }[];
}