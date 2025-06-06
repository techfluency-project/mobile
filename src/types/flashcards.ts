export type Flashcard = {
  flashcardID: string,
  frontQuestion: string
  backAnswer: string
}

export type FlashcardGroup = {
  id: string
  userId: string
  name: string
  dtCreated: string
  flashcards: Flashcard[]
}
