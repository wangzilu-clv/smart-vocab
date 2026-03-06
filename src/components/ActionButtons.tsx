import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActionButtonsProps {
  onKnow: () => void;
  onVague: () => void;
  onUnknown: () => void;
  showAnswer: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onKnow,
  onVague,
  onUnknown,
  showAnswer,
}) => {
  if (!showAnswer) {
    return (
      <TouchableOpacity style={styles.showAnswerButton} onPress={onUnknown}>
        <Text style={styles.showAnswerText}>显示答案</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.unknownButton]}
        onPress={onUnknown}
      >
        <Ionicons name="close-circle" size={24} color="#fff" />
        <Text style={styles.buttonText}>不认识</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.vagueButton]}
        onPress={onVague}
      >
        <Ionicons name="help-circle" size={24} color="#fff" />
        <Text style={styles.buttonText}>模糊</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.knowButton]}
        onPress={onKnow}
      >
        <Ionicons name="checkmark-circle" size={24} color="#fff" />
        <Text style={styles.buttonText}>认识</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  unknownButton: {
    backgroundColor: '#f44336',
  },
  vagueButton: {
    backgroundColor: '#ff9800',
  },
  knowButton: {
    backgroundColor: '#4caf50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  showAnswerButton: {
    backgroundColor: '#667eea',
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  showAnswerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
