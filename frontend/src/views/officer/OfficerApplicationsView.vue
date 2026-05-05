<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-900">My Applications</h1>
        <p class="text-sm text-slate-500 mt-0.5">Loan applications you've created or been assigned</p>
      </div>
      <button @click="$router.push('/officer/applications/new')" class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        New Application
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-4">
      <div class="relative flex-1 min-w-[250px]">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" @input="loadLoans" placeholder="Search by client name or purpose..." class="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all bg-white" />
      </div>
      <select v-model="statusFilter" @change="loadLoans" class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all bg-white min-w-[150px]">
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="officer_review">Officer Review</option>
        <option value="committee_review">Committee Review</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
        <option value="modification_requested">Modification Requested</option>
      </select>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
      <table class="w-full" v-if="loans.length > 0">
        <thead>
          <tr class="border-b border-slate-100">
            <th class="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-6 py-3">Applicant</th>
            <th class="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Purpose</th>
            <th class="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Amount</th>
            <th class="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Risk</th>
            <th class="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Status</th>
            <th class="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Date</th>
            <th class="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="loan in loans" :key="loan._id" class="hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0" @click="$router.push('/officer/applications/' + loan._id)">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" :style="{ background: avatarColor(loan.clientId?.name) }">
                  {{ initials(loan.clientId?.name) }}
                </div>
                <div>
                  <div class="text-sm font-semibold text-slate-900">{{ loan.clientId?.name || 'Unknown' }}</div>
                  <div class="text-xs text-slate-400">{{ loan.clientId?.phone }}</div>
                </div>
              </div>
            </td>
            <td class="px-4 py-4 text-sm text-slate-600">{{ loan.purpose }}</td>
            <td class="px-4 py-4 text-sm font-semibold text-slate-900">{{ (loan.amount || 0).toLocaleString() }} ETB</td>
            <td class="px-4 py-4">
              <span v-if="loan.prediction" :class="riskClass(loan.prediction.riskLevel)" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold uppercase">
                {{ loan.prediction.riskLevel }} {{ loan.prediction.riskScore }}
              </span>
              <span v-else class="text-xs text-slate-400 italic">No prediction</span>
            </td>
            <td class="px-4 py-4">
              <span :class="statusClass(loan.status)" class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize">{{ formatStatus(loan.status) }}</span>
            </td>
            <td class="px-4 py-4 text-xs text-slate-500">{{ formatDate(loan.createdAt) }}</td>
            <td class="px-4 py-4">
              <button @click.stop="$router.push('/officer/applications/' + loan._id)" class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition-colors">
                {{ ['pending', 'officer_review'].includes(loan.status) ? 'Review' : 'View' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="p-12 text-center text-slate-400 text-sm">No applications found.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../../stores/auth.js'
import { fetchLoans } from '../../services/api.js'

const { user } = useAuth()
const loans = ref([])
const search = ref('')
const statusFilter = ref('')

async function loadLoans() {
  const res = await fetchLoans({ search: search.value, status: statusFilter.value, officerId: user.value?._id, limit: 50 })
  if (res.success) loans.value = res.data.items
}

onMounted(loadLoans)

function initials(name) { return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?' }
function avatarColor(name) { const colors = ['#3b82f6','#10b981','#8b5cf6','#f59e0b','#ef4444','#06b6d4']; return colors[(name || '').length % colors.length] }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' }
function formatStatus(s) { return (s || '').replace(/_/g, ' ') }
function statusClass(s) {
  const map = { pending: 'bg-slate-100 text-slate-600', officer_review: 'bg-blue-50 text-blue-700', committee_review: 'bg-amber-50 text-amber-700', approved: 'bg-emerald-50 text-emerald-700', rejected: 'bg-red-50 text-red-600', modification_requested: 'bg-orange-50 text-orange-700' }
  return map[s] || 'bg-slate-100 text-slate-600'
}
function riskClass(level) {
  const map = { Low: 'bg-emerald-50 text-emerald-700', Medium: 'bg-amber-50 text-amber-700', High: 'bg-red-50 text-red-600' }
  return map[level] || 'bg-slate-100 text-slate-600'
}
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
