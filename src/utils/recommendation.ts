import { Word, UserPreferences } from '../types';
import { vocabularyData, getWordsByPrefix, getWordsByTheme } from '../data/vocabulary';
import { getLearnedWords, getUserPreferences } from './storage';

export interface RecommendationScore {
  word: Word;
  score: number;
  reasons: string[];
}

export class SmartRecommendationEngine {
  private learnedWords: Record<string, Word> = {};
  private preferences: UserPreferences | null = null;

  async initialize(): Promise<void> {
    this.learnedWords = await getLearnedWords();
    this.preferences = await getUserPreferences();
  }

  // 智能推荐算法 - 综合多种因素
  async getRecommendations(count: number = 10): Promise<Word[]> {
    await this.initialize();
    
    const learnedIds = Object.keys(this.learnedWords);
    const unlearnedWords = vocabularyData.filter(w => !learnedIds.includes(w.id));
    
    if (unlearnedWords.length === 0) {
      return [];
    }

    const scoredWords: RecommendationScore[] = unlearnedWords.map(word => {
      const { score, reasons } = this.calculateScore(word);
      return { word, score, reasons };
    });

    // Sort by score descending
    scoredWords.sort((a, b) => b.score - a.score);
    
    // Take top candidates (3x count) then shuffle to ensure variety
    const topCandidates = scoredWords.slice(0, count * 3);
    
    // Shuffle using Fisher-Yates algorithm
    for (let i = topCandidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [topCandidates[i], topCandidates[j]] = [topCandidates[j], topCandidates[i]];
    }
    
    return topCandidates.slice(0, count).map(sw => sw.word);
  }

  private calculateScore(word: Word): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // 1. 词根词缀关联评分 (30%)
    const prefixScore = this.calculatePrefixScore(word);
    score += prefixScore.score * 0.3;
    if (prefixScore.reason) reasons.push(prefixScore.reason);

    // 2. 主题关联评分 (25%)
    const themeScore = this.calculateThemeScore(word);
    score += themeScore.score * 0.25;
    if (themeScore.reason) reasons.push(themeScore.reason);

    // 3. 难度递进评分 (20%)
    const difficultyScore = this.calculateDifficultyScore(word);
    score += difficultyScore.score * 0.2;
    if (difficultyScore.reason) reasons.push(difficultyScore.reason);

    // 4. 使用场景偏好评分 (15%)
    const categoryScore = this.calculateCategoryScore(word);
    score += categoryScore.score * 0.15;
    if (categoryScore.reason) reasons.push(categoryScore.reason);

    // 5. 词汇多样性评分 (10%)
    const diversityScore = this.calculateDiversityScore(word);
    score += diversityScore.score * 0.1;

