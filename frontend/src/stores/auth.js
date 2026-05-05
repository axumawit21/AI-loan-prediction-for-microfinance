// ═══════════════════════════════════════════
// Auth Store — Reactive auth state
// ═══════════════════════════════════════════

import { reactive, computed } from 'vue'

const state = reactive({
  user: JSON.parse(localStorage.getItem('sacco_user') || 'null'),
  token: localStorage.getItem('sacco_token') || null,
})

export const useAuth = () => {
  const isAuthenticated = computed(() => !!state.token)
  const user = computed(() => state.user)
  const userRole = computed(() => state.user?.role || '')
  const userName = computed(() => state.user?.name || '')
  const userInitials = computed(() => {
    if (!state.user?.name) return '?'
    return state.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  })

  function setAuth(token, user) {
    state.token = token
    state.user = user
    localStorage.setItem('sacco_token', token)
    localStorage.setItem('sacco_user', JSON.stringify(user))
  }

  function logout() {
    state.token = null
    state.user = null
    localStorage.removeItem('sacco_token')
    localStorage.removeItem('sacco_user')
  }
  const saccoName = computed(() => state.user?.saccoName || 'SACCO')

  return { isAuthenticated, user, userRole, userName, userInitials, saccoName, setAuth, logout }
}
