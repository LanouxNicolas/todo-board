<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth.js'

const { loginWithGoogle } = useAuth()

const error = ref('')
const loading = ref(false)

const handleGoogle = async () => {
  error.value = ''
  loading.value = true
  try {
    await loginWithGoogle()
    // App.vue watches `user` and unmounts LoginPage automatically
  } catch (err) {
    if (err.code !== 'auth/popup-closed-by-user') {
      error.value = 'La connexion a échoué. Veuillez réessayer.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-backdrop">
    <div class="login-card">
      <!-- Logo / icône -->
      <div class="app-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
          stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      </div>

      <h1 class="login-title">Todo Board</h1>
      <p class="login-subtitle">Organisez vos tâches, à votre rythme.</p>

      <button
        class="btn-google"
        :disabled="loading"
        @click="handleGoogle"
      >
        <span v-if="loading" class="spinner" />
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48"
          class="google-icon">
          <path fill="#EA4335" d="M24 9.5c3.14 0 5.96 1.08 8.18 2.86l6.1-6.1C34.36 3.05 29.44 1 24 1 14.82 1 7.05 6.48 3.73 14.19l7.11 5.52C12.56 13.37 17.83 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.52 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.7c-.55 2.97-2.2 5.49-4.67 7.18l7.18 5.58C43.46 37.38 46.52 31.37 46.52 24.5z"/>
          <path fill="#FBBC05" d="M10.84 28.29A14.6 14.6 0 0 1 9.5 24c0-1.49.26-2.93.72-4.29L3.11 14.2A23.5 23.5 0 0 0 .5 24c0 3.77.9 7.34 2.5 10.48l7.84-6.19z"/>
          <path fill="#34A853" d="M24 47c6.48 0 11.92-2.14 15.9-5.83l-7.18-5.58c-2.01 1.35-4.59 2.14-8.72 2.14-6.17 0-11.44-3.87-13.16-9.21l-7.84 6.19C7.05 41.52 14.82 47 24 47z"/>
        </svg>
        {{ loading ? 'Connexion…' : 'Continuer avec Google' }}
      </button>

      <p v-if="error" class="error-msg" role="alert">{{ error }}</p>

      <p class="disclaimer">
        En vous connectant, vous acceptez que vos données soient stockées
        dans Firebase sous votre compte Google.
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
  z-index: 1000;
}

.login-card {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(16px);
  border-radius: 24px;
  padding: 2.75rem 2.25rem;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

/* App icon */
.app-icon {
  width: 68px;
  height: 68px;
  border-radius: 18px;
  background: linear-gradient(135deg, #4fc3f7, #0288d1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-bottom: 1.25rem;
  box-shadow: 0 8px 24px rgba(2, 136, 209, 0.4);
}

.login-title {
  font-size: 1.7rem;
  font-weight: 700;
  margin: 0 0 0.3rem;
  letter-spacing: -0.5px;
}

.login-subtitle {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.88rem;
  margin: 0 0 2rem;
  text-align: center;
}

/* Google button */
.btn-google {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: #fff;
  color: #3c4043;
  border: none;
  border-radius: 12px;
  padding: 0.8rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.1s, opacity 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
}

.btn-google:hover:not(:disabled) {
  box-shadow: 0 4px 16px rgba(0,0,0,0.35);
  transform: translateY(-1px);
}

.btn-google:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-google:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.google-icon {
  flex-shrink: 0;
}

/* Spinner */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(60, 64, 67, 0.25);
  border-top-color: #3c4043;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error */
.error-msg {
  color: #ff7b7b;
  font-size: 0.82rem;
  margin: 0.9rem 0 0;
  text-align: center;
  line-height: 1.4;
}

/* Disclaimer */
.disclaimer {
  margin: 1.5rem 0 0;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.28);
  text-align: center;
  line-height: 1.5;
}
</style>
