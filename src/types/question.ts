export interface QuestionOptionProps {
  option: string;
  correctOption: string;
  isLocked: boolean;
  onSelect: (option: string) => void;
  selectedOption: string | null;
}

export default interface QuestionInterface {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
}
