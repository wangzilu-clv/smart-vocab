import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, MistakeWord } from '../types';
import { getMistakeWords, removeFromMistakeBook, checkAndAddMistakeWordsToReview } from '../utils/storage';

type MistakeBookScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MistakeBook'>;

export const MistakeBookScreen: React.FC = () => {
  const navigation = useNavigation<MistakeBookScreenNavigationProp>();
  const [mistakeWords, setMistakeWords] = useState<MistakeWord[]>([]);
  const [selectedWord, setSelectedWord] = useState<MistakeWord | null>(null);
  const [addedCount, setAddedCount] = useState(0);

  const loadMistakeWords = useCallback(async () => {
    const words = await getMistakeWords();
    const wordList = Object.values(words).sort((a, b) => 
      (b.lastMistakeAt || 0) - (a.lastMistakeAt || 0)
    );
    setMistakeWords(wordList);
  }, []);

  useEffect(() => {
    loadMistakeWords();
  }, [loadMistakeWords]);

  // Check for mistake words to add to review on mount
  useEffect(() => {
    const checkMistakeWords = async () => {
      const addedWords = await checkAndAddMistakeWordsToReview();
      if (addedWords.length > 0) {
        setAddedCount(addedWords.length);
        Alert.alert(
          '错词已加入复习',
          `${addedWords.length} 个错词已自动加入今天的复习列表`,
          [{ text: '知道了', onPress: () => loadMistakeWords() }]
        );
      }
    };
    checkMistakeWords();
  }, [loadMistakeWords]);

  const handleRemoveWord = (word: MistakeWord) => {
    Alert.alert(
      '移除错词',
      `确定将 "${word.word}" 从错词本中移除吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '移除',
          style: 'destructive',
          onPress: async () => {
            await removeFromMistakeBook(word.id);
            loadMistakeWords();
            if (selectedWord?.id === word.id) {
              setSelectedWord(null);
            }
          },
        },
      ]
    );
  };

  const handleStudyMistakeWords = () => {
    if (mistakeWords.length === 0) {
      Alert.alert('暂无错词', '你还没有添加任何错词到错词本');
      return;
    }
    const wordIds = mistakeWords.map(w => w.id);
    navigation.navigate('Study', { mode: 'review', wordIds });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderWordItem = ({ item }: { item: MistakeWord }) => (
    <TouchableOpacity
      style={[
        styles.wordItem,
        selectedWord?.id === item.id && styles.wordItemSelected,
      ]}
      onPress={() => setSelectedWord(selectedWord?.id === item.id ? null : item)}
    >
      <View style={styles.wordHeader}>
        <Text style={styles.wordText}>{item.word}</Text>
        <Text style={styles.phoneticText}>{item.phonetic}</Text>
      </View>
      
      <View style={styles.wordMeta}>
        <View style={styles.mistakeBadge}>
          <Ionicons name="alert-circle" size={14} color="#f44336" />
          <Text style={styles.mistakeCount}>{item.mistakeCount} 次</Text>
        </View>
        <Text style={styles.dateText}>{formatDate(item.lastMistakeAt)}</Text>
      </View>

      {selectedWord?.id === item.id && (
        <View style={styles.wordDetail}>
          <Text style={styles.meaningText}>{item.meaning}</Text>
          {item.mistakeReason && (
            <Text style={styles.reasonText}>错误原因: {item.mistakeReason}</Text>
          )}
          <View style={styles.exampleSection}>
            <Text style={styles.exampleLabel}>例句：</Text>
            <Text style={styles.exampleText}>{item.example}</Text>
            <Text style={styles.exampleTranslation}>{item.exampleTranslation}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveWord(item)}
          >
            <Ionicons name="trash-outline" size={18} color="#f44336" />
            <Text style={styles.removeButtonText}>从错词本移除</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>错词本</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{mistakeWords.length}</Text>
          <Text style={styles.statLabel}>错词总数</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{
            mistakeWords.filter(w => !w.addedToReview).length
          }</Text>
          <Text style={styles.statLabel}>待复习</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{
            Math.round(mistakeWords.reduce((sum, w) => sum + w.mistakeCount, 0) / Math.max(mistakeWords.length, 1))
          }</Text>
          <Text style={styles.statLabel}>平均错误次数</Text>
        </View>
      </View>

      {addedCount > 0 && (
        <View style={styles.notificationBanner}>
          <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
          <Text style={styles.notificationText}>
            今日已自动添加 {addedCount} 个错词到复习列表
          </Text>
        </View>
      )}

      {mistakeWords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-done-circle" size={80} color="#4caf50" />
          <Text style={styles.emptyTitle}>太棒了！</Text>
          <Text style={styles.emptyText}>你还没有错词，继续保持！</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={mistakeWords}
            keyExtractor={(item) => item.id}
            renderItem={renderWordItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
          
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.studyButton}
              onPress={handleStudyMistakeWords}
            >
              <Ionicons name="school" size={20} color="#fff" />
              <Text style={styles.studyButtonText}>复习错词</Text>
            </TouchableOpacity>
          </View>
        </>
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
    backgroundColor: '#fff',
  },
  backText: {
    fontSize: 16,
    color: '#667eea',
    width: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#667eea',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  notificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#e8f5e9',
    gap: 8,
  },
  notificationText: {
    fontSize: 14,
    color: '#2e7d32',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 100,
  },
  wordItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  wordItemSelected: {
    borderColor: '#667eea',
    borderWidth: 2,
  },
  wordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  wordText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  phoneticText: {
    fontSize: 14,
    color: '#666',
  },
  wordMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  mistakeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mistakeCount: {
    fontSize: 13,
    color: '#f44336',
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  wordDetail: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  meaningText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  reasonText: {
    fontSize: 14,
    color: '#f44336',
    marginTop: 8,
    fontStyle: 'italic',
  },
  exampleSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  exampleLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  exampleTranslation: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#ffebee',
    gap: 6,
  },
  removeButtonText: {
    fontSize: 14,
    color: '#f44336',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  studyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  studyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
