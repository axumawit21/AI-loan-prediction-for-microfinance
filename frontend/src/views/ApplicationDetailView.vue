<template>
  <div v-if="loan">
      <!-- Back + title -->
      <div class="mb-6">
        <button @click="$router.push('/committee/applications')" class="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to Applications
        </button>
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-xl font-bold text-slate-900">Loan Application #{{ loan._id.toUpperCase() }}</h2>
            <p class="text-[13px] text-slate-500 mt-0.5">{{ loan.clientId?.name }} — {{ loan.purpose }}</p>
          </div>
          <span class="px-4 py-1.5 rounded-full text-xs font-semibold" :class="statusBadgeClass(loan.status)">{{ statusLabel(loan.status) }}</span>
        </div>
      </div>

      <!-- Main grid -->
      <div class="grid grid-cols-[1fr_380px] gap-6 items-start">
        <!-- LEFT -->
        <div class="space-y-5">
          <!-- Client Info -->
          <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 class="text-sm font-bold text-slate-900 mb-5">Client Information</h3>
            <div class="grid grid-cols-3 gap-4">
              <div v-for="item in clientFields" :key="item.label" class="flex flex-col gap-0.5">
                <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{{ item.label }}</span>
                <span class="text-sm font-semibold text-slate-800">{{ item.value }}</span>
              </div>
            </div>
          </div>

          <!-- Loan Details -->
          <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 class="text-sm font-bold text-slate-900 mb-5">Loan Details</h3>
            <div class="grid grid-cols-3 gap-4">
              <div class="flex flex-col gap-0.5">
                <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Amount Requested</span>
                <span class="text-base font-bold text-blue-700">{{ formatETB(loan.amount) }}</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Duration</span>
                <span class="text-sm font-semibold text-slate-800">{{ loan.duration }} months</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Purpose</span>
                <span class="text-sm font-semibold text-slate-800">{{ loan.purpose }}</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Monthly Income</span>
                <span class="text-sm font-semibold text-slate-800">{{ formatETB(loan.income) }}</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Monthly Expenses</span>
                <span class="text-sm font-semibold text-slate-800">{{ formatETB(loan.expenses) }}</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Membership Duration</span>
                <span class="text-sm font-semibold text-slate-800">{{ loan.membershipDuration }} months</span>
              </div>
            </div>
          </div>

          <!-- Collateral & Guarantor -->
          <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 class="text-sm font-bold text-slate-900 mb-5">Collateral & Guarantor</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-0.5">
                <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Collateral Type</span>
                <span class="text-sm font-semibold text-slate-800 capitalize">{{ loan.collateralType }}</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Collateral Value</span>
                <span class="text-sm font-semibold text-slate-800">{{ formatETB(loan.collateralValue) }}</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Guarantor Name</span>
                <span class="text-sm font-semibold text-slate-800">{{ loan.guarantorName || 'None' }}</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Guarantor Salary</span>
                <span class="text-sm font-semibold text-slate-800">{{ loan.guarantorSalary ? formatETB(loan.guarantorSalary) : '—' }}</span>
              </div>
            </div>
          </div>

          <!-- Business Plan -->
          <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 class="text-sm font-bold text-slate-900 mb-5">Business Plan</h3>
            <div class="grid grid-cols-3 gap-4">
              <div class="flex flex-col gap-0.5">
                <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Business Type</span>
                <span class="text-sm font-semibold text-slate-800">{{ loan.businessType }}</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Expected Return</span>
                <span class="text-sm font-semibold text-slate-800">{{ formatETB(loan.expectedReturn) }}</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Family Members (Dependents)</span>
                <span class="text-sm font-semibold text-slate-800">{{ loan.numberOfDependents || 0 }}</span>
              </div>
            </div>
          </div>

          <!-- Review Timeline -->
          <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 class="text-sm font-bold text-slate-900 mb-5">Review Timeline</h3>
            <div class="relative pl-8" v-if="loan.decisions && loan.decisions.length > 0">
              <div class="absolute left-[11px] top-0 bottom-0 w-0.5 bg-slate-200"></div>
              <div v-for="dec in loan.decisions" :key="dec._id" class="relative pb-6 last:pb-0">
                <div class="absolute -left-8 top-1 w-3 h-3 rounded-full border-2 border-white" :class="timelineDotClass(dec.decision)"></div>
                <div class="flex items-center gap-2 mb-0.5">
                  <span class="text-[13px] font-semibold text-slate-900">{{ dec.reviewerId?.name || 'Unknown' }}</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="dec.reviewerType === 'officer' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'">{{ dec.reviewerType }}</span>
                </div>
                <p class="text-[11px] text-slate-400 mb-2">{{ formatDateTime(dec.createdAt) }}</p>
                <p v-if="dec.comment" class="text-[13px] text-slate-600 leading-relaxed bg-slate-50 px-4 py-3 rounded-lg border border-slate-100">{{ dec.comment }}</p>
              </div>
            </div>
            <p v-else class="text-sm text-slate-400">No reviews yet.</p>
          </div>
        </div>

        <!-- RIGHT SIDE -->
        <div class="sticky top-24 space-y-5">
          <!-- AI Analysis -->
          <div v-if="loan.prediction" class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 class="text-sm font-bold text-slate-900 mb-4">AI Risk Analysis</h3>

            <!-- Gauge -->
            <div class="flex flex-col items-center mb-4">
              <div class="relative w-44 h-44">
                <svg class="-rotate-90" width="176" height="176" viewBox="0 0 176 176">
                  <circle cx="88" cy="88" r="76" fill="none" stroke="#E2E8F0" stroke-width="12"/>
                  <circle cx="88" cy="88" r="76" fill="none" :stroke="riskColor" stroke-width="12" stroke-linecap="round" :stroke-dasharray="circumference" :stroke-dashoffset="dashOffset"/>
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-4xl font-bold leading-none" :style="{color: riskColor}">{{ loan.prediction.riskScore }}</span>
                  <span class="text-[11px] font-bold uppercase tracking-wider mt-1" :style="{color: riskColor}">{{ loan.prediction.riskLevel }} Risk</span>
                </div>
              </div>
            </div>

            <!-- Recommendation badge -->
            <div class="flex justify-center mb-5">
              <span class="px-4 py-1.5 rounded-full text-xs font-bold" :class="recBadgeClass">
                AI Recommends: {{ loan.prediction.recommendation }}
              </span>
            </div>

            <!-- Explanations -->
            <div class="space-y-2.5">
              <div v-for="(exp, i) in loan.prediction.explanation" :key="i" class="flex items-start gap-2 text-[13px] text-slate-600 leading-relaxed">
                <svg v-if="isPositive(exp)" class="mt-0.5 flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <svg v-else class="mt-0.5 flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>{{ exp }}</span>
              </div>
            </div>
          </div>

          <!-- Officer Assessment -->
          <div v-if="officerDecision" class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 class="text-sm font-bold text-slate-900 mb-4">Officer Assessment</h3>
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                {{ getInitials(officerDecision.reviewerId?.name) }}
              </div>
              <div>
                <p class="text-[13px] font-semibold text-slate-900">{{ officerDecision.reviewerId?.name }}</p>
                <p class="text-[11px] text-slate-400">{{ formatDateTime(officerDecision.createdAt) }}</p>
              </div>
            </div>
            <p class="text-[13px] text-slate-600 leading-relaxed bg-slate-50 px-4 py-3 rounded-lg border border-slate-100">{{ officerDecision.comment }}</p>
          </div>

          <!-- Decision Panel -->
          <div v-if="loan.status === 'committee_review'" class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 class="text-sm font-bold text-slate-900 mb-4">Make Decision</h3>
            <textarea
              v-model="comment"
              placeholder="Add your review comments..."
              class="w-full min-h-[100px] px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 resize-y transition-all"
            ></textarea>

            <div v-if="submitError" class="mt-3 text-xs text-red-600 font-medium">{{ submitError }}</div>
            <div v-if="submitSuccess" class="mt-3 text-xs text-emerald-600 font-semibold">{{ submitSuccess }}</div>

            <div class="flex gap-2 mt-4">
              <button @click="handleDecision('approve')" :disabled="submitting" class="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Approve
              </button>
              <button @click="handleDecision('reject')" :disabled="submitting" class="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Reject
              </button>
              <button @click="handleDecision('request_modification')" :disabled="submitting" class="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Revise
              </button>
            </div>
          </div>

          <!-- Final state -->
          <div v-if="loan.status === 'approved' || loan.status === 'rejected'" class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-center">
            <div class="text-4xl mb-3">{{ loan.status === 'approved' ? '✅' : '❌' }}</div>
            <p class="text-base font-bold text-slate-900">Loan {{ loan.status === 'approved' ? 'Approved' : 'Rejected' }}</p>
            <p class="text-xs text-slate-400 mt-1">Decision has been finalized.</p>
          </div>
        </div>
      </div>
    </div>

  <!-- Loading -->
  <div v-else class="flex items-center justify-center h-60">
    <svg class="animate-spin w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { fetchLoanById, submitCommitteeDecision } from '../services/api.js'

