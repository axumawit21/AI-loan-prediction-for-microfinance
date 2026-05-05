<template>
  <div class="space-y-5">
      <!-- Filters -->
      <div class="flex items-center gap-4 flex-wrap">
        <div class="relative flex-1 min-w-[240px]">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input
            v-model="search" type="text"
            placeholder="Search by client name or purpose..."
            class="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
            @input="debouncedFetch"
          />
        </div>
        <select v-model="statusFilter" @change="fetchData" class="min-w-[160px] px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 cursor-pointer appearance-none transition-all">
          <option value="">All Statuses</option>
          <option value="committee_review">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select v-model="riskFilter" @change="fetchData" class="min-w-[160px] px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 cursor-pointer appearance-none transition-all">
          <option value="">All Risk Levels</option>
          <option value="Low">Low Risk</option>
          <option value="Medium">Medium Risk</option>
          <option value="High">High Risk</option>
        </select>
      </div>

      <!-- Table -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table class="w-full" v-if="loans.length > 0">
          <thead>
            <tr class="border-b border-slate-100">
              <th class="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Applicant</th>
              <th class="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Purpose</th>
              <th class="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Amount</th>
              <th class="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Duration</th>
              <th class="text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Risk</th>
              <th class="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Status</th>
              <th class="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Date</th>
              <th class="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(loan, idx) in loans" :key="loan._id"
              class="hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0"
              @click="$router.push('/committee/applications/' + loan._id)"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0" :class="avatarBg[idx % avatarBg.length]">
                    {{ getInitials(loan.clientId?.name) }}
                  </div>
                  <div>
                    <div class="text-[13px] font-semibold text-slate-900">{{ loan.clientId?.name }}</div>
                    <div class="text-[11px] text-slate-400">{{ loan.clientId?.phone }}</div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4 text-[13px] text-slate-600">{{ loan.purpose }}</td>
              <td class="px-4 py-4 text-[13px] font-semibold text-slate-800">{{ formatETB(loan.amount) }}</td>
              <td class="px-4 py-4 text-[13px] text-slate-600">{{ loan.duration }} mo</td>
              <td class="px-4 py-4 text-center">
                <div v-if="loan.prediction" class="inline-flex flex-col items-center justify-center w-14 h-9 rounded-md text-xs font-bold leading-tight" :class="riskBadgeClass(loan.prediction.riskLevel)">
                  <span class="text-[9px] uppercase tracking-wide opacity-80">{{ loan.prediction.riskLevel }}</span>
                  <span class="text-sm">{{ loan.prediction.riskScore }}</span>
                </div>
                <span v-else class="text-slate-400 text-xs">N/A</span>
              </td>
              <td class="px-4 py-4">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold" :class="statusBadgeClass(loan.status)">
                  {{ statusLabel(loan.status) }}
                </span>
              </td>
              <td class="px-4 py-4 text-xs text-slate-500">{{ formatDate(loan.createdAt) }}</td>
              <td class="px-4 py-4">
                <button
                  @click.stop="$router.push('/committee/applications/' + loan._id)"
                  class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition-colors"
                >
                  {{ loan.status === 'committee_review' ? 'Review' : 'View' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="flex flex-col items-center justify-center py-20 text-center">
          <span class="text-5xl mb-4">📋</span>
          <p class="text-base font-semibold text-slate-600">No applications found</p>
          <p class="text-sm text-slate-400 mt-1">Try adjusting your filters.</p>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          <span class="text-xs text-slate-500">
            Showing {{ (page - 1) * limit + 1 }}–{{ Math.min(page * limit, total) }} of {{ total }}
          </span>
          <div class="flex gap-1">
            <button class="w-8 h-8 flex items-center justify-center rounded text-sm text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors" :disabled="page <= 1" @click="page--; fetchData()">‹</button>
            <button v-for="p in visiblePages" :key="p"
              class="w-8 h-8 flex items-center justify-center rounded text-sm border transition-colors"
              :class="p === page ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'"
              @click="page = p; fetchData()"
            >{{ p }}</button>
            <button class="w-8 h-8 flex items-center justify-center rounded text-sm text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors" :disabled="page >= totalPages" @click="page++; fetchData()">›</button>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

import { fetchLoans } from '../services/api.js'

const route = useRoute()
const loans = ref([])
const search = ref('')
const statusFilter = ref(route.query.status || '')
const riskFilter = ref('')
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const totalPages = ref(0)
const avatarBg = ['bg-blue-600','bg-emerald-600','bg-amber-600','bg-purple-600','bg-teal-600']

let debounceTimer = null
function debouncedFetch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; fetchData() }, 300)
}

async function fetchData() {
  const res = await fetchLoans({ page: page.value, limit: limit.value, status: statusFilter.value, search: search.value, riskLevel: riskFilter.value })
  if (res.success) { loans.value = res.data.items; total.value = res.data.total; totalPages.value = res.data.totalPages }
}

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, page.value - 2)
  const end = Math.min(totalPages.value, page.value + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)
}
function formatETB(val) { return Number(val).toLocaleString()+' ETB' }
function formatDate(d) { return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) }
function riskBadgeClass(level) {
  if (level==='Low') return 'bg-emerald-50 text-emerald-800'
  if (level==='Medium') return 'bg-orange-50 text-orange-800'
  return 'bg-red-50 text-red-800'
}
function statusBadgeClass(s) {
  if (s==='approved') return 'bg-emerald-50 text-emerald-700'
  if (s==='rejected') return 'bg-red-50 text-red-700'
  if (s==='committee_review') return 'bg-blue-50 text-blue-700'
  if (s==='officer_review') return 'bg-indigo-50 text-indigo-700'
  if (s==='modification_requested') return 'bg-slate-100 text-slate-600'
  return 'bg-amber-50 text-amber-700'
}
function statusLabel(s) {
  const m={pending:'Pending',officer_review:'Officer Review',committee_review:'Pending',approved:'Approved',rejected:'Rejected',modification_requested:'Modification',disbursed:'Disbursed',closed:'Closed'}
  return m[s]||s
}
onMounted(fetchData)
</script>
