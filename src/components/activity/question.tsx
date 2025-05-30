import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QuestionOption from './option';
import { UserTestDataInterface } from '@/src/types/user-test-data';
import QuestionInterface from '@/src/types/question';

interface QuestionProps {
  userAnswers: UserTestDataInterface[];
  QuestionData: QuestionInterface;
  nextQuestion: () => void;
  setUserAnwers: React.Dispatch<React.SetStateAction<UserTestDataInterface[]>>;
}

const Question = ({
  userAnswers,
  QuestionData,
  nextQuestion,
  setUserAnwers
}: QuestionProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSelect = (option: string) => {
    if (selectedOption) return;
    setSelectedOption(option);

    setTimeout(() => {
      const newAnswer: UserTestDataInterface = {
        questionId: QuestionData.id,
        selectedOption: option
      };
      setUserAnwers((prevAnswers) => [...prevAnswers, newAnswer]);

      setSelectedOption(null);
    }, 500);
  };

  useEffect(() => {
    if (userAnswers.length > 0) {
      nextQuestion();
    }
  }, [userAnswers]);

  if (!QuestionData.options) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>{QuestionData.questionText}</Text>
      <View style={styles.optionsContainer}>
        {QuestionData.options.map((option, index) => (
          <QuestionOption
            key={index}
            option={option}
            onSelect={handleSelect}
            isLocked={!!selectedOption}
            selectedOption={selectedOption}
            correctOption={QuestionData.correctAnswer}
          />
        ))}
      </View>
    </View>
  );
};

export default Question;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 24,
  },
  questionText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 16,
  },
});
