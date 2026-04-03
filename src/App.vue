<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from './composables/useStore.js'
import { useAuth } from './composables/useAuth.js'
import Board from './components/Board.vue'
import AppMenu from './components/AppMenu.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import CardModal from './components/CardModal.vue'
import LoginPage from './components/LoginPage.vue'

const store = useStore()
const { user, authReady, logout } = useAuth()

const showHistory = ref(false)
const editingCard = ref(null)
const creatingInColumn = ref(null)

const isModalOpen = computed(() => {
  return showHistory.value || !!editingCard.value || !!creatingInColumn.value
})

// Start/stop Firestore listener when auth state changes
watch(user, (newUser) => {
  if (newUser) {
    store.startListening(newUser.uid)
  } else {
    store.stopListening()
    // Reset modal states on logout
    showHistory.value = false
    editingCard.value = null
    creatingInColumn.value = null
  }
}, { immediate: true })

watch(isModalOpen, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
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

const handleLogout = async () => {
  await logout()
}
</script>

<template>
  <!-- Wait for Firebase to resolve auth state before rendering anything -->
  <template v-if="!authReady">
    <div class="auth-loading">
      <span class="spinner-lg" />
    </div>
  </template>

  <!-- Not signed in → show login page -->
  <template v-else-if="!user">
    <LoginPage />
  </template>

  <!-- Signed in → show the board -->
  <template v-else>
    <div class="app-layout">
      <header class="app-header">
        <div class="header-left">
          <h1>Todo Board</h1>
        </div>
        <div class="header-right">
          <AppMenu @toggle-history="toggleHistory" />
          <button class="btn-logout" @click="handleLogout" title="Se déconnecter">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
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
</template>

<style scoped>
/* ── Loading spinner while auth resolves ── */
.auth-loading {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a2e;
}

.spinner-lg {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(79, 195, 247, 0.25);
  border-top-color: #4fc3f7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── App layout ── */
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

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-logout {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 8px;
  padding: 5px 8px;
  cursor: pointer;
  color: #666;
  transition: background 0.2s, color 0.2s;
}

.btn-logout:hover {
  background: rgba(0,0,0,0.06);
  color: #e53935;
}

.main-content {
  flex: 1;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.2);
}

/* ── Transitions ── */
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
