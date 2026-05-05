<template>
  <div class="space-y-6 animate-fade-in">
    <div>
      <h1 class="text-xl font-bold text-slate-900">System Reports</h1>
      <p class="text-sm text-slate-500 mt-0.5">Analytics, trends, and performance metrics</p>
    </div>

    <!-- Summary KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl border border-slate-200/60 p-5">
        <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Approval Rate</span>
        <div class="text-2xl font-bold text-emerald-600 mt-2">{{ approvalRate }}%</div>
      </div>
      <div class="bg-white rounded-xl border border-slate-200/60 p-5">
        <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Avg Risk Score</span>
        <div class="text-2xl font-bold text-amber-600 mt-2">{{ avgRiskScore }}</div>
      </div>
      <div class="bg-white rounded-xl border border-slate-200/60 p-5">
        <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Users</span>
        <div class="text-2xl font-bold text-blue-600 mt-2">{{ totalUsers }}</div>
      </div>
      <div class="bg-white rounded-xl border border-slate-200/60 p-5">
        <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Officers</span>
        <div class="text-2xl font-bold text-violet-600 mt-2">{{ activeOfficers }}</div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Risk Distribution -->
      <div class="bg-white rounded-xl border border-slate-200/60 p-6">
        <h2 class="text-base font-bold text-slate-900 mb-4">Risk Distribution</h2>
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <span class="w-20 text-sm font-medium text-slate-600">Low</span>
            <div class="flex-1 h-8 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full bg-emerald-500 rounded-full transition-all duration-700" :style="{ width: riskPercent('Low') + '%' }"></div>
            </div>
            <span class="w-10 text-right text-sm font-bold text-slate-900">{{ distribution.Low || 0 }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="w-20 text-sm font-medium text-slate-600">Medium</span>
            <div class="flex-1 h-8 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full bg-amber-500 rounded-full transition-all duration-700" :style="{ width: riskPercent('Medium') + '%' }"></div>
            </div>
            <span class="w-10 text-right text-sm font-bold text-slate-900">{{ distribution.Medium || 0 }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="w-20 text-sm font-medium text-slate-600">High</span>
            <div class="flex-1 h-8 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full bg-red-500 rounded-full transition-all duration-700" :style="{ width: riskPercent('High') + '%' }"></div>
            </div>
            <span class="w-10 text-right text-sm font-bold text-slate-900">{{ distribution.High || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Monthly Trend -->
      <div class="bg-white rounded-xl border border-slate-200/60 p-6">
        <h2 class="text-base font-bold text-slate-900 mb-4">Monthly Application Trends</h2>
        <div class="space-y-3">
          <div v-for="m in monthlyTrend" :key="m.month" class="flex items-center gap-3">
            <span class="w-20 text-xs font-medium text-slate-500">{{ formatMonth(m.month) }}</span>
            <div class="flex-1 flex gap-1 h-6">
              <div class="bg-blue-500 rounded-sm h-full transition-all duration-700" :style="{ width: trendPercent(m.total) + '%' }" :title="'Total: ' + m.total"></div>
              <div class="bg-emerald-500 rounded-sm h-full transition-all duration-700" :style="{ width: trendPercent(m.approved) + '%' }" :title="'Approved: ' + m.approved"></div>
              <div class="bg-red-400 rounded-sm h-full transition-all duration-700" :style="{ width: trendPercent(m.rejected) + '%' }" :title="'Rejected: ' + m.rejected"></div>
            </div>
            <span class="w-8 text-right text-xs font-bold text-slate-900">{{ m.total }}</span>
          </div>
        </div>
        <div class="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
          <span class="flex items-center gap-1.5 text-xs text-slate-500"><span class="w-2.5 h-2.5 rounded-sm bg-blue-500"></span> Total</span>
          <span class="flex items-center gap-1.5 text-xs text-slate-500"><span class="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Approved</span>
          <span class="flex items-center gap-1.5 text-xs text-slate-500"><span class="w-2.5 h-2.5 rounded-sm bg-red-400"></span> Rejected</span>
        </div>
      </div>

      <!-- Loan Status Breakdown -->
      <div class="bg-white rounded-xl border border-slate-200/60 p-6">
        <h2 class="text-base font-bold text-slate-900 mb-4">Loan Status Overview</h2>
        <div class="space-y-3">
          <div v-for="(val, key) in statusBreakdown" :key="key" class="flex items-center gap-3">
            <span class="w-36 text-xs font-medium text-slate-500 capitalize">{{ key.replace(/_/g, ' ') }}</span>
            <div class="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
              <div :class="statusBarColor(key)" class="h-full rounded-full transition-all duration-700" :style="{ width: statusPercent(val) + '%' }"></div>
            </div>
            <span class="w-8 text-right text-sm font-bold text-slate-900">{{ val }}</span>
          </div>
        </div>
      </div>

      <!-- Team Composition -->
      <div class="bg-white rounded-xl border border-slate-200/60 p-6">
        <h2 class="text-base font-bold text-slate-900 mb-4">Team Composition</h2>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="(val, key) in roleBreakdown" :key="key" class="p-4 rounded-lg" :class="roleBg(key)">
            <p class="text-2xl font-bold">{{ val }}</p>
            <p class="text-xs font-semibold uppercase tracking-wider mt-1 capitalize">{{ key.replace(/_/g, ' ') }}{{ val !== 1 ? 's' : '' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchRiskDistribution, fetchAdminStats } from '../../services/api.js'

const approvalRate = ref(0)
const avgRiskScore = ref(0)
const totalUsers = ref(0)
const activeOfficers = ref(0)
const distribution = ref({})
const monthlyTrend = ref([])
const statusBreakdown = ref({})
const roleBreakdown = ref({})
const totalLoans = ref(0)
const maxTrend = ref(1)

onMounted(async () => {
  const [riskRes, adminRes] = await Promise.all([fetchRiskDistribution(), fetchAdminStats()])
  if (riskRes.success) {
    distribution.value = riskRes.data.distribution
    monthlyTrend.value = riskRes.data.monthlyTrend
    approvalRate.value = riskRes.data.approvalRate
    avgRiskScore.value = riskRes.data.averageRiskScore
    maxTrend.value = Math.max(...riskRes.data.monthlyTrend.map(m => m.total), 1)
  }
  if (adminRes.success) {
    totalUsers.value = adminRes.data.totalUsers
    activeOfficers.value = adminRes.data.activeOfficers
    statusBreakdown.value = adminRes.data.statusBreakdown
    roleBreakdown.value = adminRes.data.roleBreakdown
    totalLoans.value = adminRes.data.totalLoans
  }
})

function riskPercent(level) {
  const total = (distribution.value.Low || 0) + (distribution.value.Medium || 0) + (distribution.value.High || 0)
  return total > 0 ? Math.max(4, ((distribution.value[level] || 0) / total) * 100) : 0
}
function trendPercent(val) { return Math.max(4, (val / maxTrend.value) * 100) }
function statusPercent(val) { return totalLoans.value > 0 ? Math.max(4, (val / totalLoans.value) * 100) : 0 }
function formatMonth(m) { const [y, mo] = m.split('-'); const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return months[parseInt(mo)-1] + ' ' + y.slice(2) }
function statusBarColor(key) {
  const map = { pending: 'bg-slate-400', officer_review: 'bg-blue-500', committee_review: 'bg-amber-500', approved: 'bg-emerald-500', rejected: 'bg-red-500', modification_requested: 'bg-orange-500' }
  return map[key] || 'bg-slate-400'
}
function roleBg(key) {
  const map = { admin: 'bg-violet-50 text-violet-700', loan_officer: 'bg-blue-50 text-blue-700', committee: 'bg-amber-50 text-amber-700' }
  return map[key] || 'bg-slate-50 text-slate-700'
}
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
