<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { COLUMNS } from '../utils/constants.js'
import { useStore } from '../composables/useStore.js'
import Column from './Column.vue'

const emit = defineEmits(['open-create', 'open-edit'])
const store = useStore()
const boardRef = ref(null)

const activeColumnId = ref(COLUMNS[0].id)
const isMobile = ref(false)
let scrollInterval = null

const checkMobile = () => {
  isMobile.value = window.matchMedia('(max-width: 768px)').matches
}

// Auto-scroll au drag proche des bords
const handleDragOver = (e) => {
  if (!boardRef.value) return
  const threshold = isMobile.value ? 40 : 60
  const rect = boardRef.value.getBoundingClientRect()
  const mouseX = e.clientX || (e.touches && e.touches.length > 0 ? e.touches[0].clientX : 0)

  if (scrollInterval) {
    clearInterval(scrollInterval)
    scrollInterval = null
  }

  const scrollAmount = isMobile.value ? window.innerWidth : 15

  if (rect.right - mouseX < threshold) {
    scrollInterval = setInterval(() => {
      boardRef.value.scrollBy({ left: scrollAmount, behavior: isMobile.value ? 'smooth' : 'auto' })
    }, isMobile.value ? 500 : 20)
  } else if (mouseX - rect.left < threshold) {
    scrollInterval = setInterval(() => {
      boardRef.value.scrollBy({ left: -scrollAmount, behavior: isMobile.value ? 'smooth' : 'auto' })
    }, isMobile.value ? 500 : 20)
  }
}

const handleDragEnd = () => {
  if (scrollInterval) {
    clearInterval(scrollInterval)
    scrollInterval = null
  }
}

// Détection de la colonne active au scroll
const handleScroll = () => {
  if (!boardRef.value || !isMobile.value) return
  
  const scrollLeft = boardRef.value.scrollLeft
  const colWidth = window.innerWidth
  const currentIndex = Math.round(scrollLeft / colWidth)
  
  if (COLUMNS[currentIndex]) {
    activeColumnId.value = COLUMNS[currentIndex].id
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  document.addEventListener('dragend', handleDragEnd)
  document.addEventListener('mouseup', handleDragEnd)
  document.addEventListener('touchend', handleDragEnd)
  
  if (boardRef.value) {
    boardRef.value.addEventListener('scroll', handleScroll, { passive: true })
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  document.removeEventListener('dragend', handleDragEnd)
  document.removeEventListener('mouseup', handleDragEnd)
  document.removeEventListener('touchend', handleDragEnd)
  
  if (boardRef.value) {
    boardRef.value.removeEventListener('scroll', handleScroll)
  }
  if (scrollInterval) clearInterval(scrollInterval)
})
</script>

<template>
  <div class="board-wrapper">
    <!-- Conteneur défilable -->
    <div 
      class="board-container" 
      ref="boardRef"
      @dragover.prevent="handleDragOver"
      @touchmove="handleDragOver"
    >
      <Column 
        v-for="column in COLUMNS" 
        :key="column.id" 
        class="board-column"
        :data-id="column.id"
        :column="column"
        :cards="store.getCardsByType(column.id)"
        @open-create="id => emit('open-create', id)"
        @open-edit="id => emit('open-edit', id)"
      />
    </div>

    <!-- Points de pagination mobile -->
    <div class="mobile-indicators d-mobile-only" v-if="isMobile">
      <div 
        v-for="column in COLUMNS" 
        :key="'dot-'+column.id"
        class="indicator-dot"
        :class="{ active: activeColumnId === column.id }"
        :style="{ 
          backgroundColor: activeColumnId === column.id ? column.color : '#cccccc',
          transform: activeColumnId === column.id ? 'scale(1.3)' : 'scale(1)'
        }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.board-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.board-container {
  display: flex;
  overflow-x: auto;
  height: 100%;
  padding: var(--spacing-md, 16px);
  gap: var(--spacing-md, 16px);
}

.board-column {
  flex: 0 0 auto;
  width: 320px;
  min-width: 250px;
  height: 100%;
}

@media (min-width: 769px) {
  .d-mobile-only {
    display: none !important;
  }
}

@media (max-width: 768px) {
  .board-container {
    padding: 0;
    gap: 0;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    scrollbar-width: none; 
    overflow-y: hidden;
    flex: 1; /* Prend l'espace restant */
  }
  
  .board-container::-webkit-scrollbar {
    display: none;
  }

  .board-column {
    flex: 0 0 100vw;
    width: 100vw;
    height: 100%;
    border-radius: 0;
    scroll-snap-align: start;
    scroll-snap-stop: always;
    padding-bottom: 50px; /* Marge pour les indicateurs ponctuels */
  }

  .mobile-indicators {
    position: fixed;
    bottom: var(--spacing-lg, 24px);
    left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 12px;
    z-index: 10;
  }
  
  .indicator-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    transition: transform 0.3s ease, background-color 0.3s ease;
    box-shadow: 0 1px 2px rgba(0,0,0,0.2); /* Pour être visible sur n'importe quel fond */
  }
}
</style>
