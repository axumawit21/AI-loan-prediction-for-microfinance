<template>
  <div v-if="loan" class="space-y-6 animate-fade-in">
    <!-- Back + Title -->
    <div class="flex items-center justify-between">
      <div>
        <button @click="$router.push('/officer/applications')" class="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to Applications
        </button>
        <h1 class="text-xl font-bold text-slate-900">Loan Application #{{ loan._id?.toUpperCase() }}</h1>
        <p class="text-sm text-slate-500 mt-0.5">{{ loan.clientId?.name }} — {{ loan.purpose }}</p>
      </div>
      <span :class="statusClass(loan.status)" class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold capitalize">{{ formatStatus(loan.status) }}</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Loan Details -->
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
            <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Amount Requested</p><p class="text-lg font-bold text-blue-600">{{ (loan.amount || 0).toLocaleString() }} ETB</p></div>
            <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Duration</p><p class="text-sm text-slate-900 font-medium">{{ loan.duration }} months</p></div>
            <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Purpose</p><p class="text-sm text-slate-900 font-medium">{{ loan.purpose }}</p></div>
            <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Monthly Income</p><p class="text-sm text-slate-900 font-medium">{{ (loan.income || 0).toLocaleString() }} ETB</p></div>
            <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Monthly Expenses</p><p class="text-sm text-slate-900 font-medium">{{ (loan.expenses || 0).toLocaleString() }} ETB</p></div>
            <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Membership Duration</p><p class="text-sm text-slate-900 font-medium">{{ loan.membershipDuration }} months</p></div>
          </div>
        </div>

        <!-- Collateral & Guarantor -->
        <div class="bg-white rounded-xl border border-slate-200/60 p-6">
          <h2 class="text-base font-bold text-slate-900 mb-4">Collateral & Guarantor</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Collateral Type</p><p class="text-sm text-slate-900 font-medium capitalize">{{ loan.collateralType || 'None' }}</p></div>
            <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Collateral Value</p><p class="text-sm text-slate-900 font-medium">{{ (loan.collateralValue || 0).toLocaleString() }} ETB</p></div>
            <div><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Guarantor</p><p class="text-sm text-slate-900 font-medium">{{ loan.guarantorName || 'None' }}</p></div>
            <div v-if="loan.guarantorName"><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Guarantor Salary</p><p class="text-sm text-slate-900 font-medium">{{ (loan.guarantorSalary || 0).toLocaleString() }} ETB</p></div>
            <div v-if="loan.guarantorName"><p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Relationship</p><p class="text-sm text-slate-900 font-medium">{{ loan.relationship }}</p></div>
          </div>
        </div>

        <!-- Review Timeline -->
        <div v-if="loan.decisions && loan.decisions.length > 0" class="bg-white rounded-xl border border-slate-200/60 p-6">
          <h2 class="text-base font-bold text-slate-900 mb-4">Review Timeline</h2>
          <div class="space-y-4">
            <div v-for="d in loan.decisions" :key="d._id" class="flex gap-4 items-start pl-4 border-l-2" :class="d.decision === 'approve' ? 'border-emerald-400' : d.decision === 'reject' ? 'border-red-400' : 'border-blue-400'">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-sm font-semibold text-slate-900">{{ d.reviewerId?.name || 'Unknown' }}</span>
                  <span class="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 capitalize">{{ d.reviewerType }}</span>
                </div>
                <p class="text-sm text-slate-600">{{ d.comment }}</p>
                <p class="text-xs text-slate-400 mt-1">{{ formatDate(d.createdAt) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: AI + Actions -->
      <div class="space-y-6">
        <!-- AI Risk Analysis -->
        <div class="bg-gradient-to-b from-slate-50 to-white rounded-xl border border-slate-200/60 p-6">
          <h2 class="text-base font-bold text-slate-900 mb-4">AI Risk Analysis</h2>

          <div v-if="loan.prediction">
            <!-- Gauge -->
            <div class="flex justify-center mb-4">
              <div class="relative w-[180px] h-[100px]">
                <svg viewBox="0 0 180 100" class="w-full h-full">
                  <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke="#e2e8f0" stroke-width="12" stroke-linecap="round" />
                  <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" :stroke="gaugeColor" stroke-width="12" stroke-linecap="round" :stroke-dasharray="gaugeCircumference" :stroke-dashoffset="gaugeOffset" class="transition-all duration-1000" />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-end pb-1">
                  <span class="text-3xl font-bold" :style="{ color: gaugeColor }">{{ loan.prediction.riskScore }}</span>
                  <span class="text-[11px] font-semibold uppercase tracking-wider" :style="{ color: gaugeColor }">{{ loan.prediction.riskLevel }} Risk</span>
                </div>
              </div>
            </div>

            <!-- Recommendation -->
            <div class="text-center mb-4">
              <span :class="recClass" class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold">
                AI Recommends: {{ loan.prediction.recommendation }}
              </span>
            </div>

            <!-- Explanations -->
            <ul class="space-y-2">
              <li v-for="(exp, i) in loan.prediction.explanation" :key="i" class="flex items-start gap-2 text-sm text-slate-600">
                <svg v-if="isPositive(exp)" class="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <svg v-else class="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {{ exp }}
              </li>
            </ul>
          </div>

          <!-- No prediction yet -->
          <div v-else class="text-center py-6">
            <p class="text-sm text-slate-500 mb-4">AI prediction has not been run yet.</p>
            <button @click="handleRunAI" :disabled="runningAI" class="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2 mx-auto">
              <svg v-if="runningAI" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              {{ runningAI ? 'Running AI Analysis...' : 'Run AI Prediction' }}
            </button>
          </div>
        </div>

        <!-- Officer Action Panel -->
        <div v-if="canReview" class="bg-white rounded-xl border border-slate-200/60 p-6">
          <h2 class="text-base font-bold text-slate-900 mb-4">Officer Assessment</h2>
          <textarea v-model="officerComment" rows="4" placeholder="Enter your assessment and recommendation..." class="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all resize-none mb-4"></textarea>
          <button @click="handleForward" :disabled="forwarding || !officerComment" class="w-full px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60">
            {{ forwarding ? 'Forwarding...' : 'Forward to Committee →' }}
          </button>
          <p v-if="forwardSuccess" class="text-sm text-emerald-600 font-medium mt-3 text-center">{{ forwardSuccess }}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading -->
  <div v-else class="flex items-center justify-center py-24">
    <div class="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchLoanById, runAIPrediction, submitOfficerReview } from '../../services/api.js'

const route = useRoute()
const loan = ref(null)
const runningAI = ref(false)
const officerComment = ref('')
const forwarding = ref(false)
const forwardSuccess = ref('')

const canReview = computed(() => loan.value && ['pending', 'officer_review'].includes(loan.value.status))

// Gauge
const gaugeCircumference = 251.3
const gaugeOffset = computed(() => {
  if (!loan.value?.prediction) return gaugeCircumference
  return gaugeCircumference - (loan.value.prediction.riskScore / 100) * gaugeCircumference
})
const gaugeColor = computed(() => {
  if (!loan.value?.prediction) return '#94a3b8'
  const s = loan.value.prediction.riskScore
  return s <= 35 ? '#10b981' : s <= 65 ? '#f59e0b' : '#ef4444'
})
const recClass = computed(() => {
  if (!loan.value?.prediction) return ''
  const r = loan.value.prediction.recommendation
  return r === 'Approve' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : r === 'Reject' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
})

onMounted(async () => {
  const res = await fetchLoanById(route.params.id)
  if (res.success) loan.value = res.data
})

async function handleRunAI() {
  runningAI.value = true
  const res = await runAIPrediction(route.params.id)
  if (res.success) {
    loan.value.prediction = res.data
    loan.value.status = 'officer_review'
  }
  runningAI.value = false
}

async function handleForward() {
  forwarding.value = true
  const res = await submitOfficerReview({ loanId: loan.value._id, comment: officerComment.value })
  if (res.success) {
    forwardSuccess.value = 'Application forwarded to committee!'
    loan.value.status = 'committee_review'
    if (!loan.value.decisions) loan.value.decisions = []
    loan.value.decisions.push(res.data)
  }
  forwarding.value = false
}

function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' }
function formatStatus(s) { return (s || '').replace(/_/g, ' ') }
function statusClass(s) {
  const map = { pending: 'bg-slate-100 text-slate-600', officer_review: 'bg-blue-50 text-blue-700', committee_review: 'bg-amber-50 text-amber-700', approved: 'bg-emerald-50 text-emerald-700', rejected: 'bg-red-50 text-red-600', modification_requested: 'bg-orange-50 text-orange-700' }
  return map[s] || 'bg-slate-100 text-slate-600'
}
function isPositive(text) {
  return /strong|healthy|excellent|good|sufficient|solid|covers \d{2,3}%|lower risk|manageable|affordable|within|short loan/i.test(text)
}
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
