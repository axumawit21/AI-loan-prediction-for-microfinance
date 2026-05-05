<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Clients</h1>
        <p class="text-sm text-slate-500 mt-0.5">Manage your registered SACCO members</p>
      </div>
      <button @click="$router.push('/officer/clients/new')" class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Register Client
      </button>
    </div>

    <!-- Search -->
    <div class="flex gap-4">
      <div class="relative flex-1">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" @input="loadClients" placeholder="Search by name, phone, or business..." class="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all bg-white" />
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
      <table class="w-full" v-if="clients.length > 0">
        <thead>
          <tr class="border-b border-slate-100">
            <th class="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-6 py-3">Client</th>
            <th class="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Business Type</th>
            <th class="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Savings</th>
            <th class="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Member Since</th>
            <th class="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Status</th>
            <th class="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in clients" :key="c._id" class="hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0" @click="$router.push('/officer/clients/' + c._id)">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" :style="{ background: avatarColor(c.name) }">
                  {{ initials(c.name) }}
                </div>
                <div>
                  <div class="text-sm font-semibold text-slate-900">{{ c.name }}</div>
                  <div class="text-xs text-slate-400">{{ c.phone }}</div>
                </div>
              </div>
            </td>
            <td class="px-4 py-4 text-sm text-slate-600">{{ c.businessType }}</td>
            <td class="px-4 py-4 text-sm font-semibold text-slate-900">{{ (c.totalSavings || 0).toLocaleString() }} ETB</td>
            <td class="px-4 py-4 text-xs text-slate-500">{{ formatDate(c.membershipDate) }}</td>
            <td class="px-4 py-4">
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold" :class="c.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'">
                {{ c.status }}
              </span>
            </td>
            <td class="px-4 py-4">
              <button @click.stop="$router.push('/officer/clients/' + c._id)" class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition-colors">
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="p-12 text-center text-slate-400 text-sm">No clients found.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchClients } from '../../services/api.js'

const clients = ref([])
const search = ref('')

async function loadClients() {
  const res = await fetchClients({ search: search.value })
  if (res.success) clients.value = res.data.items
}

onMounted(loadClients)

function initials(name) { return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?' }
function avatarColor(name) { const colors = ['#3b82f6','#10b981','#8b5cf6','#f59e0b','#ef4444','#06b6d4']; return colors[(name || '').length % colors.length] }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-' }
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
