<script setup>
import { computed } from 'vue'
import { useStore } from '../composables/useStore.js'

const CATEGORIES = {
  triangle: { color: '#2196F3' },
  square:   { color: '#795548' },
  circle:   { color: '#26A69A' },
  star:     { color: '#9C27B0' },
  heart:    { color: '#E53935' },
  dollar:   { color: '#F9A825' }
}

const props = defineProps({
  card: {
    type: Object,
    required: true
  },
  color: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['edit'])
const store = useStore()

const handleEdit = () => {
  emit('edit', props.card.id)
}

const toggleEnCours = () => {
  store.toggleEnCours(props.card.id)
}

const closeCard = () => {
  if (confirm('Voulez-vous vraiment clôturer cette tâche ?')) {
    store.closeCard(props.card.id)
  }
}

const deleteCard = () => {
  if (confirm('Voulez-vous vraiment abandonner et supprimer cette tâche ?')) {
    store.deleteCard(props.card.id)
  }
}

// Styling de la card en fonction de son type (couleur) et de son état (en cours)
const cardStyle = computed(() => {
  return {
    borderLeft: `5px solid ${props.color}`,
    backgroundColor: props.card.enCours ? `${props.color}15` : '#ffffff'
  }
})

const categorieBadge = computed(() => {
  const cat = props.card.categorie
  return cat && CATEGORIES[cat] ? { id: cat, color: CATEGORIES[cat].color } : null
})
</script>

<template>
  <div 
    class="card-item" 
    :class="{ 'is-active': card.enCours }"
    :style="cardStyle"
    @click="handleEdit"
  >

    <div class="card-title" :title="card.titre">{{ card.titre }}</div>
    
    <div class="card-actions">
      <!-- Badge catégorie -->
      <div v-if="categorieBadge" class="cat-badge" :title="categorieBadge.id">
        <svg v-if="categorieBadge.id === 'triangle'" width="18" height="18" viewBox="0 0 24 24">
          <polygon points="12,3 22,21 2,21" :fill="categorieBadge.color" stroke="none"/>
        </svg>
        <svg v-else-if="categorieBadge.id === 'square'" width="18" height="18" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" :fill="categorieBadge.color" stroke="none"/>
        </svg>
        <svg v-else-if="categorieBadge.id === 'circle'" width="18" height="18" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" :fill="categorieBadge.color" stroke="none"/>
        </svg>
        <svg v-else-if="categorieBadge.id === 'star'" width="18" height="18" viewBox="0 0 24 24">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" :fill="categorieBadge.color" stroke="none"/>
        </svg>
        <svg v-else-if="categorieBadge.id === 'heart'" width="18" height="18" viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" :fill="categorieBadge.color" stroke="none"/>
        </svg>
        <svg v-else-if="categorieBadge.id === 'dollar'" width="18" height="18" viewBox="0 0 24 24">
          <text x="12" y="18" text-anchor="middle" font-size="18" font-weight="bold" :fill="categorieBadge.color" font-family="sans-serif">$</text>
        </svg>
      </div>

      <!-- Bouton "En cours" (Play / Pause) -->
      <button 
        class="action-btn play-btn" 
        :title="card.enCours ? 'Mettre en pause' : 'Mettre en cours'"
        @click.stop="toggleEnCours"
        :style="{ color: card.enCours ? props.color : '#666' }"
      >
        <svg v-if="!card.enCours" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
      </button>
      
      <!-- Bouton Clôturer -->
      <button 
        class="action-btn close-btn" 
        title="Clôturer la tâche"
        @click.stop="closeCard"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 12L11 15L16 9" />
        </svg>
      </button>

    </div>
  </div>
</template>

<style scoped>
.card-item {
  border-radius: 8px;
  margin-bottom: 0; 
  padding: 10px 12px;
  background-color: rgba(0, 0, 0, 0.1);
  cursor: grab;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  transition: all 0.2s ease;
  min-height: 44px;
  position: relative;
}

.cat-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
}

.card-item:hover {
  box-shadow: 0 3px 6px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.card-title {
  flex: 1;
  font-size: 0.95rem;
  color: #2c3e50;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s, transform 0.1s, color 0.2s;
  color: #888;
}

.action-btn:hover {
  background-color: rgba(0,0,0,0.06);
}

.action-btn:active {
  transform: scale(0.9);
}

.close-btn:hover {
  color: #4CAF50;
  background-color: rgba(76, 175, 80, 0.1);
}

.delete-btn:hover {
  color: #e53935;
  background-color: rgba(229, 57, 53, 0.1);
}

/* Identifiant de mise "en cours" via la bordure et pulsation */
.is-active {
  border-left-width: 8px !important;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

.is-pulsing {
  animation: pulse 1.5s infinite;
}
</style>
