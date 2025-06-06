import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface QuestionOptionProps {
  option: string;
  correctOption: string;
  isLocked: boolean;
  onSelect: (option: string) => void;
  selectedOption: string | null;
}

const QuestionOption = ({
  option,
  correctOption,
  isLocked,
  onSelect,
  selectedOption
}: QuestionOptionProps) => {
  const isSelected = selectedOption === option;
  const isCorrect = option === correctOption;

  const getBackgroundColor = () => {
    if (!isSelected) return styles.optionContainer;
    return isCorrect ? styles.correct : styles.incorrect;
  };

  return (
    <TouchableOpacity
      disabled={isLocked}
      activeOpacity={0.8}
      onPress={() => onSelect(option)}
      style={[
        styles.optionContainer,
        isSelected && (isCorrect ? styles.correct : styles.incorrect),
        isLocked && styles.locked,
      ]}
    >
      <Text style={styles.optionText}>{option}</Text>
    </TouchableOpacity>
  );
};

export default QuestionOption;

const styles = StyleSheet.create({
  optionContainer: {
    backgroundColor: '#1e3a8a', // from-blue-700
    padding: 20,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  correct: {
    backgroundColor: '#15803d', // from-green-700
  },
  incorrect: {
    backgroundColor: '#b91c1c', // from-red-700
  },
  locked: {
    opacity: 0.7,
  },
});
