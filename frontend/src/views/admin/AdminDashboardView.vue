<template>
  <div class="space-y-8 animate-fade-in">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">System Overview</h1>
      <p class="text-sm text-slate-500 mt-1">Administration dashboard — manage users and SACCO organizations</p>
    </div>

    <!-- KPI Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <!-- Total SACCOs -->
      <div class="bg-white rounded-xl border border-slate-200/60 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 2L3 8h18L12 2z"/><line x1="12" y1="12" x2="12" y2="17"/></svg>
          </div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total SACCOs</span>
        </div>
        <div class="text-3xl font-bold text-slate-900">{{ stats.totalSaccos }}</div>
        <p class="text-xs text-slate-500 mt-1">Registered organizations</p>
      </div>

      <!-- Total Admins -->
      <div class="bg-white rounded-xl border border-slate-200/60 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><path d="M12 15c-4 0-6 2-6 4v1h12v-1c0-2-2-4-6-4z"/><circle cx="12" cy="8" r="4"/></svg>
          </div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Admins</span>
        </div>
        <div class="text-3xl font-bold text-slate-900">{{ stats.totalAdmins }}</div>
        <p class="text-xs text-slate-500 mt-1">System administrators</p>
      </div>

      <!-- Total Officers -->
      <div class="bg-white rounded-xl border border-slate-200/60 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Loan Officers</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-bold text-slate-900">{{ stats.activeOfficers }}</span>
          <span v-if="stats.deactivatedOfficers > 0" class="text-sm font-semibold text-red-500">+{{ stats.deactivatedOfficers }} deactivated</span>
        </div>
        <p class="text-xs text-slate-500 mt-1">{{ stats.activeOfficers }} active across all SACCOs</p>
      </div>

      <!-- Total Committees -->
      <div class="bg-white rounded-xl border border-slate-200/60 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          </div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Committee Members</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-bold text-slate-900">{{ stats.activeCommittees }}</span>
          <span v-if="stats.deactivatedCommittees > 0" class="text-sm font-semibold text-red-500">+{{ stats.deactivatedCommittees }} deactivated</span>
        </div>
        <p class="text-xs text-slate-500 mt-1">{{ stats.activeCommittees }} active across all SACCOs</p>
      </div>
    </div>

    <!-- Users by SACCO + Team Composition -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Users per SACCO -->
      <div class="bg-white rounded-xl border border-slate-200/60 p-6">
        <h2 class="text-base font-bold text-slate-900 mb-4">Users per SACCO</h2>
        <div v-if="saccoStats.length > 0" class="space-y-3">
          <div v-for="s in saccoStats" :key="s.name" class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {{ s.name.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-semibold text-slate-900">{{ s.name }}</span>
                <span class="text-sm font-bold text-slate-700">{{ s.count }} users</span>
              </div>
              <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-blue-500 rounded-full transition-all duration-700" :style="{ width: saccoPercent(s.count) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="py-8 text-center text-sm text-slate-400">No SACCOs registered yet</div>
      </div>

      <!-- Team Composition -->
      <div class="bg-white rounded-xl border border-slate-200/60 p-6">
        <h2 class="text-base font-bold text-slate-900 mb-4">Team Composition</h2>
        <div class="grid grid-cols-3 gap-4">
          <div class="p-4 rounded-lg bg-violet-50 text-violet-700 text-center">
            <p class="text-2xl font-bold">{{ stats.totalAdmins }}</p>
            <p class="text-xs font-semibold uppercase tracking-wider mt-1">Admins</p>
          </div>
          <div class="p-4 rounded-lg bg-blue-50 text-blue-700 text-center">
            <p class="text-2xl font-bold">{{ stats.activeOfficers + stats.deactivatedOfficers }}</p>
            <p class="text-xs font-semibold uppercase tracking-wider mt-1">Officers</p>
          </div>
          <div class="p-4 rounded-lg bg-amber-50 text-amber-700 text-center">
            <p class="text-2xl font-bold">{{ stats.activeCommittees + stats.deactivatedCommittees }}</p>
            <p class="text-xs font-semibold uppercase tracking-wider mt-1">Committee</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Links -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button @click="$router.push('/admin/users')" class="flex items-center gap-3 p-5 bg-white rounded-xl border border-slate-200/60 hover:border-blue-300 hover:shadow-md transition-all group">
        <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div class="text-left">
          <p class="text-sm font-semibold text-slate-900">Manage Users</p>
          <p class="text-xs text-slate-500">Create, edit & deactivate users</p>
        </div>
      </button>
      <button @click="$router.push('/admin/saccos')" class="flex items-center gap-3 p-5 bg-white rounded-xl border border-slate-200/60 hover:border-emerald-300 hover:shadow-md transition-all group">
        <div class="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 2L3 8h18L12 2z"/><line x1="12" y1="12" x2="12" y2="17"/></svg>
        </div>
        <div class="text-left">
          <p class="text-sm font-semibold text-slate-900">SACCO Organizations</p>
          <p class="text-xs text-slate-500">Register & manage SACCOs</p>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchUsers, fetchSaccos } from '../../services/api.js'

const stats = ref({
  totalSaccos: 0,
  totalAdmins: 0,
  activeOfficers: 0,
  deactivatedOfficers: 0,
  activeCommittees: 0,
  deactivatedCommittees: 0,
})
const saccoStats = ref([])

onMounted(async () => {
  const [usersRes, saccosRes] = await Promise.all([
    fetchUsers({ search: '', role: '', limit: 1000 }),
    fetchSaccos(),
  ])

  const users = usersRes.success ? (Array.isArray(usersRes.data) ? usersRes.data : []) : []
  const saccos = saccosRes.success ? (Array.isArray(saccosRes.data) ? saccosRes.data : []) : []

  stats.value = {
    totalSaccos: saccos.length,
    totalAdmins: users.filter(u => u.role === 'admin').length,
    activeOfficers: users.filter(u => u.role === 'loan_officer' && u.isActive).length,
    deactivatedOfficers: users.filter(u => u.role === 'loan_officer' && !u.isActive).length,
    activeCommittees: users.filter(u => u.role === 'committee' && u.isActive).length,
    deactivatedCommittees: users.filter(u => u.role === 'committee' && !u.isActive).length,
  }

  // Count users per SACCO
  const saccoMap = {}
  for (const s of saccos) saccoMap[s._id] = { name: s.name, count: 0 }
  for (const u of users) {
    if (u.saccoId && saccoMap[u.saccoId]) saccoMap[u.saccoId].count++
  }
  saccoStats.value = Object.values(saccoMap).sort((a, b) => b.count - a.count)
})

function saccoPercent(count) {
  const max = Math.max(...saccoStats.value.map(s => s.count), 1)
  return Math.max(8, (count / max) * 100)
}
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
