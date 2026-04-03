import { ref, readonly } from 'vue'
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth } from '../firebase.js'

// Singleton state – shared across the whole app
const user = ref(null)
const authReady = ref(false)

// Listen to Firebase auth state changes once, at module init
onAuthStateChanged(auth, (firebaseUser) => {
  user.value = firebaseUser
  authReady.value = true
})

const googleProvider = new GoogleAuthProvider()

export function useAuth() {
  /**
   * Open a Google Sign-In popup.
   * Throws a Firebase AuthError on failure.
   */
  const loginWithGoogle = () =>
    signInWithPopup(auth, googleProvider)

  /**
   * Sign the current user out.
   */
  const logout = () => signOut(auth)

  return {
    /** The current Firebase user object (null when signed out) */
    user: readonly(user),
    /**
     * True once Firebase has resolved the initial auth state.
     * Prevents a flash of the login page on first load.
     */
    authReady: readonly(authReady),
    loginWithGoogle,
    logout
  }
}
