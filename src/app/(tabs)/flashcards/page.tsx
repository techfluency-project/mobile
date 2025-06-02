import { FlashcardGroup } from '@/src/types/flashcards';
import { fetchWithAuth } from '@/src/utils/fetch-with-auth';
import { Stack, useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const Flashcards = () => {
  const [groups, setGroups] = useState<FlashcardGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [groupName, setGroupName] = useState('');
  const router = useRouter();

  const fetchFlashcardGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/Flashcard/GetAllFlashcardsGroup');
      if (!res.ok) {
        const errText = await res.text();
        console.error('API error fetching groups:', res.status, errText);
        if (
          res.status === 401 ||
          (res.status === 400 && errText.toLowerCase().includes('user not found'))
        ) {
          router.push('/login');
        }
        return;
      }
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      console.error('Error fetching flashcard groups:', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const createFlashcardGroup = async () => {
    if (!groupName.trim()) return;
    try {
      const response = await fetchWithAuth('/api/Flashcard/CreateFlashcardGroup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: groupName }),
      });
      if (!response.ok) throw new Error('Failed to create flashcard group');
      await fetchFlashcardGroups();
      setIsModalVisible(false);
      setGroupName('');
    } catch (error) {
      console.error('Error creating flashcard group:', error);
    }
  };

  useEffect(() => {
    fetchFlashcardGroups();
  }, [fetchFlashcardGroups]);

  const renderItem = ({ item }: { item: FlashcardGroup }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(tabs)/flashcards/${item.id}`)}>
      <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
      <Text>{item.flashcards.length} cards</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Flashcards' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Flashcards</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" />
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            renderItem={renderItem}
            ListFooterComponent={() => (
              <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
                <Plus size={48} color="#2563EB" />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
      {isModalVisible && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Create a Flashcard Group</Text>
            <Text style={styles.modalSubtitle}>Enter a name for your new flashcard group.</Text>
            <TextInput
              style={styles.input}
              placeholder="Group name"
              value={groupName}
              onChangeText={setGroupName}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.createButton} onPress={createFlashcardGroup}>
                <Text style={styles.createButtonText}>Create Group</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    marginTop: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#1E3A8A',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    flex: 1,
    marginHorizontal: 4,
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 84,
    width: '100%',
    marginTop: 16,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(55, 65, 81, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalSubtitle: {
    color: '#4B5563',
    marginTop: 8,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    width: '100%',
    padding: 8,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  createButton: {
    backgroundColor: '#2563EB',
    padding: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#D1D5DB',
    padding: 10,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#1F2937',
    fontWeight: 'bold',
  },
});

export default Flashcards;
