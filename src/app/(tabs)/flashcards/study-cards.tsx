import { Flashcard, FlashcardGroup } from '@/src/types/flashcards';
import { fetchWithAuth } from '@/src/utils/fetch-with-auth';
import { useRouter } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import {
  Modal, RefreshControl, ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const StudyFlashcards = ({ group }: { group: FlashcardGroup }) => {
  const [isStudying, setIsStudying] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const [isAddFlashcardOpen, setIsAddFlashcardOpen] = useState(false);
  const [frontQuestion, setFrontQuestion] = useState('');
  const [backAnswer, setBackAnswer] = useState('');

  const [refreshing, setRefreshing] = useState(false);

  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  const router = useRouter();

  const startStudying = () => {
    const shuffled = [...group.flashcards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setShowAnswer(false);
    setIsStudying(true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Replace route to re-trigger loading/fetch logic
    router.replace(`/flashcards/${group.id}`);
    setRefreshing(false); // You can delay this slightly if needed
  };

  const deleteFlashcard = async (id: string) => {
    try {
      await fetchWithAuth('/api/Flashcard/DeleteFlashcard', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error('Erro ao deletar o flashcard', err);
    }
  };

  const addFlashcard = async () => {
    await fetchWithAuth('/api/Flashcard/AddCardToFlashcardGroup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        flashcardGroupId: group.id,
        frontQuestion,
        backAnswer,
      }),
    });
    setIsAddFlashcardOpen(false);
    setFrontQuestion('');
    setBackAnswer('');
    router.replace(`/flashcards/${group.id}`);
  };

  const handleDifficulty = (difficulty: 'easy' | 'medium' | 'hard') => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < shuffledCards.length) {
      setCurrentIndex(nextIndex);
      setShowAnswer(false);
    } else {
      setIsCompleteModalOpen(true);
    }
  };

  const closeCompletionModal = () => {
    setIsCompleteModalOpen(false);
    setIsStudying(false);
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>{group.name}</Text>

      {!isStudying ? (
        <>
          {group.flashcards.map((fc) => (
            <View key={fc.flashcardID} style={styles.card}>
              <Text numberOfLines={1} style={styles.cardText}>{fc.frontQuestion}</Text>
              <TouchableOpacity onPress={() => deleteFlashcard(fc.flashcardID)}>
                <Trash2 size={18} color="white" />
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.buttonGreen} onPress={() => setIsAddFlashcardOpen(true)}>
              <Text style={styles.buttonText}>Adicionar Flashcard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={group.flashcards.length === 0 ? styles.buttonDisabled : styles.buttonBlue}
              onPress={startStudying}
              disabled={group.flashcards.length === 0}>
              <Text style={styles.buttonText}>Estudar Flashcards</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.studyCard}>
          <Text style={styles.studyTitle}>
            Flashcard {currentIndex + 1} de {shuffledCards.length}
          </Text>
          <TouchableOpacity style={styles.studyBox} onPress={() => setShowAnswer(true)}>
            <Text style={styles.studyText}>
              {!showAnswer
                ? shuffledCards[currentIndex].frontQuestion
                : shuffledCards[currentIndex].backAnswer}
            </Text>
            {!showAnswer && <Text style={styles.studyHint}>(Toque para ver a resposta)</Text>}
          </TouchableOpacity>

          {showAnswer && (
            <View style={styles.difficultyButtons}>
              <TouchableOpacity
                style={[styles.difficultyButton, { backgroundColor: '#16a34a' }]}
                onPress={() => handleDifficulty('easy')}>
                <Text style={styles.buttonText}>Fácil</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.difficultyButton, { backgroundColor: '#f59e0b' }]}
                onPress={() => handleDifficulty('medium')}>
                <Text style={styles.buttonText}>Médio</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.difficultyButton, { backgroundColor: '#dc2626' }]}
                onPress={() => handleDifficulty('hard')}>
                <Text style={styles.buttonText}>Difícil</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <Modal transparent visible={isAddFlashcardOpen} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Adicionar Flashcard</Text>
            <Text style={styles.modalSubtitle}>Preencha a frente e o verso do flashcard.</Text>
            <TextInput
              value={frontQuestion}
              onChangeText={setFrontQuestion}
              placeholder="Pergunta"
              style={styles.input}
            />
            <TextInput
              value={backAnswer}
              onChangeText={setBackAnswer}
              placeholder="Resposta"
              style={styles.input}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.buttonBlue} onPress={addFlashcard}>
                <Text style={styles.buttonText}>Adicionar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonGray} onPress={() => setIsAddFlashcardOpen(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={isCompleteModalOpen} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Estudo Concluído!</Text>
            <Text style={styles.modalSubtitle}>Parabéns! Você revisou todos os flashcards.</Text>
            <TouchableOpacity style={styles.buttonBlue} onPress={closeCompletionModal}>
              <Text style={styles.buttonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1e3a8a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardText: {
    color: 'white',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  buttonGreen: {
    backgroundColor: '#16a34a',
    padding: 12,
    borderRadius: 8,
  },
  buttonBlue: {
    backgroundColor: '#1d4ed8',
    padding: 12,
    borderRadius: 8,
  },
  buttonGray: {
    backgroundColor: '#d1d5db',
    padding: 12,
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#1F2937',
    fontWeight: 'bold',
  },
  studyCard: {
    marginTop: 16,
    alignItems: 'center',
  },
  studyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  studyBox: {
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
  },
  studyText: {
    fontSize: 18,
  },
  studyHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  difficultyButton: {
    padding: 12,
    borderRadius: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(55, 65, 81, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  modalSubtitle: {
    textAlign: 'center',
    color: '#4B5563',
    marginTop: 8,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
});

export default StudyFlashcards;