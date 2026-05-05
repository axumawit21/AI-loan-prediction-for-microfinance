<template>
  <div class="space-y-6">
      <!-- KPI Row -->
      <div class="grid grid-cols-3 gap-6">
        <!-- Total Portfolio -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 flex justify-between items-start shadow-sm hover:shadow-md transition-shadow hover:-translate-y-0.5 duration-200">
          <div class="flex flex-col gap-1">
            <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Total Portfolio</span>
            <span class="text-3xl font-bold text-slate-900 mt-1 leading-none">{{ formatCurrency(stats.totalDisbursed) }}</span>
            <span class="text-xs text-emerald-600 flex items-center gap-1 mt-1">↗ 12.4% vs last month</span>
          </div>
          <div class="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 17l4-4 4 4 6-8 6 4"/></svg>
          </div>
        </div>

        <!-- Pending Decisions -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 flex justify-between items-start shadow-sm hover:shadow-md transition-shadow hover:-translate-y-0.5 duration-200">
          <div class="flex flex-col gap-1">
            <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Pending Decisions</span>
            <span class="text-3xl font-bold text-slate-900 mt-1 leading-none">{{ committeeLoans.length }}</span>
            <span class="text-xs text-slate-500 mt-1">Avg. wait time: 4.2 hours</span>
          </div>
          <div class="w-11 h-11 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 00-8 0v2"/></svg>
          </div>
        </div>

        <!-- High Risk -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 flex justify-between items-start shadow-sm hover:shadow-md transition-shadow hover:-translate-y-0.5 duration-200">
          <div class="flex flex-col gap-1">
            <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">High Risk Flagged</span>
            <span class="text-3xl font-bold text-slate-900 mt-1 leading-none">{{ stats.highRiskLoans }}</span>
            <span class="text-xs text-red-500 flex items-center gap-1 mt-1">! Requires Attention</span>
          </div>
          <div class="w-11 h-11 rounded-lg bg-red-50 flex items-center justify-center text-red-500 flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-[1.4fr_1fr] gap-6">
        <VolumeChart :monthlyData="monthlyTrend" />
        <RiskDonut :distribution="riskDistribution" :totalDisbursed="stats.totalDisbursed" />
      </div>

      <!-- Awaiting Decision Table -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div class="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 class="text-base font-bold text-slate-900">Applications Awaiting Decision</h2>
            <p class="text-xs text-slate-500 mt-0.5">Priority queue for immediate review</p>
          </div>
          <router-link to="/committee/applications" class="text-[13px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
            View All Queue →
          </router-link>
        </div>

        <table class="w-full" v-if="committeeLoans.length > 0">
          <thead>
            <tr>
              <th class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide text-left px-6 py-3 border-b border-slate-100">Applicant</th>
              <th class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide text-left px-4 py-3 border-b border-slate-100">Loan Type</th>
              <th class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide text-left px-4 py-3 border-b border-slate-100">Amount</th>
              <th class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide text-center px-4 py-3 border-b border-slate-100">Risk Score</th>
              <th class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide text-left px-4 py-3 border-b border-slate-100">Status</th>
              <th class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide text-left px-4 py-3 border-b border-slate-100">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(loan, idx) in committeeLoans" :key="loan._id" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4 border-b border-slate-50">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0" :class="avatarBg[idx % avatarBg.length]">
                    {{ getInitials(loan.clientId?.name) }}
                  </div>
                  <div>
                    <div class="text-[13px] font-semibold text-slate-900">{{ loan.clientId?.name }}</div>
                    <div class="text-[11px] text-slate-400">ID: #{{ loan._id.toUpperCase() }}</div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4 border-b border-slate-50 text-[13px] text-slate-600">{{ loan.purpose }}</td>
              <td class="px-4 py-4 border-b border-slate-50 text-[13px] font-semibold text-slate-800">{{ formatETB(loan.amount) }}</td>
              <td class="px-4 py-4 border-b border-slate-50 text-center">
                <div v-if="loan.prediction" class="inline-flex flex-col items-center justify-center w-14 h-9 rounded-md text-xs font-bold leading-none" :class="riskBadgeClass(loan.prediction.riskLevel)">
                  <span class="text-[9px] font-bold uppercase tracking-wide opacity-80">{{ loan.prediction.riskLevel }}</span>
                  <span>{{ loan.prediction.riskScore }}</span>
                </div>
                <span v-else class="text-slate-400 text-xs">—</span>
              </td>
              <td class="px-4 py-4 border-b border-slate-50">
                <div class="flex items-center gap-1.5 text-xs font-medium" :class="statusDotClass(loan)">
                  <span class="w-2 h-2 rounded-full flex-shrink-0" :class="statusDotColor(loan)"></span>
                  {{ statusLabel(loan.status) }}
                </div>
              </td>
              <td class="px-4 py-4 border-b border-slate-50">
                <button @click="$router.push('/committee/applications/' + loan._id)" class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition-colors">
                  Review
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="flex flex-col items-center justify-center py-16 text-center">
          <span class="text-5xl mb-4">✅</span>
          <p class="text-base font-semibold text-slate-600">All caught up!</p>
          <p class="text-sm text-slate-400 mt-1">No applications awaiting your decision.</p>
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import VolumeChart from '../components/dashboard/VolumeChart.vue'
import RiskDonut from '../components/dashboard/RiskDonut.vue'
import { fetchDashboardStats, fetchLoans, fetchRiskDistribution } from '../services/api.js'

const stats = ref({ totalLoans:0, pendingLoans:0, approvedLoans:0, rejectedLoans:0, highRiskLoans:0, totalClients:0, totalDisbursed:0 })
const committeeLoans = ref([])
const riskDistribution = ref({ Low:0, Medium:0, High:0 })
const monthlyTrend = ref([])
const avatarBg = ['bg-blue-600','bg-emerald-600','bg-amber-600','bg-purple-600','bg-teal-600']

onMounted(async () => {
  const [dashRes, loansRes, riskRes] = await Promise.all([
    fetchDashboardStats(),
    fetchLoans({ status:'committee_review', limit:5 }),
    fetchRiskDistribution()
  ])
  if (dashRes.success) stats.value = dashRes.data
  if (loansRes.success) committeeLoans.value = loansRes.data.items
  if (riskRes.success) {
    riskDistribution.value = riskRes.data.distribution
    monthlyTrend.value = riskRes.data.monthlyTrend || []
  }
})

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)
}
function formatCurrency(val) {
  if (val >= 1000000) return (val/1000000).toFixed(1)+'M ETB'
  if (val >= 1000) return (val/1000).toFixed(0)+'K ETB'
  return val+' ETB'
}
function formatETB(val) { return Number(val).toLocaleString()+' ETB' }
function riskBadgeClass(level) {
  if (level==='Low') return 'bg-emerald-50 text-emerald-800'
  if (level==='Medium') return 'bg-orange-50 text-orange-800'
  return 'bg-red-50 text-red-800'
}
function statusDotClass(loan) {
  if (loan.prediction?.riskLevel==='High') return 'text-red-500'
  if (loan.prediction?.riskLevel==='Medium') return 'text-amber-600'
  return 'text-blue-600'
}
function statusDotColor(loan) {
  if (loan.prediction?.riskLevel==='High') return 'bg-red-500'
  if (loan.prediction?.riskLevel==='Medium') return 'bg-amber-500'
  return 'bg-blue-500'
}
function statusLabel(s) {
  const m={pending:'Pending',officer_review:'Officer Review',committee_review:'Pending',approved:'Approved',rejected:'Rejected',modification_requested:'Modification'}
  return m[s]||s
}
</script>
