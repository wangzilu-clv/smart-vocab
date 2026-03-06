export interface Word {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  theme: string;
  prefix?: string;
  suffix?: string;
  root?: string;
  category: 'business' | 'travel' | 'academic' | 'daily' | 'technology';
  learned?: boolean;
  learnedAt?: number;
  reviewCount?: number;
  lastReviewAt?: number;
  masteryLevel?: number; // 0-5
}

export interface LearningProgress {
  totalWords: number;
  learnedWords: number;
  streakDays: number;
  lastStudyDate: string;
  dailyGoal: number;
  todayLearned: number;
  studyTimeMinutes: number;
}

export interface StudyRecord {
  date: string;
  wordsLearned: number;
  wordsReviewed: number;
  studyTimeMinutes: number;
}

export interface UserPreferences {
  dailyGoal: number;
  preferredCategories: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  notificationEnabled: boolean;
}

export type RootStackParamList = {
  Main: undefined;
  Study: { mode: 'learn' | 'review'; wordIds?: string[] };
  WordDetail: { wordId: string };
  Settings: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Dictionary: undefined;
  Statistics: undefined;
  Profile: undefined;
};
