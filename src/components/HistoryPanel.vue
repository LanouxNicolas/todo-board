<script setup>
import { computed, ref, watch } from 'vue'
import { COLUMNS } from '../utils/constants.js'
import { useStore } from '../composables/useStore.js'

const emit = defineEmits(['close'])
const store = useStore()

const closedCards = computed(() => store.getClosedCards())

const groupedCards = computed(() => {
  const groups = {}
  closedCards.value.forEach(card => {
    const dateObj = new Date(card.dateCloture)
    const dateKey = dateObj.toISOString().split('T')[0]
    
    if (!groups[dateKey]) {
      groups[dateKey] = {
        dateString: dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
        dateOriginal: dateObj,
        cards: []
      }
    }
    groups[dateKey].cards.push(card)
  })
  
  return Object.values(groups).sort((a, b) => b.dateOriginal - a.dateOriginal)
})

const expandedGroups = ref({})

// Déplier le groupe le plus récent par défaut
watch(groupedCards, (newGroups) => {
  if (newGroups.length > 0 && Object.keys(expandedGroups.value).length === 0) {
    expandedGroups.value[newGroups[0].dateString] = true
  }
}, { immediate: true })

const toggleGroup = (dateString) => {
  expandedGroups.value[dateString] = !expandedGroups.value[dateString]
}

const getColumnColor = (typeId) => {
  const col = COLUMNS.find(c => c.id === typeId)
  return col ? col.color : '#ccc'
}

const reopen = (id) => {
  store.reopenCard(id)
}

const closePanel = () => {
  emit('close')
}

const handleOverlayClick = (e) => {
  if (e.target.classList.contains('history-overlay')) {
    closePanel()
  }
}

const formatDate = (isoString) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleDateString('fr-FR')
}
</script>

<template>
  <div class="history-overlay" @click="handleOverlayClick">
    <div class="history-panel">
      <div class="panel-header">
        <h2>Historique des tâches</h2>
        <button class="close-btn" @click="closePanel" title="Fermer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="panel-content">
        <div v-if="groupedCards.length === 0" class="empty-state">
          Aucune tâche clôturée.
        </div>
        
        <div 
          v-for="group in groupedCards" 
          :key="group.dateString" 
          class="history-group"
        >
          <div class="group-header" @click="toggleGroup(group.dateString)">
            <span class="group-title">{{ group.dateString }}</span>
            <svg 
              class="chevron" 
              :class="{ 'is-open': expandedGroups[group.dateString] }"
              width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          
          <div v-show="expandedGroups[group.dateString]" class="group-items">
            <div 
              v-for="card in group.cards" 
              :key="card.id" 
              class="history-item"
            >
              <div 
                class="color-pill" 
                :style="{ backgroundColor: getColumnColor(card.type) }"
                :title="'Colonne: ' + COLUMNS.find(c => c.id === card.type)?.label"
              ></div>
              
              <div class="item-details">
                <span class="item-title">{{ card.titre }}</span>
                <span v-if="card.dateDebut || card.dateFin" class="item-dates">
                  {{ card.dateDebut ? formatDate(card.dateDebut) : '...' }} 
                  <span v-if="card.dateFin">➔ {{ formatDate(card.dateFin) }}</span>
                </span>
              </div>
              
              <button 
                class="reopen-btn" 
                @click="reopen(card.id)"
                title="Rouvrir la tâche"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 14 4 9 9 4"></polyline>
                  <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: flex-end;
  z-index: 1500;
}

.history-panel {
  width: 400px;
  height: 100vh;
  background-color: #ffffff;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@media (max-width: 768px) {
  .history-panel {
    width: 100vw;
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  background-color: #fafafa;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.75rem;
  cursor: pointer;
  color: #888;
  line-height: 1;
}

.close-btn:hover {
  color: #333;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-state {
  text-align: center;
  color: #888;
  padding: 32px 0;
  font-style: italic;
}

.history-group {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f9f9f9;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.group-header:hover {
  background-color: #f0f0f0;
}

.group-title {
  font-weight: 600;
  color: #444;
  font-size: 0.95rem;
}

.chevron {
  color: #888;
  transition: transform 0.3s;
}

.chevron.is-open {
  transform: rotate(180deg);
}

.group-items {
  display: flex;
  flex-direction: column;
  border-top: 1px solid #eee;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
  gap: 12px;
  transition: background-color 0.2s;
}

.history-item:last-child {
  border-bottom: none;
}

.history-item:hover {
  background-color: #fafafa;
}

.color-pill {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* Important pour le text truncation */
}

.item-title {
  font-size: 0.95rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: line-through;
  opacity: 0.8;
}

.item-dates {
  font-size: 0.75rem;
  color: #888;
  margin-top: 2px;
}

.reopen-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  color: #2196F3;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.reopen-btn:hover {
  background-color: rgba(33, 150, 243, 0.1);
}
</style>
