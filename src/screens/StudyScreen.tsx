import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Word } from '../types';
import { WordCard, ActionButtons, ProgressBar, QuizMode, SpellingMode } from '../components';
import { saveLearnedWord, updateWordReview, recordStudySession, addToMistakeBook } from '../utils/storage';
import { recommendationEngine } from '../utils/recommendation';
import { getAllWords } from '../data/vocabulary';

type StudyMode = 'card' | 'quiz' | 'spelling';
type ReviewRound = 1 | 2;

type StudyScreenRouteProp = RouteProp<RootStackParamList, 'Study'>;
type StudyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Study'>;

export const StudyScreen: React.FC = () => {
  const route = useRoute<StudyScreenRouteProp>();
  const navigation = useNavigation<StudyScreenNavigationProp>();
  const { mode, wordIds } = route.params;

  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyStartTime] = useState(Date.now());
  const [learnedCount, setLearnedCount] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [studyMode, setStudyMode] = useState<StudyMode>('card');
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(false);
  const [reviewRound, setReviewRound] = useState<ReviewRound>(1); // For review mode: 1 = quiz, 2 = spelling

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    if (mode === 'review') {
      // If specific wordIds provided, use them; otherwise get review words from engine
      if (wordIds && wordIds.length > 0) {
        const allWords = getAllWords();
        const selected = allWords.filter(w => wordIds.includes(w.id));
        setWords(selected);
      } else {
        const reviewWords = await recommendationEngine.getReviewWords();
        setWords(reviewWords.slice(0, 20));
      }
    } else {
      // Learn mode - use smart recommendations
      if (wordIds && wordIds.length > 0) {
        const allWords = getAllWords();
        const selected = allWords.filter(w => wordIds.includes(w.id));
        if (selected.length > 0) {
          setWords(selected);
        } else {
          // Fallback to recommendations if no matching words found
          const recommendations = await recommendationEngine.getRecommendations(20);
          setWords(recommendations);
        }
      } else {
        const recommendations = await recommendationEngine.getRecommendations(20);
        setWords(recommendations);
      }
    }
  };

  const resetWordState = () => {
    setShowAnswer(false);
    setQuizAnswered(false);
    setQuizCorrect(false);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleNextWord = async (known: boolean, isMistake: boolean = false) => {
    const currentWord = words[currentIndex];
    
    // Add to mistake book if not known or explicitly marked as mistake
    if (isMistake || !known) {
      const reason = mode === 'learn' 
        ? (showAnswer ? '不认识' : '模糊')
        : (reviewRound === 1 ? '选择题答错' : '拼写错误');
      await addToMistakeBook(currentWord, reason);
    }
    
    if (mode === 'learn') {
      // Save as learned word (already adds to review list immediately via nextReviewAt)
      await saveLearnedWord(currentWord);
      setLearnedCount(prev => prev + 1);
      
      // Initial review based on response
      await updateWordReview(currentWord.id, known);
      
      // Move to next word
      if (currentIndex < words.length - 1) {
        setCurrentIndex(prev => prev + 1);
        resetWordState();
      } else {
        finishStudySession();
      }
    } else {
      // Review mode with two rounds
      if (reviewRound === 1) {
        // First round (quiz) completed, move to second round (spelling)
        setReviewRound(2);
        setStudyMode('spelling');
        resetWordState();
      } else {
        // Second round completed, move to next word
        await updateWordReview(currentWord.id, known);
        setReviewedCount(prev => prev + 1);
        
        if (currentIndex < words.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setReviewRound(1);
          setStudyMode('card'); // Reset to card view for next word
          resetWordState();
        } else {
          finishStudySession();
        }
      }
    }
  };

  const finishStudySession = async () => {
    const studyTimeMinutes = Math.ceil((Date.now() - studyStartTime) / 60000);
    await recordStudySession(
      mode === 'learn' ? learnedCount + 1 : 0,
      studyTimeMinutes
    );
    
    Alert.alert(
      '学习完成！',
      `你${mode === 'learn' ? '学习了' : '复习了'} ${mode === 'learn' ? learnedCount + 1 : reviewedCount + 1} 个单词！`,
      [
        {
          text: '返回首页',
          onPress: () => navigation.navigate('Main'),
        },
      ]
    );
  };

  const handleQuizAnswer = (correct: boolean) => {
    setQuizAnswered(true);
    setQuizCorrect(correct);
    
    // Add to mistake book if wrong
    if (!correct) {
      addToMistakeBook(words[currentIndex], '选择题答错');
    }
  };

  const handleSpellingAnswer = (correct: boolean) => {
    setQuizAnswered(true);
    setQuizCorrect(correct);
    
    // Add to mistake book if wrong
    if (!correct) {
      addToMistakeBook(words[currentIndex], '拼写错误');
    }
  };

  const handleLearnAction = (action: 'know' | 'vague' | 'unknown') => {
    const currentWord = words[currentIndex];
    
    if (action === 'know') {
      handleNextWord(true, false);
    } else if (action === 'vague') {
      // Vague = not fully known, add to mistake book
      handleNextWord(false, true);
    } else if (action === 'unknown') {
      if (!showAnswer) {
        handleShowAnswer();
      } else {
        // Already showing answer, mark as unknown
        handleNextWord(false, true);
      }
    }
  };

  const changeStudyMode = (newMode: StudyMode) => {
    setStudyMode(newMode);
    resetWordState();
  };

  if (words.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {mode === 'review' ? '没有待复习的单词' : '暂无推荐单词'}
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentWord = words[currentIndex];
  const nextReviewTime = recommendationEngine.getNextReviewTime(currentWord);

  // Calculate progress
  const totalSteps = mode === 'learn' ? words.length : words.length * 2;
  const currentStep = mode === 'learn' 
    ? currentIndex + 1 
    : currentIndex * 2 + reviewRound;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.modeText}>
          {mode === 'learn' ? '学习新词' : `复习单词 (第${reviewRound}/2轮)`}
        </Text>
        <View style={{ width: 50 }} />
      </View>

      <ProgressBar
        current={currentStep}
        total={totalSteps}
        title={`进度 (${mode === 'learn' ? '新学习' : '复习'})`}
      />

      {/* Study Mode Selector - Only show for review mode */}
      {mode === 'review' && reviewRound === 1 && (
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeButton, studyMode === 'card' && styles.modeButtonActive]}
            onPress={() => changeStudyMode('card')}
          >
            <Ionicons name="card" size={18} color={studyMode === 'card' ? '#fff' : '#667eea'} />
            <Text style={[styles.modeButtonText, studyMode === 'card' && styles.modeButtonTextActive]}>
              卡片
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, studyMode === 'quiz' && styles.modeButtonActive]}
            onPress={() => changeStudyMode('quiz')}
          >
            <Ionicons name="help-circle" size={18} color={studyMode === 'quiz' ? '#fff' : '#667eea'} />
            <Text style={[styles.modeButtonText, studyMode === 'quiz' && styles.modeButtonTextActive]}>
              选择
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Word Display */}
        <View style={styles.wordSection}>
          <Text style={styles.wordText}>{currentWord.word}</Text>
          <Text style={styles.phoneticText}>{currentWord.phonetic}</Text>
        </View>

        {/* Study Mode Content */}
        {mode === 'learn' || (mode === 'review' && reviewRound === 1 && studyMode === 'card') ? (
          <WordCard
            word={currentWord}
            showMeaning={showAnswer}
            onFlip={showAnswer ? undefined : handleShowAnswer}
            showDetail={showAnswer}
          />
        ) : null}

        {mode === 'review' && reviewRound === 1 && studyMode === 'quiz' && (
          <QuizMode
            word={currentWord}
            onAnswer={handleQuizAnswer}
            showResult={quizAnswered}
          />
        )}

        {mode === 'review' && reviewRound === 2 && (
          <SpellingMode
            word={currentWord}
            onAnswer={handleSpellingAnswer}
            showResult={quizAnswered}
          />
        )}

        {/* Next Review Info */}
        {nextReviewTime && mode === 'review' && reviewRound === 1 && (
          <View style={styles.reviewInfoContainer}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.reviewInfoText}>
              下次复习: {formatNextReview(nextReviewTime)}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {mode === 'learn' ? (
        // Learn mode: Only card mode with Know/Vague/Unknown buttons
        <ActionButtons
          onKnow={() => handleLearnAction('know')}
          onVague={() => handleLearnAction('vague')}
          onUnknown={() => handleLearnAction('unknown')}
          showAnswer={showAnswer}
        />
      ) : (
        // Review mode
        <View style={styles.quizActions}>
          {reviewRound === 1 && studyMode === 'card' ? (
            // First round - card mode
            <ActionButtons
              onKnow={() => handleNextWord(true, false)}
              onVague={() => handleNextWord(false, true)}
              onUnknown={() => showAnswer ? handleNextWord(false, true) : handleShowAnswer()}
              showAnswer={showAnswer}
            />
          ) : reviewRound === 1 && studyMode === 'quiz' ? (
            // First round - quiz mode
            !quizAnswered ? (
              <TouchableOpacity
                style={styles.skipButton}
                onPress={() => handleNextWord(false, true)}
              >
                <Text style={styles.skipButtonText}>跳过</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.resultButtons}>
                <TouchableOpacity
                  style={[styles.resultButton, styles.wrongButton]}
                  onPress={() => handleNextWord(false, true)}
                >
                  <Ionicons name="close" size={20} color="#fff" />
                  <Text style={styles.resultButtonText}>不认识</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.resultButton, styles.correctButton]}
                  onPress={() => handleNextWord(true, false)}
                >
                  <Ionicons name="checkmark" size={20} color="#fff" />
                  <Text style={styles.resultButtonText}>认识</Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            // Second round - spelling mode
            !quizAnswered ? (
              <TouchableOpacity
                style={styles.skipButton}
                onPress={() => handleNextWord(false, true)}
              >
                <Text style={styles.skipButtonText}>跳过</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.resultButtons}>
                <TouchableOpacity
                  style={[styles.resultButton, styles.wrongButton]}
                  onPress={() => handleNextWord(false, true)}
                >
                  <Ionicons name="close" size={20} color="#fff" />
                  <Text style={styles.resultButtonText}>不认识</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.resultButton, styles.correctButton]}
                  onPress={() => handleNextWord(true, false)}
                >
                  <Ionicons name="checkmark" size={20} color="#fff" />
                  <Text style={styles.resultButtonText}>认识</Text>
                </TouchableOpacity>
              </View>
            )
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const formatNextReview = (date: Date): string => {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '马上';
  if (minutes < 60) return `${minutes}分钟后`;
  if (hours < 24) return `${hours}小时后`;
  return `${days}天后`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  backText: {
    fontSize: 16,
    color: '#667eea',
  },
  modeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 10,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#667eea',
    gap: 5,
  },
  modeButtonActive: {
    backgroundColor: '#667eea',
  },
  modeButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  wordSection: {
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 15,
  },
  wordText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  phoneticText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  reviewInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  reviewInfoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  quizActions: {
    padding: 20,
    paddingBottom: 30,
  },
  skipButton: {
    backgroundColor: '#ccc',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  resultButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  wrongButton: {
    backgroundColor: '#f44336',
  },
  correctButton: {
    backgroundColor: '#4caf50',
  },
  resultButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
