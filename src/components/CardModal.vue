<script setup>
import { ref, computed, onMounted } from 'vue'
import { COLUMNS } from '../utils/constants.js'
import { useStore } from '../composables/useStore.js'
import { useAuth } from '../composables/useAuth.js'

const props = defineProps({
  card: {
    type: Object,
    default: null
  },
  mode: {
    type: String,
    default: 'edit', // 'create' or 'edit'
    validator: (val) => ['create', 'edit'].includes(val)
  },
  initialColumnId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close'])
const store = useStore()
const { user } = useAuth()
const titleInput = ref(null)

onMounted(() => {
  if (titleInput.value) {
    titleInput.value.focus()
  }
})

const isCreate = computed(() => props.mode === 'create')

const formatDateForInput = (isoString) => {
  if (!isoString) return ''
  try {
    return new Date(isoString).toISOString().split('T')[0]
  } catch (e) {
    return ''
  }
}

const CATEGORIES = [
  { id: '', label: 'Aucune' },
  { id: 'triangle', label: 'Triangle', color: '#2196F3' },
  { id: 'square', label: 'Carré', color: '#795548' },
  { id: 'circle', label: 'Rond', color: '#26A69A' },
  { id: 'star', label: 'Étoile', color: '#9C27B0' },
  { id: 'heart', label: 'Cœur', color: '#E53935' },
  { id: 'dollar', label: 'Dollar', color: '#F9A825' }
]

const formData = ref({
  titre: '',
  description: '',
  dateDebut: '',
  dateFin: '',
  type: COLUMNS[0].id,
  enCours: false,
  categorie: ''
})

if (isCreate.value) {
  if (props.initialColumnId) {
    formData.value.type = props.initialColumnId
  }
} else if (props.card) {
  formData.value.titre = props.card.titre || ''
  formData.value.description = props.card.description || ''
  formData.value.dateDebut = formatDateForInput(props.card.dateDebut)
  formData.value.dateFin = formatDateForInput(props.card.dateFin)
  formData.value.type = props.card.type || COLUMNS[0].id
  formData.value.enCours = props.card.enCours || false
  formData.value.categorie = props.card.categorie || ''
}

const handleOverlayClick = (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    emit('close')
  }
}

const save = () => {
  if (!formData.value.titre.trim()) return
  const uid = user.value?.uid
  if (!uid) return

  const cardData = {
    titre: formData.value.titre,
    description: formData.value.description,
    dateDebut: formData.value.dateDebut || null,
    dateFin: formData.value.dateFin || null,
    type: formData.value.type,
    enCours: formData.value.enCours,
    categorie: formData.value.categorie
  }

  if (isCreate.value) {
    store.addCard(uid, cardData)
  } else {
    store.updateCard(uid, props.card.id, cardData)
  }
  
  emit('close')
}

const cancel = () => {
  emit('close')
}

const remove = () => {
  const uid = user.value?.uid
  if (!isCreate.value && uid && confirm('Voulez-vous vraiment supprimer cette tâche ?')) {
    store.deleteCard(uid, props.card.id)
    emit('close')
  }
}

const handleSubmit = (e) => {
  e.preventDefault()
  save()
}
</script>

<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ isCreate ? 'Créer une tâche' : 'Éditer la tâche' }}</h2>
        <button class="close-icon" @click="cancel" title="Fermer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <form @submit="handleSubmit" class="modal-form">
        <div class="form-group">
          <label for="titre">Titre *</label>
          <input 
            ref="titleInput"
            type="text" 
            id="titre" 
            v-model="formData.titre" 
            required 
            placeholder="Nom de la tâche"
            @keydown.enter.prevent="handleSubmit"
          />
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea 
            id="description" 
            v-model="formData.description" 
            rows="3" 
            placeholder="Détails (optionnel)"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group half">
            <label for="dateDebut">Date de début</label>
            <input type="date" id="dateDebut" v-model="formData.dateDebut" />
          </div>
          <div class="form-group half">
            <label for="dateFin">Date de fin</label>
            <input type="date" id="dateFin" v-model="formData.dateFin" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group flex-2">
            <label for="type">Colonne (statut)</label>
            <select id="type" v-model="formData.type">
              <option v-for="col in COLUMNS" :key="col.id" :value="col.id">
                {{ col.label }}
              </option>
            </select>
          </div>
          <div class="form-group checkbox-group flex-1">
            <label>
              <input type="checkbox" v-model="formData.enCours" />
               En cours
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>Catégorie</label>
          <div class="category-picker">
            <button
              v-for="cat in CATEGORIES"
              :key="cat.id"
              type="button"
              class="cat-btn"
              :class="{ selected: formData.categorie === cat.id }"
              :title="cat.label"
              @click="formData.categorie = cat.id"
            >
              <span v-if="cat.id === ''" class="cat-none">–</span>
              <svg v-else-if="cat.id === 'triangle'" width="20" height="20" viewBox="0 0 24 24">
                <polygon points="12,3 22,21 2,21" :fill="cat.color" stroke="none"/>
              </svg>
              <svg v-else-if="cat.id === 'square'" width="20" height="20" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" :fill="cat.color" stroke="none"/>
              </svg>
              <svg v-else-if="cat.id === 'circle'" width="20" height="20" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" :fill="cat.color" stroke="none"/>
              </svg>
              <svg v-else-if="cat.id === 'star'" width="20" height="20" viewBox="0 0 24 24">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" :fill="cat.color" stroke="none"/>
              </svg>
              <svg v-else-if="cat.id === 'heart'" width="20" height="20" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" :fill="cat.color" stroke="none"/>
              </svg>
              <svg v-else-if="cat.id === 'dollar'" width="20" height="20" viewBox="0 0 24 24">
                <text x="12" y="18" text-anchor="middle" font-size="18" font-weight="bold" :fill="cat.color" font-family="sans-serif">$</text>
              </svg>
            </button>
          </div>
        </div>

        <div class="modal-actions">
          <button v-if="!isCreate" type="button" class="btn btn-danger" @click="remove">Supprimer</button>
          <div v-else></div> <!-- Espaceur -->
          <div class="right-actions">
            <button type="button" class="btn btn-secondary" @click="cancel">Annuler</button>
            <button type="submit" class="btn btn-primary">{{ isCreate ? 'Créer' : 'Enregistrer' }}</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: var(--spacing-md, 16px);
}

