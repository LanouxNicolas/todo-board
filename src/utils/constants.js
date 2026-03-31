export const STORAGE_KEY = 'todo-board-data'

export const COLUMNS = [
  { id: 'HEURES', label: 'Heures', color: '#4FC3F7', bgColor: '#E1F5FE' },
  { id: 'JOURS', label: 'Jours', color: '#81C784', bgColor: '#E8F5E9' },
  { id: 'SEMAINES', label: 'Semaines', color: '#FFD54F', bgColor: '#FFF8E1' },
  { id: 'MOIS', label: 'Mois', color: '#FFB74D', bgColor: '#FFF3E0' },
  { id: 'DEMI-ANNEES', label: 'Semestres', color: '#E57373', bgColor: '#FFEBEE' },
  { id: 'ANNEES', label: 'Années', color: '#BA68C8', bgColor: '#F3E5F5' }
]

/**
 * Structure d'une card :
 * {
 *   id: string (généré avec Date.now() + Math.random().toString()),
 *   titre: string,
 *   description: string | '',
 *   dateDebut: string (format ISO) | null,
 *   dateFin: string (format ISO) | null,
 *   type: string (une des valeurs de l'enum COLUMNS.id),
 *   enCours: boolean (default false),
 *   dateCloture: string (format ISO) | null,
 *   ordre: number (position verticale dans la colonne)
 * }
 */
export const createCard = (data) => {
  return {
    id: Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9),
    titre: data.titre || '',
    description: data.description || '',
    dateDebut: data.dateDebut || null,
    dateFin: data.dateFin || null,
    type: data.type || COLUMNS[0].id,
    enCours: data.enCours || false,
    dateCloture: data.dateCloture || null,
    ordre: data.ordre !== undefined ? data.ordre : 0
  }
}

