<script setup>
import { computed } from 'vue'
import draggable from 'vuedraggable'
import { useStore } from '../composables/useStore.js'
import CardItem from './CardItem.vue'

const props = defineProps({
  column: {
    type: Object,
    required: true
  },
  cards: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['open-create', 'open-edit'])
const store = useStore()

const localCards = computed({
  get: () => props.cards,
  set: (newCards) => {
    // Si une carte vient d'une autre colonne, on met à jour son type
    newCards.forEach((card, index) => {
      if (card.type !== props.column.id) {
        store.moveCard(card.id, props.column.id, index)
      }
    })
    
    // On re-calcule et on impose l'ordre à toutes les cartes
    const orderedIds = newCards.map(c => c.id)
    store.reorderCards(props.column.id, orderedIds)
  }
})

const onDragEnd = () => {
  // Le setter s'occupe déjà de l'enregistrement de l'ordre grâce à v-model.
  // Ce callback est laissé à titre illustratif (ou pour des animations supp).
}

const openCreate = () => {
  emit('open-create', props.column.id)
}

const getContrastYIQ = (hexcolor) => {
  hexcolor = hexcolor.replace("#", "")
  var r = parseInt(hexcolor.substr(0,2),16)
  var g = parseInt(hexcolor.substr(2,2),16)
  var b = parseInt(hexcolor.substr(4,2),16)
  var yiq = ((r*299)+(g*587)+(b*114))/1000
  return (yiq >= 128) ? 'black' : 'white'
}
</script>

<template>
  <div class="column" :style="{ backgroundColor: column.bgColor }">
    <div 
      class="column-header" 
      :style="{ backgroundColor: column.color, color: getContrastYIQ(column.color) }"
    >
      <h3 class="column-title">{{ column.label }}</h3>
      <button class="add-button" @click="openCreate" :style="{ color: getContrastYIQ(column.color) }" title="Créer une tâche">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      </button>
    </div>

    <div class="column-body">
      <div v-if="cards.length === 0" class="empty-column-msg">Aucune tâche</div>
      <draggable
        class="drag-area"
        v-model="localCards"
        group="cards"
        item-key="id"
        :animation="200"
        ghost-class="ghost-card"
        @end="onDragEnd"
      >
        <template #item="{ element }">
          <div class="card-wrapper">
             <CardItem 
               :card="element" 
               :color="column.color"
               @edit="id => emit('open-edit', id)"
             />
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-md, 8px);
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  height: 100%;
}

.column-header {
  padding: var(--spacing-md, 16px);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  flex-shrink: 0;
}

.column-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
}

.add-button {
  position: absolute;
  right: var(--spacing-sm, 8px);
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  transition: opacity 0.2s, background-color 0.2s;
  opacity: 0.8;
}

.add-button:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.1);
}

.column-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm, 8px);
  scrollbar-width: thin;
  position: relative;
}

.empty-column-msg {
  position: absolute;
  top: 24px;
  left: 0;
  right: 0;
  text-align: center;
  color: #aaa;
  font-style: italic;
  font-size: 0.9rem;
  pointer-events: none;
}

.column-body::-webkit-scrollbar {
  width: 6px;
}
.column-body::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.1);
  border-radius: 4px;
}

.drag-area {
  min-height: 100%; 
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 8px);
  padding-bottom: 20px; 
}

.card-wrapper {
  cursor: grab;
}

.card-wrapper:active {
  cursor: grabbing;
}

/* Modificateur pour vuedraggable */
.ghost-card {
  opacity: 0.5;
  border: 2px dashed #999;
  background: #fdfdfd;
  border-radius: 8px; /* Force l'arrondi pour la copie fantôme */
}
</style>