.modal-content {
  background-color: #ffffff;
  border-radius: var(--radius-md, 8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.close-icon {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #888;
  line-height: 1;
}

.close-icon:hover {
  color: #333;
}

.modal-form {
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.half { flex: 1; }
.flex-2 { flex: 2; }
.flex-1 { flex: 1; }

.form-group label {
  font-size: 0.9rem;
  color: #555;
  font-weight: 500;
}

.form-group input[type="text"],
.form-group input[type="date"],
.form-group textarea,
.form-group select {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.95rem;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #4FC3F7;
  box-shadow: 0 0 0 2px rgba(79, 195, 247, 0.2);
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
  margin-top: 24px;
}

.checkbox-group label {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.right-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 0.95rem;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s;
}

.btn:hover { opacity: 0.9; }

.btn-primary {
  background-color: #4FC3F7;
  color: white;
}

.btn-secondary {
  background-color: #e0e0e0;
  color: #333;
}

.btn-danger {
  background-color: #fff;
  color: #e53935;
  border: 1px solid #e53935;
}

.btn-danger:hover {
  background-color: #ffebee;
}

.category-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cat-btn {
  background: none;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  transition: border-color 0.2s, background-color 0.2s, transform 0.1s;
  color: #888;
}

.cat-btn:hover {
  background-color: rgba(0,0,0,0.05);
  transform: scale(1.1);
}

.cat-btn.selected {
  border-color: #555;
  background-color: rgba(0,0,0,0.06);
}

.cat-none {
  font-size: 1.2rem;
  line-height: 1;
  color: #aaa;
}
</style>
