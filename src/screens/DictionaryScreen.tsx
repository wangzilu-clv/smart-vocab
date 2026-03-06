import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Word } from '../types';
import { getAllWords, getWordsByCategory } from '../data/vocabulary';
import { getLearnedWords } from '../utils/storage';

type DictionaryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

export const DictionaryScreen: React.FC = () => {
  const navigation = useNavigation<DictionaryScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [words, setWords] = useState<Word[]>([]);
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);
  const [learnedIds, setLearnedIds] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ['全部', '日常', '学术', '商务', '旅游', '科技'];
  const categoryMap: Record<string, string> = {
    '日常': 'daily',
    '学术': 'academic',
    '商务': 'business',
    '旅游': 'travel',
    '科技': 'technology',
  };

  useEffect(() => {
    loadWords();
  }, []);

  useEffect(() => {
    filterWords();
  }, [searchQuery, selectedCategory, words]);

  const loadWords = async () => {
    const allWords = getAllWords();
    setWords(allWords);
    setFilteredWords(allWords);

    const learned = await getLearnedWords();
    setLearnedIds(new Set(Object.keys(learned)));
  };

  const filterWords = () => {
    let result = words;

    if (selectedCategory && selectedCategory !== '全部') {
      const cat = categoryMap[selectedCategory];
      result = result.filter(w => w.category === cat);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        w =>
          w.word.toLowerCase().includes(query) ||
          w.meaning.includes(query)
      );
    }

    setFilteredWords(result);
  };

  const renderWordItem = ({ item }: { item: Word }) => {
    const isLearned = learnedIds.has(item.id);

    return (
      <TouchableOpacity
        style={styles.wordItem}
        onPress={() => navigation.navigate('WordDetail', { wordId: item.id })}
      >
        <View style={styles.wordInfo}>
          <Text style={styles.word}>{item.word}</Text>
          <Text style={styles.phonetic}>{item.phonetic}</Text>
          <Text style={styles.meaning} numberOfLines={1}>
            {item.meaning}
          </Text>
        </View>

        <View style={styles.wordMeta}>
          <View
            style={[
              styles.difficultyBadge,
              styles[`difficulty_${item.difficulty}`],
            ]}
          >
            <Text style={styles.difficultyText}>
              {item.difficulty === 'easy' ? '简' : 
               item.difficulty === 'medium' ? '中' : '难'}
            </Text>
          </View>
          
          {isLearned && (
            <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>词库</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="搜索单词或释义..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item && styles.categoryChipActive,
              ]}
              onPress={() =>
                setSelectedCategory(item === '全部' ? null : item)
              }
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === item && styles.categoryChipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <FlatList
        data={filteredWords}
        renderItem={renderWordItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.wordsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>未找到匹配的单词</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  categoriesContainer: {
    marginVertical: 10,
  },
  categoriesList: {
    paddingHorizontal: 15,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginHorizontal: 5,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  categoryChipActive: {
    backgroundColor: '#667eea',
  },
  categoryChipText: {
    color: '#666',
    fontSize: 14,
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  wordsList: {
    padding: 15,
  },
  wordItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  wordInfo: {
    flex: 1,
  },
  word: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  phonetic: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  meaning: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  wordMeta: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  difficultyBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficulty_easy: {
    backgroundColor: '#4caf50',
  },
  difficulty_medium: {
    backgroundColor: '#ff9800',
  },
  difficulty_hard: {
    backgroundColor: '#f44336',
  },
  difficultyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
});
