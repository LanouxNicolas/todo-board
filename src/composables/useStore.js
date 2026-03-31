import { reactive, watch } from 'vue'
import { STORAGE_KEY, createCard } from '../utils/constants.js'

// Store singleton global state
const state = reactive({
  cards: []
})

// Initialize from localStorage
const storedData = localStorage.getItem(STORAGE_KEY)
if (storedData) {
  try {
    state.cards = JSON.parse(storedData)
  } catch (err) {
    console.error("Failed to parse localStorage data", err)
    state.cards = []
  }
}

// Automatically save to localStorage on changes
watch(
  () => state.cards,
  (newCards) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCards))
  },
  { deep: true }
)

export function useStore() {
  const getCardsByType = (type) => {
    return state.cards
      .filter(c => c.type === type && !c.dateCloture)
      .sort((a, b) => a.ordre - b.ordre)
  }

  const getClosedCards = () => {
    return state.cards
      .filter(c => c.dateCloture)
      .sort((a, b) => new Date(b.dateCloture) - new Date(a.dateCloture))
  }

  const addCard = (cardData) => {
    const newCard = createCard(cardData)
    // Put at the end of the column
    const cardsInColumn = getCardsByType(newCard.type)
    newCard.ordre = cardsInColumn.length > 0 ? Math.max(...cardsInColumn.map(c => c.ordre)) + 1 : 0
    state.cards.push(newCard)
  }

  const updateCard = (id, updates) => {
    const index = state.cards.findIndex(c => c.id === id)
    if (index !== -1) {
      state.cards[index] = { ...state.cards[index], ...updates }
    }
  }

  const toggleEnCours = (id) => {
    const card = state.cards.find(c => c.id === id)
    if (card) {
      card.enCours = !card.enCours
    }
  }

  const closeCard = (id) => {
    const card = state.cards.find(c => c.id === id)
    if (card) {
      card.dateCloture = new Date().toISOString()
    }
  }

  const reopenCard = (id) => {
    const card = state.cards.find(c => c.id === id)
    if (card) {
      card.dateCloture = null
    }
  }

  const moveCard = (id, newType, newOrdre) => {
    const card = state.cards.find(c => c.id === id)
    if (card) {
      card.type = newType
      card.ordre = newOrdre
    }
  }

  const reorderCards = (type, orderedIds) => {
    orderedIds.forEach((id, index) => {
      const card = state.cards.find(c => c.id === id && c.type === type)
      if (card) {
        card.ordre = index
      }
    })
  }

  const deleteCard = (id) => {
    const index = state.cards.findIndex(c => c.id === id)
    if (index !== -1) {
      state.cards.splice(index, 1)
    }
  }

  return {
    state,
    getCardsByType,
    getClosedCards,
    addCard,
    updateCard,
    toggleEnCours,
    closeCard,
    reopenCard,
    moveCard,
    reorderCards,
    deleteCard
  }
}

