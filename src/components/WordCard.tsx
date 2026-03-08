import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Word, AccentType } from '../types';
import { 
  speakWord, 
  speakExample, 
  getAccent, 
  getAccentFlag,
  toggleAccent 
} from '../utils/speech';

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
  const [accent, setAccent] = useState<AccentType>(getAccent());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingExample, setIsPlayingExample] = useState(false);

  const handleToggleAccent = useCallback(() => {
    const newAccent = toggleAccent();
    setAccent(newAccent);
  }, []);

  const handlePlayWord = useCallback(async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      await speakWord(word.word, accent);
    } finally {
      setTimeout(() => setIsPlaying(false), 500);
    }
  }, [word.word, accent, isPlaying]);

  const handlePlayExample = useCallback(async () => {
    if (isPlayingExample) return;
    setIsPlayingExample(true);
    try {
      await speakExample(word.example, accent);
    } finally {
      setTimeout(() => setIsPlayingExample(false), 500);
    }
  }, [word.example, accent, isPlayingExample]);

  const currentPhonetic = accent === 'us' 
    ? (word.phoneticUS || word.phonetic) 
    : (word.phoneticUK || word.phonetic);

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
          {/* Accent Toggle */}
          <TouchableOpacity 
            style={styles.accentToggle}
            onPress={(e) => {
              e.stopPropagation();
              handleToggleAccent();
            }}
          >
            <Text style={styles.accentText}>
              {getAccentFlag(accent)} {accent.toUpperCase()}
            </Text>
          </TouchableOpacity>

          {/* Word with Play Button */}
          <View style={styles.wordRow}>
            <Text style={styles.word}>{word.word}</Text>
            <TouchableOpacity
              style={[styles.playButton, isPlaying && styles.playingButton]}
              onPress={(e) => {
                e.stopPropagation();
                handlePlayWord();
              }}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={isPlaying ? "volume-high" : "volume-medium"} 
                size={28} 
                color="#fff" 
              />
            </TouchableOpacity>
          </View>
          
          {/* Phonetic */}
          <Text style={styles.phonetic}>{currentPhonetic}</Text>
          
          {showMeaning && (
            <>
              <View style={styles.divider} />
              <Text style={styles.meaning}>{word.meaning}</Text>
              
              {showDetail && (
                <>
                  {/* Main Example with Play */}
                  <View style={styles.exampleContainer}>
                    <View style={styles.exampleHeader}>
                      <TouchableOpacity
                        style={[styles.examplePlayButton, isPlayingExample && styles.playingButton]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handlePlayExample();
                        }}
                      >
                        <Ionicons 
                          name={isPlayingExample ? "volume-high" : "volume-low"} 
                          size={18} 
                          color="#667eea" 
                        />
                      </TouchableOpacity>
                      <Text style={styles.exampleLabel}>例句</Text>
                    </View>
                    <Text style={styles.example}>{word.example}</Text>
                    <Text style={styles.exampleTranslation}>
                      {word.exampleTranslation}
                    </Text>
                  </View>

                  {/* Additional Examples */}
                  {word.examples && word.examples.length > 0 && (
                    <View style={styles.additionalExamples}>
                      <Text style={styles.additionalLabel}>更多例句</Text>
                      {word.examples.map((ex, idx) => (
                        <View key={idx} style={styles.additionalExampleItem}>
                          <Text style={styles.additionalExampleEn}>• {ex.sentence}</Text>
                          <Text style={styles.additionalExampleCn}>{ex.translation}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  
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
    minHeight: 280,
    justifyContent: 'center',
  },
  accentToggle: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  accentText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  word: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 15,
    borderRadius: 10,
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  exampleLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  examplePlayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  example: {
    fontSize: 14,
    color: '#fff',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  exampleTranslation: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 6,
  },
  additionalExamples: {
    marginTop: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
    borderRadius: 10,
  },
  additionalLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginBottom: 8,
  },
  additionalExampleItem: {
    marginBottom: 10,
  },
  additionalExampleEn: {
    fontSize: 13,
    color: '#fff',
    lineHeight: 18,
  },
  additionalExampleCn: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
    paddingLeft: 10,
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