const route = useRoute()
const router = useRouter()
const loan = ref(null)
const comment = ref('')
const submitting = ref(false)
const submitError = ref('')
const submitSuccess = ref('')

onMounted(async () => {
  const res = await fetchLoanById(route.params.id)
  if (res.success) loan.value = res.data
})

const circumference = 2 * Math.PI * 76
const dashOffset = computed(() => loan.value?.prediction
  ? circumference - (loan.value.prediction.riskScore / 100) * circumference
  : circumference)

const riskColor = computed(() => {
  const level = loan.value?.prediction?.riskLevel
  if (level === 'Low') return '#16A34A'
  if (level === 'Medium') return '#F59E0B'
  return '#DC2626'
})

const recBadgeClass = computed(() => {
  const r = loan.value?.prediction?.recommendation
  if (r === 'Approve') return 'bg-emerald-50 text-emerald-700'
  if (r === 'Reject') return 'bg-red-50 text-red-700'
  return 'bg-amber-50 text-amber-700'
})

const officerDecision = computed(() => loan.value?.decisions?.find(d => d.reviewerType === 'officer'))

const clientFields = computed(() => loan.value ? [
  { label: 'Full Name', value: loan.value.clientId?.name || '—' },
  { label: 'Phone', value: loan.value.clientId?.phone || '—' },
  { label: 'Email', value: loan.value.clientId?.email || '—' },
  { label: 'Business Type', value: loan.value.clientId?.businessType || '—' },
  { label: 'Member Since', value: formatDate(loan.value.clientId?.membershipDate) },
  { label: 'Total Savings', value: formatETB(loan.value.clientId?.totalSavings) },
] : [])

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)
}
function formatETB(val) { return val ? Number(val).toLocaleString()+' ETB' : '—' }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—' }
function formatDateTime(d) { return d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '' }
function isPositive(text) {
  return /strong|healthy|excellent|good|sufficient|solid|covers \d{2,3}%|lower risk|manageable|affordable|within|short loan/i.test(text)
}
function timelineDotClass(decision) {
  if (decision==='approve') return 'bg-emerald-500'
  if (decision==='reject') return 'bg-red-500'
  if (decision==='request_modification') return 'bg-amber-500'
  return 'bg-blue-500'
}
function statusBadgeClass(s) {
  if (s==='approved') return 'bg-emerald-50 text-emerald-700'
  if (s==='rejected') return 'bg-red-50 text-red-700'
  if (s==='committee_review') return 'bg-blue-50 text-blue-700'
  if (s==='modification_requested') return 'bg-slate-100 text-slate-600'
  return 'bg-amber-50 text-amber-700'
}
function statusLabel(s) {
  const m={pending:'Pending',officer_review:'Officer Review',committee_review:'Committee Review',approved:'Approved',rejected:'Rejected',modification_requested:'Modification Requested'}
  return m[s]||s
}
async function handleDecision(decision) {
  if (!comment.value.trim()) { submitError.value = 'Please add a comment before submitting.'; return }
  submitting.value = true; submitError.value = ''; submitSuccess.value = ''
  const res = await submitCommitteeDecision({ loanId: loan.value._id, decision, comment: comment.value })
  submitting.value = false
  if (res.success) {
    submitSuccess.value = res.message
    const updated = await fetchLoanById(route.params.id)
    if (updated.success) loan.value = updated.data
    comment.value = ''
  } else {
    submitError.value = res.message
  }
}
</script>
