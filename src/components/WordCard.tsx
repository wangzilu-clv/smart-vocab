import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Word } from '../types';

interface WordCardProps {
  word: Word;
  showMeaning?: boolean;
  onFlip?: () => void;
  showDetail?: boolean;
}

export const WordCard: React.FC<WordCardProps> = ({
  word,
  showMeaning = true,
  onFlip,
  showDetail = false,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onFlip}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <Text style={styles.word}>{word.word}</Text>
          <Text style={styles.phonetic}>{word.phonetic}</Text>
          
          {showMeaning && (
            <>
              <View style={styles.divider} />
              <Text style={styles.meaning}>{word.meaning}</Text>
              
              {showDetail && (
                <>
                  <View style={styles.exampleContainer}>
                    <Text style={styles.example}>{word.example}</Text>
                    <Text style={styles.exampleTranslation}>
                      {word.exampleTranslation}
                    </Text>
                  </View>
                  
                  <View style={styles.tagsContainer}>
                    <View style={[styles.tag, (styles.difficultyTag as any)[word.difficulty]]}>
                      <Text style={styles.tagText}>
                        {word.difficulty === 'easy' ? '简单' : 
                         word.difficulty === 'medium' ? '中等' : '困难'}
                      </Text>
                    </View>
                    {word.category && (
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>{word.category}</Text>
                      </View>
                    )}
                  </View>
                </>
              )}
            </>
          )}
          
          {!showMeaning && (
            <Text style={styles.hint}>点击显示释义</Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  gradient: {
    borderRadius: 20,
  },
  content: {
    padding: 30,
    minHeight: 250,
    justifyContent: 'center',
  },
  word: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  phonetic: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginVertical: 20,
  },
  meaning: {
    fontSize: 22,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 30,
  },
  exampleContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
  },
  example: {
    fontSize: 14,
    color: '#fff',
    fontStyle: 'italic',
  },
  exampleTranslation: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
  },
  difficultyTag: {
    easy: { backgroundColor: 'rgba(76, 175, 80, 0.5)' },
    medium: { backgroundColor: 'rgba(255, 152, 0, 0.5)' },
    hard: { backgroundColor: 'rgba(244, 67, 54, 0.5)' },
  } as any,
  hint: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 20,
  },
});
