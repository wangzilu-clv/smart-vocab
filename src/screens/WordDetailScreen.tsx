import React, { useState, useEffect } from 'react';
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
import { RootStackParamList, Word } from '../types';
import { getWordById } from '../data/vocabulary';
import { toggleBookmark, getBookmarks } from '../utils/storage';

type WordDetailScreenRouteProp = RouteProp<RootStackParamList, 'WordDetail'>;

export const WordDetailScreen: React.FC = () => {
  const route = useRoute<WordDetailScreenRouteProp>();
  const { wordId } = route.params;
  const [word, setWord] = useState<Word | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

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

  if (!word) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>单词未找到</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.word}>{word.word}</Text>
          <Text style={styles.phonetic}>{word.phonetic}</Text>

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
        </View>

        {/* Example */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>例句</Text>
          <View style={styles.exampleCard}>
            <Text style={styles.example}>{word.example}</Text>
            <Text style={styles.exampleTranslation}>
              {word.exampleTranslation}
            </Text>
          </View>
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
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  phonetic: {
    fontSize: 18,
    color: '#666',
    marginTop: 8,
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
    fontSize: 20,
    color: '#333',
    lineHeight: 28,
  },
  exampleCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
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
