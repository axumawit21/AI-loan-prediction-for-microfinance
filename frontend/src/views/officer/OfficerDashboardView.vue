<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Welcome -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Welcome back, {{ userName }} 👋</h1>
      <p class="text-sm text-slate-500 mt-1">Here's an overview of your loan portfolio</p>
    </div>

    <!-- KPI Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div v-for="kpi in kpis" :key="kpi.label" class="bg-white rounded-xl border border-slate-200/60 p-5 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{{ kpi.label }}</span>
          <div :class="kpi.iconBg" class="w-9 h-9 rounded-lg flex items-center justify-center">
            <span v-html="kpi.icon" class="text-white"></span>
          </div>
        </div>
        <div class="text-2xl font-bold text-slate-900">{{ kpi.value }}</div>
        <p class="text-xs text-slate-500 mt-1">{{ kpi.sub }}</p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="flex gap-4">
      <button @click="$router.push('/officer/clients/new')" class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
        Register Client
      </button>
      <button @click="$router.push('/officer/applications/new')" class="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        New Application
      </button>
    </div>

    <!-- Recent Applications Table -->
    <div class="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
      <div class="flex items-center justify-between p-6 border-b border-slate-100">
        <div>
          <h2 class="text-base font-bold text-slate-900">My Recent Applications</h2>
          <p class="text-xs text-slate-500 mt-0.5">Latest loan applications you've created</p>
        </div>
        <router-link to="/officer/applications" class="text-[13px] font-semibold text-blue-600 hover:text-blue-700 transition-colors">
          View All →
        </router-link>
      </div>
      <table class="w-full" v-if="recentLoans.length > 0">
        <thead>
          <tr class="border-b border-slate-100">
            <th class="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-6 py-3">Applicant</th>
            <th class="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Purpose</th>
            <th class="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Amount</th>
            <th class="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Status</th>
            <th class="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="loan in recentLoans" :key="loan._id" class="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" :style="{ background: avatarColor(loan.clientId?.name) }">
                  {{ initials(loan.clientId?.name) }}
                </div>
                <div>
                  <div class="text-sm font-semibold text-slate-900">{{ loan.clientId?.name || 'Unknown' }}</div>
                </div>
              </div>
            </td>
            <td class="px-4 py-4 text-sm text-slate-600">{{ loan.purpose }}</td>
            <td class="px-4 py-4 text-sm font-semibold text-slate-900">{{ (loan.amount || 0).toLocaleString() }} ETB</td>
            <td class="px-4 py-4">
              <span :class="statusClass(loan.status)" class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize">
                {{ formatStatus(loan.status) }}
              </span>
            </td>
            <td class="px-4 py-4">
              <button @click="$router.push('/officer/applications/' + loan._id)" class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition-colors">
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="p-12 text-center text-slate-400 text-sm">No applications yet. Create one to get started.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../../stores/auth.js'
import { fetchOfficerStats } from '../../services/api.js'

const { user, userName } = useAuth()
const stats = ref({ assigned: 0, pending: 0, forwarded: 0, myClients: 0 })
const recentLoans = ref([])

const kpis = ref([])

onMounted(async () => {
  const res = await fetchOfficerStats(user.value?._id)
  if (res.success) {
    stats.value = res.data
    recentLoans.value = res.data.recentLoans || []
    kpis.value = [
      { label: 'Assigned Applications', value: res.data.assigned, sub: 'Total assigned to you', iconBg: 'bg-blue-500', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' },
      { label: 'Pending Review', value: res.data.pending, sub: 'Awaiting your assessment', iconBg: 'bg-amber-500', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' },
      { label: 'Forwarded', value: res.data.forwarded, sub: 'Sent to committee', iconBg: 'bg-emerald-500', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' },
      { label: 'My Clients', value: res.data.myClients, sub: 'Clients registered by you', iconBg: 'bg-violet-500', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/></svg>' },
    ]
  }
})

function initials(name) { return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?' }
function avatarColor(name) { const colors = ['#3b82f6','#10b981','#8b5cf6','#f59e0b','#ef4444','#06b6d4']; return colors[(name || '').length % colors.length] }
function formatStatus(s) { return (s || '').replace(/_/g, ' ') }
function statusClass(s) {
  const map = { pending: 'bg-slate-100 text-slate-600', officer_review: 'bg-blue-50 text-blue-700', committee_review: 'bg-amber-50 text-amber-700', approved: 'bg-emerald-50 text-emerald-700', rejected: 'bg-red-50 text-red-600', modification_requested: 'bg-orange-50 text-orange-700' }
  return map[s] || 'bg-slate-100 text-slate-600'
}
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
