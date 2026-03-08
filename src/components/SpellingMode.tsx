import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Word } from '../types';

interface SpellingModeProps {
  word: Word;
  onAnswer: (correct: boolean) => void;
  showResult: boolean;
  hideHints?: boolean; // 第二轮复习时隐藏提示
  hideWord?: boolean;  // 第二轮复习时隐藏单词
}

export const SpellingMode: React.FC<SpellingModeProps> = ({ 
  word, 
  onAnswer, 
  showResult,
  hideHints = false,
  hideWord = false,
}) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleSubmit = () => {
    if (showResult) return;
    const normalizedInput = input.trim().toLowerCase();
    const normalizedWord = word.word.toLowerCase();
    onAnswer(normalizedInput === normalizedWord);
  };

  const getHint = () => {
    const wordLen = word.word.length;
    const showCount = Math.max(1, Math.floor(wordLen / 3));
    let hint = '';
    for (let i = 0; i < wordLen; i++) {
      if (i < showCount) {
        hint += word.word[i];
      } else {
        hint += '_';
      }
      if (i < wordLen - 1) hint += ' ';
    }
    return hint;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>根据释义拼写单词：</Text>
      <Text style={styles.meaning}>{word.meaning}</Text>
      
      {/* 只在非第二轮复习时显示提示 */}
      {!hideHints && (
        <View style={styles.hintContainer}>
          <Text style={styles.hintLabel}>提示：</Text>
          <Text style={styles.hint}>{getHint()}</Text>
        </View>
      )}

      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          showResult && input.toLowerCase().trim() === word.word.toLowerCase() 
            ? styles.correctInput 
            : showResult 
              ? styles.wrongInput 
              : null
        ]}
        value={input}
        onChangeText={setInput}
        placeholder="输入单词..."
        placeholderTextColor="#999"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!showResult}
        onSubmitEditing={handleSubmit}
      />

      {showResult && (
        <View style={styles.resultContainer}>
          <Text style={[
            styles.resultText,
            input.toLowerCase().trim() === word.word.toLowerCase() 
              ? styles.correctText 
              : styles.wrongText
          ]}>
            {input.toLowerCase().trim() === word.word.toLowerCase() 
              ? '✓ 正确!' 
              : `✗ 正确答案是: ${word.word}`}
          </Text>
        </View>
      )}

      {!showResult && (
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={input.trim().length === 0}
        >
          <Text style={styles.submitButtonText}>提交</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  question: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  meaning: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  hintLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  hint: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667eea',
    letterSpacing: 4,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 15,
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: '#fff',
    color: '#333',
  },
  correctInput: {
    borderColor: '#4caf50',
    backgroundColor: '#e8f5e9',
  },
  wrongInput: {
    borderColor: '#f44336',
    backgroundColor: '#ffebee',
  },
  resultContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 16,
    fontWeight: '600',
  },
  correctText: {
    color: '#4caf50',
  },
  wrongText: {
    color: '#f44336',
  },
  submitButton: {
    backgroundColor: '#667eea',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
