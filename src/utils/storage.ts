import AsyncStorage from '@react-native-async-storage/async-storage';
import { Word, LearningProgress, StudyRecord, UserPreferences, MistakeWord } from '../types';

const KEYS = {
  LEARNED_WORDS: '@smartvocab_learned_words',
  LEARNING_PROGRESS: '@smartvocab_learning_progress',
  STUDY_RECORDS: '@smartvocab_study_records',
  USER_PREFERENCES: '@smartvocab_user_preferences',
  BOOKMARKS: '@smartvocab_bookmarks',
  MISTAKE_WORDS: '@smartvocab_mistake_words',
  LAST_MISTAKE_CHECK_DATE: '@smartvocab_last_mistake_check_date',
};

// Learned Words
export const saveLearnedWord = async (word: Word): Promise<boolean> => {
  try {
    if (!word || !word.id) {
      console.error('Invalid word data provided to saveLearnedWord');
      return false;
    }
    const existing = await getLearnedWords();
    const updated = {
      ...existing,
      [word.id]: {
        ...word,
        learned: true,
        learnedAt: Date.now(),
        reviewCount: 0,
        masteryLevel: 0,
        nextReviewAt: Date.now(), // Immediately add to review list
      },
    };
    await AsyncStorage.setItem(KEYS.LEARNED_WORDS, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Error saving learned word:', error);
    return false;
  }
};

export const getLearnedWords = async (): Promise<Record<string, Word>> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.LEARNED_WORDS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting learned words:', error);
    return {};
  }
};

export const updateWordReview = async (wordId: string, mastered: boolean): Promise<boolean> => {
  try {
    if (!wordId) {
      console.error('Invalid wordId provided to updateWordReview');
      return false;
    }
    const learnedWords = await getLearnedWords();
    if (learnedWords[wordId]) {
      const word = learnedWords[wordId];
      learnedWords[wordId] = {
        ...word,
        reviewCount: (word.reviewCount || 0) + 1,
        lastReviewAt: Date.now(),
        masteryLevel: Math.min(5, Math.max(0, (word.masteryLevel || 0) + (mastered ? 1 : -0.5))),
      };
      await AsyncStorage.setItem(KEYS.LEARNED_WORDS, JSON.stringify(learnedWords));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating word review:', error);
    return false;
  }
};

// Mistake Book Functions
export const addToMistakeBook = async (word: Word, reason?: string): Promise<boolean> => {
  try {
    if (!word || !word.id) {
      console.error('Invalid word data provided to addToMistakeBook');
      return false;
    }
    const existing = await getMistakeWords();
    const mistakeWord: MistakeWord = {
      ...word,
      mistakeCount: (existing[word.id]?.mistakeCount || 0) + 1,
      lastMistakeAt: Date.now(),
      mistakeReason: reason || existing[word.id]?.mistakeReason,
      addedToReview: existing[word.id]?.addedToReview || false,
    };
    const updated = {
      ...existing,
      [word.id]: mistakeWord,
    };
    await AsyncStorage.setItem(KEYS.MISTAKE_WORDS, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Error adding to mistake book:', error);
    return false;
  }
};

export const getMistakeWords = async (): Promise<Record<string, MistakeWord>> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.MISTAKE_WORDS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting mistake words:', error);
    return {};
  }
};

export const removeFromMistakeBook = async (wordId: string): Promise<boolean> => {
  try {
    const existing = await getMistakeWords();
    delete existing[wordId];
    await AsyncStorage.setItem(KEYS.MISTAKE_WORDS, JSON.stringify(existing));
    return true;
  } catch (error) {
    console.error('Error removing from mistake book:', error);
    return false;
  }
};

export const markMistakeWordsAsReviewed = async (wordIds: string[]): Promise<boolean> => {
  try {
    const existing = await getMistakeWords();
    for (const wordId of wordIds) {
      if (existing[wordId]) {
        existing[wordId].addedToReview = true;
      }
    }
    await AsyncStorage.setItem(KEYS.MISTAKE_WORDS, JSON.stringify(existing));
    return true;
  } catch (error) {
    console.error('Error marking mistake words as reviewed:', error);
    return false;
  }
};

// Check if we need to add mistake words to review (after 12:00 AM)
export const checkAndAddMistakeWordsToReview = async (): Promise<Word[]> => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Get last check date
    const lastCheckDate = await AsyncStorage.getItem(KEYS.LAST_MISTAKE_CHECK_DATE);
    
    // If already checked today, skip
    if (lastCheckDate === today) {
      return [];
    }
    
    // Get all mistake words that haven't been added to review yet
    const mistakeWords = await getMistakeWords();
    const wordsToAdd: Word[] = [];
    const wordIdsToMark: string[] = [];
    
    for (const word of Object.values(mistakeWords)) {
      if (!word.addedToReview) {
        wordsToAdd.push(word);
        wordIdsToMark.push(word.id);
      }
    }
    
    // Mark them as added to review
    if (wordIdsToMark.length > 0) {
      await markMistakeWordsAsReviewed(wordIdsToMark);
    }
    
    // Update last check date
    await AsyncStorage.setItem(KEYS.LAST_MISTAKE_CHECK_DATE, today);
    
    return wordsToAdd;
  } catch (error) {
    console.error('Error checking and adding mistake words to review:', error);
    return [];
  }
};

