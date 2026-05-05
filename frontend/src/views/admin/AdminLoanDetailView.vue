<template>
  <div v-if="loan" class="space-y-6 animate-fade-in">
    <div>
      <button @click="$router.push('/admin/loans')" class="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Back to All Loans
      </button>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-slate-900">Loan #{{ loan._id?.toUpperCase() }}</h1>
          <p class="text-sm text-slate-500 mt-0.5">{{ loan.clientId?.name }} — {{ loan.purpose }}</p>
        </div>
        <span :class="statusClass(loan.status)" class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold capitalize">{{ formatStatus(loan.status) }}</span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <!-- Client Info -->
        <div class="bg-white rounded-xl border border-slate-200/60 p-6">
          <h2 class="text-base font-bold text-slate-900 mb-4">Client Information</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Full Name</p><p class="text-sm text-slate-900 font-medium">{{ loan.clientId?.name }}</p></div>
            <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Phone</p><p class="text-sm text-slate-900 font-medium">{{ loan.clientId?.phone }}</p></div>
            <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Email</p><p class="text-sm text-slate-900 font-medium">{{ loan.clientId?.email || '—' }}</p></div>
            <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Business Type</p><p class="text-sm text-slate-900 font-medium">{{ loan.clientId?.businessType }}</p></div>
            <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Member Since</p><p class="text-sm text-slate-900 font-medium">{{ formatDate(loan.clientId?.membershipDate) }}</p></div>
            <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Total Savings</p><p class="text-sm font-bold text-emerald-600">{{ (loan.clientId?.totalSavings || 0).toLocaleString() }} ETB</p></div>
          </div>
        </div>

        <!-- Loan Details -->
        <div class="bg-white rounded-xl border border-slate-200/60 p-6">
          <h2 class="text-base font-bold text-slate-900 mb-4">Loan Details</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Amount</p><p class="text-lg font-bold text-blue-600">{{ (loan.amount || 0).toLocaleString() }} ETB</p></div>
            <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Duration</p><p class="text-sm text-slate-900 font-medium">{{ loan.duration }} months</p></div>
            <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Purpose</p><p class="text-sm text-slate-900 font-medium">{{ loan.purpose }}</p></div>
            <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Monthly Income</p><p class="text-sm text-slate-900 font-medium">{{ (loan.income || 0).toLocaleString() }} ETB</p></div>
            <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Monthly Expenses</p><p class="text-sm text-slate-900 font-medium">{{ (loan.expenses || 0).toLocaleString() }} ETB</p></div>
            <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Assigned Officer</p><p class="text-sm text-slate-900 font-medium">{{ loan.assignedOfficer?.name || '—' }}</p></div>
          </div>
        </div>

        <!-- Collateral -->
        <div class="bg-white rounded-xl border border-slate-200/60 p-6">
          <h2 class="text-base font-bold text-slate-900 mb-4">Collateral & Guarantor</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Collateral Type</p><p class="text-sm text-slate-900 font-medium capitalize">{{ loan.collateralType || 'None' }}</p></div>
            <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Collateral Value</p><p class="text-sm text-slate-900 font-medium">{{ (loan.collateralValue || 0).toLocaleString() }} ETB</p></div>
            <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Guarantor</p><p class="text-sm text-slate-900 font-medium">{{ loan.guarantorName || 'None' }}</p></div>
          </div>
        </div>

        <!-- Full Audit Trail -->
        <div v-if="loan.decisions && loan.decisions.length > 0" class="bg-white rounded-xl border border-slate-200/60 p-6">
          <h2 class="text-base font-bold text-slate-900 mb-4">Full Audit Trail</h2>
          <div class="space-y-4">
            <div v-for="d in loan.decisions" :key="d._id" class="flex gap-4 items-start pl-4 border-l-2" :class="d.decision === 'approve' ? 'border-emerald-400' : d.decision === 'reject' ? 'border-red-400' : 'border-blue-400'">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-sm font-semibold text-slate-900">{{ d.reviewerId?.name || 'Unknown' }}</span>
                  <span class="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 capitalize">{{ d.reviewerType }}</span>
                  <span class="text-[11px] px-2 py-0.5 rounded-full capitalize" :class="d.decision === 'approve' ? 'bg-emerald-50 text-emerald-600' : d.decision === 'reject' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'">{{ d.decision?.replace(/_/g, ' ') }}</span>
                </div>
                <p class="text-sm text-slate-600">{{ d.comment }}</p>
                <p class="text-xs text-slate-400 mt-1">{{ formatDate(d.createdAt) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: AI Analysis (read-only) -->
      <div class="space-y-6">
        <div v-if="loan.prediction" class="bg-gradient-to-b from-slate-50 to-white rounded-xl border border-slate-200/60 p-6">
          <h2 class="text-base font-bold text-slate-900 mb-4">AI Risk Analysis</h2>
          <div class="flex justify-center mb-4">
            <div class="relative w-[180px] h-[100px]">
              <svg viewBox="0 0 180 100" class="w-full h-full">
                <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke="#e2e8f0" stroke-width="12" stroke-linecap="round"/>
                <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" :stroke="gaugeColor" stroke-width="12" stroke-linecap="round" :stroke-dasharray="251.3" :stroke-dashoffset="251.3 - (loan.prediction.riskScore / 100) * 251.3" class="transition-all duration-1000"/>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-end pb-1">
                <span class="text-3xl font-bold" :style="{ color: gaugeColor }">{{ loan.prediction.riskScore }}</span>
                <span class="text-[11px] font-semibold uppercase tracking-wider" :style="{ color: gaugeColor }">{{ loan.prediction.riskLevel }} Risk</span>
              </div>
            </div>
          </div>
          <div class="text-center mb-4">
            <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border" :class="loan.prediction.recommendation === 'Approve' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : loan.prediction.recommendation === 'Reject' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'">
              AI Recommends: {{ loan.prediction.recommendation }}
            </span>
          </div>
          <ul class="space-y-2">
            <li v-for="(exp, i) in loan.prediction.explanation" :key="i" class="flex items-start gap-2 text-sm text-slate-600">
              <svg class="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              {{ exp }}
            </li>
          </ul>
        </div>
        <div v-else class="bg-white rounded-xl border border-slate-200/60 p-6 text-center">
          <p class="text-sm text-slate-400">No AI prediction available</p>
        </div>

        <!-- Admin Note -->
        <div class="bg-violet-50 rounded-xl border border-violet-200 p-4">
          <p class="text-xs font-semibold text-violet-700 uppercase tracking-wider mb-1">Admin View</p>
          <p class="text-sm text-violet-600">This is a read-only view. Loan decisions are made by the Committee.</p>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="flex items-center justify-center py-24"><div class="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div></div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchLoanById } from '../../services/api.js'

const route = useRoute()
const loan = ref(null)

const gaugeColor = computed(() => {
  if (!loan.value?.prediction) return '#94a3b8'
  const s = loan.value.prediction.riskScore
  return s <= 35 ? '#10b981' : s <= 65 ? '#f59e0b' : '#ef4444'
})

onMounted(async () => {
  const res = await fetchLoanById(route.params.id)
  if (res.success) loan.value = res.data
})

function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' }
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
