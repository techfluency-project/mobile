import Question from '@/src/components/activity/question';
import { fetchWithAuth } from '@/src/utils/fetch-with-auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X } from 'lucide-react-native'; // lucide-react is not for React Native; you'll need to replace this with a React Native icon library, e.g. react-native-vector-icons or expo/vector-icons
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface UserTestDataInterface {
  questionId: string;
  selectedOption: string;
}

export interface ResultInterface {
  message: string;
  level: string;
}

type ActivityProps = {
  mode: 'placement' | 'single';
  activityId?: string;
};

export default function Activity(_: ActivityProps) {
  const params = useLocalSearchParams();
  const router = useRouter();

  // Determine activityId from props or params
  const activityId = _.activityId ?? params.activityId;
  const isPlacementMode = !activityId;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [correctAnswersPercent, setCorrectAnswersPercent] = useState<number | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [userAnswers, setUserAnswers] = useState<UserTestDataInterface[]>([]);
  const [results, setResults] = useState<ResultInterface | null>(null);
  const [showPlacementPrompt, setShowPlacementPrompt] = useState(isPlacementMode);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!isPlacementMode || hasStarted) {
      const load = async () => {
        const url = isPlacementMode
          ? '/api/PlacementTest/GetQuestionsForPlacementTest'
          : `/api/PathStage/GetPathStageById?id=${activityId}`;

        const res = await fetchWithAuth(url);
        if (!res.ok) throw new Error('Failed to load');

        const data = await res.json();

        if (isPlacementMode) {
          setQuestions(data);
        } else {
          const questionIds = data.questions;
          const questionPromises = questionIds.map((id: string) =>
            fetchWithAuth(`/api/Question/GetQuestionById?id=${id}`).then(r => r.json())
          );

          const fullQuestions = await Promise.all(questionPromises);
          setQuestions(fullQuestions);
        }
      };

      load().catch(console.error);
    }
  }, [activityId, isPlacementMode, hasStarted]);

  useEffect(() => {
    const checkExistingLearningPath = async () => {
      if (isPlacementMode && !hasStarted) {
        try {
          const res = await fetchWithAuth('/api/learningpath/getlearningpath');
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
              router.push('/home');
            }
          }
        } catch (err) {
          console.error('Error checking learning path:', err);
        }
      }
    };

    checkExistingLearningPath();
  }, [isPlacementMode, hasStarted, router]);

  const finish = async () => {
    setIsSubmitting(true);

    if (isPlacementMode) {
      const placementRes = await fetchWithAuth('/api/PlacementTest/ResultFromPlacementTest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userAnswers),
      }).then(r => r.json());

      const pathRes = await fetchWithAuth('/api/LearningPath/MountLearningPaths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userAnswers),
      }).then(r => r.json());

      setResults({
        message: pathRes.message,
        level: placementRes.level.result,
      });
    } else {
      await fetchWithAuth('/api/Question/QuestionAnswer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pathStageId: activityId,
          answers: userAnswers,
        }),
      });

      const correct = userAnswers.reduce((count, answer) => {
        const question = questions.find(q => q.id === answer.questionId);
        return count + (question?.correctAnswer === answer.selectedOption ? 1 : 0);
      }, 0);

      setCorrectAnswersPercent(Math.round((correct / questions.length) * 100));
    }

    setShowFinishModal(true);
    setIsSubmitting(false);
  };

  const nextQuestion = async () => {
    if (progress >= questions.length - 1) {
      await finish();
    } else {
      setProgress(p => p + 1);
    }
  };

  // Replace lucide-react's <X /> with a simple text or your preferred icon component
  const CloseButton = () => (
    <TouchableOpacity onPress={() => router.push('/home')} style={styles.closeButton}>
      <X />
    </TouchableOpacity>
  );

  // Modals
  if (showFinishModal && isPlacementMode) {
    return (
      <View style={styles.modalContainer}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>Your English Level</Text>
          <Text style={[styles.modalHighlight, { marginTop: 8 }]}>{results?.level}</Text>
          <Text style={styles.modalText}>
            Great job! Based on your answers, you are currently at the{' '}
            <Text style={styles.modalHighlight}>{results?.level}</Text> level.
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => router.push('/home')}
          >
            <Text style={styles.buttonText}>Go to Your Learning Path</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (showFinishModal && !isPlacementMode) {
    return (
      <View style={styles.modalContainer}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>You’ve finished all questions!</Text>
          <Text style={styles.modalText}>
            You answered{' '}
            <Text style={[styles.modalHighlight, { fontWeight: 'bold' }]}>
              {correctAnswersPercent}%
            </Text>{' '}
            of the questions correctly. You need 70% to pass!
          </Text>
          <Text style={styles.modalText}>Are you ready to finish this activity?</Text>
          <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'center' }}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => router.push('/home')}
            >
              <Text style={styles.buttonText}>Finish</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (showPlacementPrompt && isPlacementMode) {
    return (
      <View style={styles.modalContainer}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>Welcome to your English journey!</Text>
          <Text style={styles.modalText}>
            Would you like to take a short placement test to determine your English level?
          </Text>
          <View style={{ flexDirection: 'column', marginTop: 20, gap: 8, justifyContent: 'center' }}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => {
                setShowPlacementPrompt(false);
                setHasStarted(true);
              }}
            >
              <Text style={styles.buttonText}>Yes, take the test</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={async () => {
                setIsSubmitting(true);
                await fetchWithAuth('/api/LearningPath/MountLearningPaths', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify([]),
                });
                router.push('/home');
              }}
            >
              <Text style={[styles.buttonText, { color: '#333' }]}>No, make me a beginner learning path</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (isSubmitting) {
    return (
      <View style={styles.modalContainer}>
        <View style={styles.loadingBox}>
          <Text style={styles.loadingText}>Sending results...</Text>
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 16 }} />
        </View>
      </View>
    );
  }

  if (!questions.length) {
    return (
      <View style={{ marginTop: 40, alignItems: 'center' }}>
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.progressHeader}>
        {!isPlacementMode && (
          <CloseButton />
        )}
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarForeground,
              { width: `${(100 * progress) / questions.length}%` },
            ]}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Question
          userAnswers={userAnswers}
          QuestionData={questions[progress]}
          nextQuestion={nextQuestion}
          setUserAnwers={setUserAnswers}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  closeButton: {
    padding: 10,
  },
  progressBarBackground: {
    flex: 1,
    height: 12,
    backgroundColor: '#d1d5db', // gray-300
    borderRadius: 10,
    overflow: 'hidden',
    marginLeft: 10,
  },
  progressBarForeground: {
    height: '100%',
    backgroundColor: '#1D4ED8', // blue-700
    borderRadius: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(55, 65, 81, 0.6)', // bg-gray-700/60
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937', // gray-800
    textAlign: 'center',
  },
  modalHighlight: {
    color: '#2563EB', // blue-600
    fontWeight: '600',
  },
  modalText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4B5563', // gray-600
    textAlign: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  primaryButton: {
    backgroundColor: '#1E40AF', // blue-700
  },
  secondaryButton: {
    backgroundColor: '#D1D5DB', // gray-300
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  loadingBox: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151', // gray-700
  },
});