// Learning Progress
export const getLearningProgress = async (): Promise<LearningProgress> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.LEARNING_PROGRESS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error getting learning progress:', error);
  }
  
  // Default progress
  return {
    totalWords: 40,
    learnedWords: 0,
    streakDays: 0,
    lastStudyDate: '',
    dailyGoal: 10,
    todayLearned: 0,
    studyTimeMinutes: 0,
  };
};

export const updateLearningProgress = async (progress: Partial<LearningProgress>): Promise<void> => {
  try {
    const current = await getLearningProgress();
    const updated = { ...current, ...progress };
    await AsyncStorage.setItem(KEYS.LEARNING_PROGRESS, JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating learning progress:', error);
  }
};

export const recordStudySession = async (wordsLearned: number, studyTimeMinutes: number): Promise<boolean> => {
  try {
    if (wordsLearned < 0 || studyTimeMinutes < 0) {
      console.error('Invalid study session data: negative values');
      return false;
    }
    
    const progress = await getLearningProgress();
    const today = new Date().toISOString().split('T')[0];
    
    let streakDays = progress.streakDays;
    const lastDate = progress.lastStudyDate;
    
    // Check streak
    if (lastDate) {
      const last = new Date(lastDate);
      const today_date = new Date(today);
      const diffDays = Math.floor((today_date.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streakDays += 1;
      } else if (diffDays > 1) {
        streakDays = 1;
      }
    } else {
      streakDays = 1;
    }
    
    const updated: LearningProgress = {
      ...progress,
      learnedWords: progress.learnedWords + wordsLearned,
      streakDays,
      lastStudyDate: today,
      todayLearned: progress.lastStudyDate === today ? progress.todayLearned + wordsLearned : wordsLearned,
      studyTimeMinutes: progress.studyTimeMinutes + studyTimeMinutes,
    };
    
    await AsyncStorage.setItem(KEYS.LEARNING_PROGRESS, JSON.stringify(updated));
    
    // Save study record
    const record: StudyRecord = {
      date: today,
      wordsLearned,
      wordsReviewed: 0,
      studyTimeMinutes,
    };
    await addStudyRecord(record);
    return true;
  } catch (error) {
    console.error('Error recording study session:', error);
    return false;
  }
};

// Study Records
export const addStudyRecord = async (record: StudyRecord): Promise<void> => {
  try {
    const existing = await getStudyRecords();
    const index = existing.findIndex(r => r.date === record.date);
    
    if (index >= 0) {
      existing[index] = {
        ...existing[index],
        wordsLearned: existing[index].wordsLearned + record.wordsLearned,
        wordsReviewed: existing[index].wordsReviewed + record.wordsReviewed,
        studyTimeMinutes: existing[index].studyTimeMinutes + record.studyTimeMinutes,
      };
    } else {
      existing.push(record);
    }
    
    await AsyncStorage.setItem(KEYS.STUDY_RECORDS, JSON.stringify(existing));
  } catch (error) {
    console.error('Error adding study record:', error);
  }
};

export const getStudyRecords = async (): Promise<StudyRecord[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.STUDY_RECORDS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting study records:', error);
    return [];
  }
};

// User Preferences
export const getUserPreferences = async (): Promise<UserPreferences> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER_PREFERENCES);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error getting user preferences:', error);
  }
  
  return {
    dailyGoal: 10,
    preferredCategories: ['daily', 'academic', 'business', 'travel'],
    difficulty: 'mixed',
    notificationEnabled: true,
  };
};

export const saveUserPreferences = async (preferences: UserPreferences): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.USER_PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving user preferences:', error);
  }
};

// Bookmarks
export const toggleBookmark = async (wordId: string): Promise<boolean> => {
  try {
    const bookmarks = await getBookmarks();
    const index = bookmarks.indexOf(wordId);
    
    if (index >= 0) {
      bookmarks.splice(index, 1);
      await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(bookmarks));
      return false;
    } else {
      bookmarks.push(wordId);
      await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(bookmarks));
      return true;
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return false;
  }
};

export const getBookmarks = async (): Promise<string[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.BOOKMARKS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    return [];
  }
};

// Clear all data (for testing)
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};
