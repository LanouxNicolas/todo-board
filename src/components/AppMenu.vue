<script setup>
const emit = defineEmits(['toggle-history'])

const openHistory = () => {
  emit('toggle-history')
}
</script>

<template>
  <button class="history-btn" @click="openHistory" title="Historique des tâches">
    <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
    <span class="btn-text">Historique</span>
  </button>
</template>

<style scoped>
.history-btn {
  background: none;
  border: 1px solid #ddd;
  padding: 6px 12px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #555;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s, color 0.2s;
}

.history-btn:hover {
  background-color: #f5f5f5;
  color: #333;
}

.icon {
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .btn-text {
    display: none; /* Sur très petit écran, 
    on ne garde que l'icône pour gagner de la place */
  }
  .history-btn {
    padding: 6px;
    border-color: transparent;
  }
}
</style>