    return { score, reasons };
  }

  // 词根词缀关联
  private calculatePrefixScore(word: Word): { score: number; reason?: string } {
    const learnedList = Object.values(this.learnedWords);
    let maxScore = 0;
    let matchedPrefix = '';

    if (word.prefix) {
      const prefixMatches = learnedList.filter(w => w.prefix === word.prefix);
      if (prefixMatches.length > 0) {
        maxScore = Math.min(1, prefixMatches.length * 0.3 + 0.3);
        matchedPrefix = word.prefix;
      }
    }

    if (word.root) {
      const rootMatches = learnedList.filter(w => w.root === word.root);
      if (rootMatches.length > 0) {
        const rootScore = Math.min(1, rootMatches.length * 0.3 + 0.3);
        if (rootScore > maxScore) {
          maxScore = rootScore;
        }
      }
    }

    if (maxScore > 0) {
      return {
        score: maxScore,
        reason: matchedPrefix 
          ? `词根 "${matchedPrefix}" 关联`
          : `词缀与已学单词关联`,
      };
    }

    return { score: 0.3 };
  }

  // 主题关联
  private calculateThemeScore(word: Word): { score: number; reason?: string } {
    const learnedList = Object.values(this.learnedWords);
    const sameThemeWords = learnedList.filter(w => w.theme === word.theme);
    
    if (sameThemeWords.length > 0) {
      const score = Math.min(1, sameThemeWords.length * 0.25 + 0.3);
      return {
        score,
        reason: `"${word.theme}" 主题关联`,
      };
    }

    return { score: 0.3 };
  }

  // 难度递进
  private calculateDifficultyScore(word: Word): { score: number; reason?: string } {
    const learnedList = Object.values(this.learnedWords);
    const difficultyCount = {
      easy: learnedList.filter(w => w.difficulty === 'easy').length,
      medium: learnedList.filter(w => w.difficulty === 'medium').length,
      hard: learnedList.filter(w => w.difficulty === 'hard').length,
    };

    const totalLearned = learnedList.length;
    
    if (totalLearned === 0) {
      // New users start with easy words
      return { 
        score: word.difficulty === 'easy' ? 1 : 0.3,
        reason: word.difficulty === 'easy' ? '适合初学者' : undefined,
      };
    }

    // Gradual difficulty increase
    const easyRatio = difficultyCount.easy / totalLearned;
    
    if (easyRatio < 0.5) {
      // Focus on easy words first
      return {
        score: word.difficulty === 'easy' ? 1 : word.difficulty === 'medium' ? 0.5 : 0.2,
        reason: word.difficulty === 'easy' ? '巩固基础词汇' : undefined,
      };
    } else if (difficultyCount.medium / totalLearned < 0.3) {
      // Then medium
      return {
        score: word.difficulty === 'medium' ? 1 : word.difficulty === 'easy' ? 0.6 : 0.3,
        reason: word.difficulty === 'medium' ? '难度递增' : undefined,
      };
    } else {
      // Finally hard
      return {
        score: word.difficulty === 'hard' ? 1 : 0.5,
        reason: word.difficulty === 'hard' ? '挑战高级词汇' : undefined,
      };
    }
  }

  // 使用场景偏好
  private calculateCategoryScore(word: Word): { score: number; reason?: string } {
    if (!this.preferences) {
      return { score: 0.5 };
    }

    const { preferredCategories } = this.preferences;
    
    if (preferredCategories.includes(word.category)) {
      return {
        score: 1,
        reason: `符合${this.getCategoryName(word.category)}偏好`,
      };
    }

    return { score: 0.3 };
  }

  private getCategoryName(category: string): string {
    const names: Record<string, string> = {
      business: '商务',
      travel: '旅游',
      academic: '学术',
      daily: '日常',
      technology: '科技',
    };
    return names[category] || category;
  }

  // 多样性评分 - 避免推荐同一主题的单词过多
  private calculateDiversityScore(word: Word): { score: number } {
    const learnedList = Object.values(this.learnedWords);
    const recentThemes = learnedList
      .slice(-10)
      .map(w => w.theme);
    
    const themeCount = recentThemes.filter(t => t === word.theme).length;
    
    // Lower score if same theme appears frequently in recent words
    return { score: Math.max(0.2, 1 - themeCount * 0.15) };
  }

  // 获取需要复习的单词 (基于艾宾浩斯遗忘曲线)
  async getReviewWords(): Promise<Word[]> {
    await this.initialize();
    const learnedList = Object.values(this.learnedWords);
    const now = Date.now();
    const reviewWords: Word[] = [];

    for (const word of learnedList) {
      // 跳过已掌握的单词
      if (word.mastered) continue;
      
      const reviewCount = word.reviewCount || 0;
      const lastReview = word.lastReviewAt || word.learnedAt || 0;
      const daysSinceLastReview = (now - lastReview) / (1000 * 60 * 60 * 24);

      // Spaced repetition intervals (in days): 
      // 5分钟, 30分钟, 2小时, 6小时, 1天, 2天, 4天, 7天, 15天, 30天
      const intervals = [0.0035, 0.021, 0.083, 0.25, 1, 2, 4, 7, 15, 30];
      const nextReviewInterval = intervals[Math.min(reviewCount, intervals.length - 1)];

      if (daysSinceLastReview >= nextReviewInterval) {
        reviewWords.push(word);
      }
    }

    // Sort by priority (lower mastery = higher priority, then by last review time)
    reviewWords.sort((a, b) => {
      const masteryDiff = (a.masteryLevel || 0) - (b.masteryLevel || 0);
      if (masteryDiff !== 0) return masteryDiff;
      // If mastery is same, prioritize words that haven't been reviewed longer
      const aLastReview = a.lastReviewAt || a.learnedAt || 0;
      const bLastReview = b.lastReviewAt || b.learnedAt || 0;
      return aLastReview - bLastReview;
    });
    
    return reviewWords;
  }

  // 获取最近学过的单词（用于立即复习）
  async getRecentWords(hours: number = 24): Promise<Word[]> {
    await this.initialize();
    const learnedList = Object.values(this.learnedWords);
    const now = Date.now();
    const cutoffTime = now - (hours * 60 * 60 * 1000);
    
    return learnedList
      .filter(word => (word.learnedAt || 0) > cutoffTime)
      .sort((a, b) => (b.learnedAt || 0) - (a.learnedAt || 0));
  }

  // 获取单词的下次复习时间
  getNextReviewTime(word: Word): Date | null {
    if (!word.learnedAt) return null;
    
    const reviewCount = word.reviewCount || 0;
    const lastReview = word.lastReviewAt || word.learnedAt;
    const intervals = [0.0035, 0.021, 0.083, 0.25, 1, 2, 4, 7, 15, 30]; // in days
    const nextInterval = intervals[Math.min(reviewCount, intervals.length - 1)];
    
    return new Date(lastReview + nextInterval * 24 * 60 * 60 * 1000);
  }

  // 根据特定词根获取相关单词
  async getRelatedWordsByRoot(root: string): Promise<Word[]> {
    const allWords = vocabularyData.filter(w => w.root === root || w.prefix === root);
    const learnedIds = Object.keys(this.learnedWords);
    
    return allWords.filter(w => !learnedIds.includes(w.id));
  }

  // 根据主题获取单词
  async getRelatedWordsByTheme(theme: string): Promise<Word[]> {
    const learnedIds = Object.keys(this.learnedWords);
    return vocabularyData.filter(w => w.theme === theme && !learnedIds.includes(w.id));
  }
}

export const recommendationEngine = new SmartRecommendationEngine();
