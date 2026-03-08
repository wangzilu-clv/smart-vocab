import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Word } from '../types';
import { getAllWords } from '../data/vocabulary';

interface QuizModeProps {
  word: Word;
  onAnswer: (correct: boolean) => void;
  showResult: boolean;
}

export const QuizMode: React.FC<QuizModeProps> = ({ word, onAnswer, showResult }) => {
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    // Generate 4 options including the correct answer
    const allWords = getAllWords();
    const wrongOptions: string[] = [];
    
    // Get 3 random wrong answers
    while (wrongOptions.length < 3) {
      const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
      if (randomWord.id !== word.id && !wrongOptions.includes(randomWord.meaning)) {
        wrongOptions.push(randomWord.meaning);
      }
    }
    
    // Combine and shuffle
    const allOptions = [word.meaning, ...wrongOptions];
    for (let i = allOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
    }
    
    setOptions(allOptions);
    setSelectedOption(null);
  }, [word]);

  const handleSelect = (option: string) => {
    if (showResult) return;
    setSelectedOption(option);
    onAnswer(option === word.meaning);
  };

  const getOptionStyle = (option: string) => {
    if (!showResult) {
      return selectedOption === option ? styles.selectedOption : styles.option;
    }
    
    if (option === word.meaning) {
      return styles.correctOption;
    }
    
    if (selectedOption === option && option !== word.meaning) {
      return styles.wrongOption;
    }
    
    return styles.option;
  };

  const getOptionTextStyle = (option: string) => {
    if (!showResult) {
      return selectedOption === option ? styles.selectedOptionText : styles.optionText;
    }
    
    if (option === word.meaning) {
      return styles.correctOptionText;
    }
    
    if (selectedOption === option && option !== word.meaning) {
      return styles.wrongOptionText;
    }
    
    return styles.optionText;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>请选择正确的释义：</Text>
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.optionButton, getOptionStyle(option)]}
            onPress={() => handleSelect(option)}
            disabled={showResult}
          >
            <Text style={[styles.optionLabel, getOptionTextStyle(option)]}>
              {String.fromCharCode(65 + index)}.
            </Text>
            <Text style={[styles.optionText, getOptionTextStyle(option)]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
    marginBottom: 15,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  option: {
    borderColor: '#e0e0e0',
  },
  selectedOption: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
  },
  correctOption: {
    borderColor: '#4caf50',
    backgroundColor: '#e8f5e9',
  },
  wrongOption: {
    borderColor: '#f44336',
    backgroundColor: '#ffebee',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
    marginRight: 12,
    width: 24,
  },
  optionText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  selectedOptionText: {
    color: '#667eea',
    fontWeight: '600',
  },
  correctOptionText: {
    color: '#4caf50',
    fontWeight: '600',
  },
  wrongOptionText: {
    color: '#f44336',
    fontWeight: '600',
  },
});
