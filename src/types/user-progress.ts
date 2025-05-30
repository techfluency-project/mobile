export type Activity = {
  topic: number;
  type: number;
  totalCompleted: number;
  totalCorrect: number;
};

export type StageProgress = {
  stageId: string;
  totalAnswered: number;
  totalCorrect: number;
  hasFailed: boolean;
  isCompleted: boolean;
};

export type UserProgress = {
  id: string;
  userId: string;
  level: number;
  dailyStudyTime: string | null;
  totalXP: number;
  activities: Activity[]; // or `any[]` if Activity is not yet defined
  badges: any[] | null;
  dtCreated: string;
  learningPathId: string;
  pathsCompleted: any | null;
  stageProgresses: StageProgress[];
  name: string | null;
  username: string;
};