import { FlashcardGroup } from '@/src/types/flashcards'
import { fetchWithAuth } from '@/src/utils/fetch-with-auth'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native'
import StudyFlashcards from './study-cards'

const FlashcardGroupPage = () => {
  const { flashcardGroupId } = useLocalSearchParams()
  const router = useRouter()

  const [group, setGroup] = useState<FlashcardGroup | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await fetchWithAuth(`/api/Flashcard/GetFlashcardGroupById?id=${flashcardGroupId}`)

        if (!res.ok) {
          setNotFound(true)
          return
        }

        const data = await res.json()
        setGroup(data)
      } catch (error) {
        console.error('Failed to load group', error)
        setNotFound(true)
      }
    }

    if (flashcardGroupId) fetchGroup()
  }, [flashcardGroupId])

  if (!group && !notFound) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    )
  }

  if (notFound && !group) {
    return (
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Flashcard Group Not Found</Text>
          <Text style={styles.message}>
            The flashcard group you are trying to access does not exist or could not be loaded.
          </Text>
          <Button title="Go to Home" onPress={() => router.push('/')} />
        </View>
      </View>
    )
  }

  return <StudyFlashcards group={group} />
}

export default FlashcardGroupPage

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
})
