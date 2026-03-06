import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Word } from '../types';
import { WordCard } from '../components/WordCard';
import { ActionButtons } from '../components/ActionButtons';
import { ProgressBar } from '../components/ProgressBar';
import { saveLearnedWord, updateWordReview, recordStudySession } from '../utils/storage';
import { recommendationEngine } from '../utils/recommendation';
import { getAllWords } from '../data/vocabulary';

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

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    if (mode === 'review') {
      const reviewWords = await recommendationEngine.getReviewWords();
      setWords(reviewWords.slice(0, 20));
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

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleResponse = async (level: 'know' | 'vague' | 'unknown') => {
    const currentWord = words[currentIndex];
    
    if (mode === 'learn') {
      // Save as learned word
      await saveLearnedWord(currentWord);
      setLearnedCount(prev => prev + 1);
      
      // Initial review based on response
      if (level === 'know') {
        await updateWordReview(currentWord.id, true);
      } else if (level === 'vague') {
        await updateWordReview(currentWord.id, false);
      }
    } else {
      // Update review status
      await updateWordReview(currentWord.id, level === 'know');
      setReviewedCount(prev => prev + 1);
    }

    // Move to next word
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // Study session complete
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
    }
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.modeText}>
          {mode === 'learn' ? '学习新词' : '复习单词'}
        </Text>
        <View style={{ width: 50 }} />
      </View>

      <ProgressBar
        current={currentIndex + 1}
        total={words.length}
        title={`进度 (${mode === 'learn' ? '新学习' : '复习'})`}
      />

      <WordCard
        word={currentWord}
        showMeaning={showAnswer}
        onFlip={showAnswer ? undefined : handleShowAnswer}
        showDetail={showAnswer}
      />

      <ActionButtons
        onKnow={() => handleResponse('know')}
        onVague={() => handleResponse('vague')}
        onUnknown={() => showAnswer ? handleResponse('unknown') : handleShowAnswer()}
        showAnswer={showAnswer}
      />

      {showAnswer && currentWord.prefix && (
        <View style={styles.tipContainer}>
          <Text style={styles.tipText}>
            💡 提示: "{currentWord.prefix}" 是前缀，表示否定
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
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
  tipContainer: {
    backgroundColor: '#e3f2fd',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  tipText: {
    color: '#1976d2',
    fontSize: 13,
  },
});
