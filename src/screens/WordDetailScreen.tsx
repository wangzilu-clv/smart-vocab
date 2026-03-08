import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Word, AccentType } from '../types';
import { getWordById } from '../data/vocabulary';
import { toggleBookmark, getBookmarks } from '../utils/storage';
import { 
  speakWord, 
  speakExample, 
  toggleAccent, 
  getAccent,
  getAccentFlag,
  getAccentDisplayName,
} from '../utils/speech';

type WordDetailScreenRouteProp = RouteProp<RootStackParamList, 'WordDetail'>;

export const WordDetailScreen: React.FC = () => {
  const route = useRoute<WordDetailScreenRouteProp>();
  const { wordId } = route.params;
  const [word, setWord] = useState<Word | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [accent, setAccent] = useState<AccentType>(getAccent());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingExample, setIsPlayingExample] = useState(false);

  useEffect(() => {
    loadWord();
  }, []);

  const loadWord = async () => {
    const wordData = getWordById(wordId);
    if (wordData) {
      setWord(wordData);
    }

    const bookmarks = await getBookmarks();
    setIsBookmarked(bookmarks.includes(wordId));
  };

  const handleToggleBookmark = async () => {
    const result = await toggleBookmark(wordId);
    setIsBookmarked(result);
  };

  const handleToggleAccent = useCallback(() => {
    const newAccent = toggleAccent();
    setAccent(newAccent);
  }, []);

  const handlePlayWord = useCallback(async () => {
    if (!word || isPlaying) return;
    setIsPlaying(true);
    try {
      await speakWord(word.word, accent);
    } finally {
      setTimeout(() => setIsPlaying(false), 500);
    }
  }, [word, accent, isPlaying]);

  const handlePlayExample = useCallback(async () => {
    if (!word || isPlayingExample) return;
    setIsPlayingExample(true);
    try {
      await speakExample(word.example, accent);
    } finally {
      setTimeout(() => setIsPlayingExample(false), 500);
    }
  }, [word, accent, isPlayingExample]);

  if (!word) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>单词未找到</Text>
      </SafeAreaView>
    );
  }

  // 根据当前发音选择显示对应的音标
  const currentPhonetic = accent === 'us' 
    ? (word.phoneticUS || word.phonetic) 
    : (word.phoneticUK || word.phonetic);
  const otherPhonetic = accent === 'us' 
    ? (word.phoneticUK || word.phonetic) 
    : (word.phoneticUS || word.phonetic);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header with Audio */}
        <View style={styles.header}>
          <Text style={styles.word}>{word.word}</Text>
          
          {/* Accent Toggle */}
          <TouchableOpacity 
            style={styles.accentToggle}
            onPress={handleToggleAccent}
          >
            <Text style={styles.accentText}>
              {getAccentFlag(accent)} {getAccentDisplayName(accent)} {accent.toUpperCase()}
            </Text>
          </TouchableOpacity>

          {/* Current Phonetic */}
          <View style={styles.phoneticRow}>
            <Text style={styles.phonetic}>{currentPhonetic}</Text>
            <TouchableOpacity
              style={[styles.playButton, isPlaying && styles.playingButton]}
              onPress={handlePlayWord}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={isPlaying ? "volume-high" : "volume-medium"} 
                size={24} 
                color="#667eea" 
              />
            </TouchableOpacity>
          </View>

          {/* Other Accent Phonetic (smaller) */}
          {otherPhonetic !== currentPhonetic && (
            <Text style={styles.phoneticSecondary}>
              {accent === 'us' ? 'UK' : 'US'}: {otherPhonetic}
            </Text>
          )}

          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={handleToggleBookmark}
          >
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={28}
              color={isBookmarked ? '#667eea' : '#666'}
            />
          </TouchableOpacity>
        </View>

        {/* Meaning */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>释义</Text>
          <Text style={styles.meaning}>{word.meaning}</Text>
          {word.meaningDetail && (
            <Text style={styles.meaningDetail}>{word.meaningDetail}</Text>
          )}
        </View>

        {/* Example with Audio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>例句</Text>
          <View style={styles.exampleCard}>
            <View style={styles.exampleHeader}>
              <Text style={styles.exampleLabel}>例句 1</Text>
              <TouchableOpacity
                style={[styles.examplePlayButton, isPlayingExample && styles.playingButton]}
                onPress={handlePlayExample}
              >
                <Ionicons 
                  name={isPlayingExample ? "volume-high" : "volume-low"} 
                  size={18} 
                  color="#667eea" 
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.example}>{word.example}</Text>
            <Text style={styles.exampleTranslation}>
              {word.exampleTranslation}
            </Text>
          </View>

          {/* Additional Examples */}
          {word.examples && word.examples.length > 0 && (
            <View style={styles.additionalExamples}>
              {word.examples.map((ex, idx) => (
                <View key={idx} style={styles.additionalExampleItem}>
                  <View style={styles.exampleHeader}>
                    <Text style={styles.exampleLabel}>例句 {idx + 2}</Text>
                  </View>
                  <Text style={styles.additionalExampleEn}>{ex.sentence}</Text>
                  <Text style={styles.additionalExampleCn}>{ex.translation}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Word Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>词汇信息</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>难度</Text>
              <View
                style={[
                  styles.difficultyBadge,
                  styles[`difficulty_${word.difficulty}`],
                ]}
              >
                <Text style={styles.difficultyText}>
                  {word.difficulty === 'easy'
                    ? '简单'
                    : word.difficulty === 'medium'
                    ? '中等'
                    : '困难'}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>分类</Text>
              <Text style={styles.infoValue}>{word.category}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>主题</Text>
              <Text style={styles.infoValue}>{word.theme}</Text>
            </View>

            {word.prefix && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>前缀</Text>
                <Text style={styles.infoValue}>{word.prefix}</Text>
              </View>
            )}

            {word.root && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>词根</Text>
                <Text style={styles.infoValue}>{word.root}</Text>
              </View>
            )}

            {word.suffix && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>后缀</Text>
                <Text style={styles.infoValue}>{word.suffix}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>标签</Text>
          <View style={styles.tagsContainer}>
            {word.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 30,
    alignItems: 'center',
    position: 'relative',
  },
  word: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333',
  },
  accentToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 10,
  },
  accentText: {
    fontSize: 13,
    color: '#667eea',
    fontWeight: '600',
  },
  phoneticRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  phonetic: {
    fontSize: 20,
    color: '#667eea',
  },
  phoneticSecondary: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playingButton: {
    backgroundColor: '#e0e8ff',
  },
  bookmarkButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    padding: 10,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 15,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 12,
  },
  meaning: {
    fontSize: 22,
    color: '#333',
    lineHeight: 30,
  },
  meaningDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  exampleCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
  },
  exampleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exampleLabel: {
    fontSize: 12,
    color: '#999',
  },
  examplePlayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  example: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  exampleTranslation: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  additionalExamples: {
    marginTop: 15,
    gap: 12,
  },
  additionalExampleItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  additionalExampleEn: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  additionalExampleCn: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  infoItem: {
    minWidth: 100,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  difficulty_easy: {
    backgroundColor: '#e8f5e9',
  },
  difficulty_medium: {
    backgroundColor: '#fff3e0',
  },
  difficulty_hard: {
    backgroundColor: '#ffebee',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  tagText: {
    color: '#1976d2',
    fontSize: 13,
  },
});
