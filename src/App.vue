<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from './composables/useStore.js'
import Board from './components/Board.vue'
import AppMenu from './components/AppMenu.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import CardModal from './components/CardModal.vue'

const store = useStore()

const showHistory = ref(false)
const editingCard = ref(null)
const creatingInColumn = ref(null)

const isModalOpen = computed(() => {
  return showHistory.value || !!editingCard.value || !!creatingInColumn.value
})

watch(isModalOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

const toggleHistory = () => {
  showHistory.value = !showHistory.value
}

const openCreate = (typeId) => {
  creatingInColumn.value = typeId
}

const openEdit = (cardId) => {
  editingCard.value = store.state.cards.find(c => c.id === cardId) || null
}

const closeCardModal = () => {
  editingCard.value = null
  creatingInColumn.value = null
}
</script>

<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="header-left">
        <h1>Todo Board</h1>
      </div>
      <div class="header-right">
        <AppMenu @toggle-history="toggleHistory" />
      </div>
    </header>

    <main class="main-content">
      <Board 
        @open-create="openCreate"
        @open-edit="openEdit"
      />
    </main>

    <!-- Historique -->
    <Transition name="slide-right">
      <HistoryPanel 
        v-if="showHistory" 
        @close="showHistory = false" 
      />
    </Transition>

    <!-- Modal pour l'édition -->
    <Transition name="fade">
      <CardModal 
        v-if="editingCard" 
        :card="editingCard" 
        mode="edit" 
        @close="closeCardModal" 
      />
    </Transition>

    <!-- Modal pour la création -->
    <Transition name="fade">
      <CardModal 
        v-if="creatingInColumn" 
        :initial-column-id="creatingInColumn" 
        mode="create" 
        @close="closeCardModal" 
      />
    </Transition>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.app-header {
  height: var(--header-height, 50px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--spacing-md, 16px);
  z-index: 100;
  flex-shrink: 0;
}

.header-left h1 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.main-content {
  flex: 1;
  overflow: hidden; /* Le Board gère son propre layout / scroll */
  background-color: rgba(0, 0, 0, 0.2);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: opacity 0.3s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  opacity: 0;
}

.slide-right-enter-active :deep(.history-panel),
.slide-right-leave-active :deep(.history-panel) {
  transition: transform 0.3s ease;
}
.slide-right-enter-from :deep(.history-panel),
.slide-right-leave-to :deep(.history-panel) {
  transform: translateX(100%);
}
</style>
