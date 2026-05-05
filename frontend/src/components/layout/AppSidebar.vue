<template>
  <aside class="fixed top-0 left-0 w-[250px] h-screen bg-sidebar flex flex-col z-50 overflow-y-auto overflow-x-hidden">
    <!-- Brand -->
    <div class="flex items-center gap-3 px-5 py-6 border-b border-white/[0.08]">
      <div class="w-[38px] h-[38px] bg-blue-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 100 4h4a2 2 0 010 4H8"/><path d="M12 18V6"/></svg>
      </div>
      <div class="flex flex-col">
        <span class="text-sm font-bold text-white leading-tight tracking-tight">{{ saccoName }}</span>
        <span class="text-[11px] font-medium text-white/50 uppercase tracking-wider mt-0.5">{{ roleLabel }}</span>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 py-4">
      <div class="text-[11px] font-semibold text-white/50 uppercase tracking-widest px-5 pt-4 pb-2">Main Menu</div>

      <router-link
        v-for="item in menuItems" :key="item.path"
        :to="item.path"
        class="group flex items-center gap-3 py-2.5 px-5 mx-3 rounded-lg text-[13px] font-medium transition-all relative"
        :class="isActive(item.path) ? 'bg-blue-500/15 text-white' : 'text-white/55 hover:bg-white/[0.08] hover:text-white/80'"
      >
        <span v-if="isActive(item.path)" class="absolute left-[-12px] top-1/2 -translate-y-1/2 w-[3px] h-6 bg-blue-500 rounded-r"></span>
        <span v-html="item.icon"></span>
        {{ item.label }}
      </router-link>
    </nav>

    <!-- Bottom -->
    <div class="px-5 py-4 border-t border-white/[0.08]">
      
      <button v-if="userRole === 'loan_officer'" @click="$router.push('/officer/applications/new')" class="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[13px] font-semibold transition-colors mb-4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        New Application
      </button>
      <button v-if="userRole === 'admin'" @click="$router.push('/admin/users/new')" class="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[13px] font-semibold transition-colors mb-4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
        Add User
      </button>
      <div class="flex items-center gap-3 py-2 px-2 text-white/50 text-xs font-medium hover:text-white/80 transition-colors cursor-pointer">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        Support
      </div>
      <div @click="handleLogout" class="flex items-center gap-3 py-2 px-2 text-white/50 text-xs font-medium hover:text-white/80 transition-colors cursor-pointer">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Sign Out
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../../stores/auth.js'

const route = useRoute()
const router = useRouter()
const { userRole, logout, saccoName } = useAuth()

const icons = {
  dashboard: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  applications: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
  reports: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  clients: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
  users: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4-4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  saccos: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 2L3 8h18L12 2z"/><line x1="12" y1="12" x2="12" y2="17"/></svg>',
}

const roleLabel = computed(() => {
  const labels = { loan_officer: 'Loan Officer', committee: 'Committee', admin: 'Administrator' }
  return labels[userRole.value] || 'Dashboard'
})

const menuItems = computed(() => {
  if (userRole.value === 'loan_officer') {
    return [
      { path: '/officer/dashboard', label: 'Dashboard', icon: icons.dashboard },
      { path: '/officer/clients', label: 'Clients', icon: icons.clients },
      { path: '/officer/applications', label: 'My Applications', icon: icons.applications },
    ]
  }
  if (userRole.value === 'admin') {
    return [
      { path: '/admin/dashboard', label: 'Dashboard', icon: icons.dashboard },
      { path: '/admin/users', label: 'Users', icon: icons.users },
      { path: '/admin/saccos', label: 'SACCOs', icon: icons.saccos },
    ]
  }
  // committee
  return [
    { path: '/committee/dashboard', label: 'Dashboard', icon: icons.dashboard },
    { path: '/committee/applications', label: 'Applications', icon: icons.applications },
    { path: '/committee/reports', label: 'Reports', icon: icons.reports },
  ]
})

function isActive(path) {
  if (path.endsWith('/dashboard')) return route.path === path
  return route.path.startsWith(path)
}

function handleLogout() {
  logout()
  router.push('/login')
}
</script>
