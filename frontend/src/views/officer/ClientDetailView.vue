<template>
  <div class="space-y-6 animate-fade-in" v-if="client">
    <div class="flex items-center justify-between">
      <div>
        <button @click="$router.push('/officer/clients')" class="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to Clients
        </button>
        <h1 class="text-xl font-bold text-slate-900">{{ client.name }}</h1>
        <p class="text-sm text-slate-500 mt-0.5">Client Profile</p>
      </div>
      <div class="flex gap-3">
        <button @click="$router.push('/officer/clients/' + client._id + '/edit')" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors">
          Edit Client
        </button>
        <button @click="$router.push('/officer/applications/new?clientId=' + client._id)" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
          Create Loan Application
        </button>
      </div>
    </div>

    <!-- Client Info Card -->
    <div class="bg-white rounded-xl border border-slate-200/60 p-6">
      <h2 class="text-base font-bold text-slate-900 mb-4">Personal Information</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Full Name</p><p class="text-sm text-slate-900 font-medium">{{ client.name }}</p></div>
        <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Phone</p><p class="text-sm text-slate-900 font-medium">{{ client.phone }}</p></div>
        <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Email</p><p class="text-sm text-slate-900 font-medium">{{ client.email || '—' }}</p></div>
        <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">National ID</p><p class="text-sm text-slate-900 font-medium">{{ client.nationalId || '—' }}</p></div>
        <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Gender</p><p class="text-sm text-slate-900 font-medium capitalize">{{ client.gender || '—' }}</p></div>
        <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Address</p><p class="text-sm text-slate-900 font-medium">{{ client.address || '—' }}</p></div>
      </div>
    </div>

    <!-- Financial Info -->
    <div class="bg-white rounded-xl border border-slate-200/60 p-6">
      <h2 class="text-base font-bold text-slate-900 mb-4">Financial Summary</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Business Type</p><p class="text-sm text-slate-900 font-medium">{{ client.businessType }}</p></div>
        <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Member Since</p><p class="text-sm text-slate-900 font-medium">{{ formatDate(client.membershipDate) }}</p></div>
        <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Total Savings</p><p class="text-sm font-bold text-emerald-600">{{ (client.totalSavings || 0).toLocaleString() }} ETB</p></div>
        <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Monthly Savings</p><p class="text-sm font-bold text-blue-600">{{ (client.monthlySavings || 0).toLocaleString() }} ETB</p></div>
      </div>
    </div>

    <!-- Loan History -->
    <div class="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
      <div class="p-6 border-b border-slate-100">
        <h2 class="text-base font-bold text-slate-900">Loan History</h2>
        <p class="text-xs text-slate-500 mt-0.5">All loan applications for this client</p>
      </div>
      <table class="w-full" v-if="client.loans && client.loans.length > 0">
        <thead>
          <tr class="border-b border-slate-100">
            <th class="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-6 py-3">Purpose</th>
            <th class="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Amount</th>
            <th class="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Duration</th>
            <th class="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Risk</th>
            <th class="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in client.loans" :key="l._id" class="hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0" @click="$router.push('/officer/applications/' + l._id)">
            <td class="px-6 py-4 text-sm font-medium text-slate-900">{{ l.purpose }}</td>
            <td class="px-4 py-4 text-sm font-semibold text-slate-900">{{ (l.amount || 0).toLocaleString() }} ETB</td>
            <td class="px-4 py-4 text-sm text-slate-600">{{ l.duration }} mo</td>
            <td class="px-4 py-4">
              <span v-if="l.prediction" :class="riskClass(l.prediction.riskLevel)" class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold">
                {{ l.prediction.riskLevel }} {{ l.prediction.riskScore }}
              </span>
              <span v-else class="text-xs text-slate-400">—</span>
            </td>
            <td class="px-4 py-4">
              <span :class="statusClass(l.status)" class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize">{{ formatStatus(l.status) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="p-12 text-center text-slate-400 text-sm">No loan history for this client.</div>
    </div>
  </div>
  <div v-else class="flex items-center justify-center py-24"><div class="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchClientById } from '../../services/api.js'

const route = useRoute()
const client = ref(null)

onMounted(async () => {
  const res = await fetchClientById(route.params.id)
  if (res.success) client.value = res.data
})

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
