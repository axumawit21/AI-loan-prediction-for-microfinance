<template>
  <div class="space-y-6 animate-fade-in">
    <div>
      <button @click="$router.push('/officer/clients')" class="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Back to Clients
      </button>
      <h1 class="text-xl font-bold text-slate-900">{{ isEdit ? 'Edit Client' : 'Register New Client' }}</h1>
      <p class="text-sm text-slate-500 mt-0.5">{{ isEdit ? 'Update client information' : 'Add a new SACCO member to the system' }}</p>
    </div>

    <div v-if="success" class="px-4 py-3 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg">{{ success }}</div>
    <div v-if="error" class="px-4 py-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg">{{ error }}</div>

    <form @submit.prevent="handleSubmit" class="bg-white rounded-xl border border-slate-200/60 p-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-700">Full Name *</label>
          <input v-model="form.name" required placeholder="Enter full name" class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-700">Phone *</label>
          <input v-model="form.phone" required placeholder="+251..." class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-700">Email</label>
          <input v-model="form.email" type="email" placeholder="email@example.com" class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-700">National ID *</label>
          <input v-model="form.nationalId" required placeholder="ETH-XXXXXXXXXX" class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-700">Gender *</label>
          <select v-model="form.gender" required class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all bg-white">
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-700">Age *</label>
          <input v-model.number="form.age" type="number" min="18" max="100" required placeholder="e.g. 30" class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" />
        </div>
        <div class="flex flex-col gap-1.5 md:col-span-2">
          <label class="text-xs font-semibold text-slate-700">Address *</label>
          <input v-model="form.address" required placeholder="City, Sub-city/Kebele" class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-700">Business Type *</label>
          <select v-model="form.businessType" required class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all bg-white">
            <option value="">Select type</option>
            <option v-for="t in businessTypes" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-700">Membership Duration (months)</label>
          <div class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700">
            {{ computedMembershipMonths }} months
            <span class="text-xs text-slate-400 ml-1">(auto-calculated from savings)</span>
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-700">Total Savings (ETB) *</label>
          <input v-model.number="form.totalSavings" type="number" min="0" required placeholder="0" class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-700">Monthly Savings (ETB) *</label>
          <input v-model.number="form.monthlySavings" type="number" min="0" required placeholder="0" class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" />
        </div>
      </div>

      <div class="flex items-center gap-4 mt-8 pt-6 border-t border-slate-100">
        <button type="submit" :disabled="submitting" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60">
          {{ submitting ? 'Saving...' : (isEdit ? 'Update Client' : 'Register Client') }}
        </button>
        <button type="button" @click="$router.push('/officer/clients')" class="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchClientById, createClient, updateClient } from '../../services/api.js'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)
const form = ref({ name: '', phone: '', email: '', nationalId: '', gender: '', age: '', address: '', businessType: '', totalSavings: 0, monthlySavings: 0 })
const submitting = ref(false)
const error = ref('')
const success = ref('')

const computedMembershipMonths = computed(() => {
  const total = form.value.totalSavings || 0
  const monthly = form.value.monthlySavings || 0
  if (monthly <= 0) return 0
  return Math.round(total / monthly)
})

const businessTypes = ['Retail Trade', 'Manufacturing', 'Agriculture', 'Transport', 'Food Service', 'Construction', 'Textile', 'Wholesale', 'Services', 'Technology']

onMounted(async () => {
  if (isEdit.value) {
    const res = await fetchClientById(route.params.id)
    if (res.success) {
      const c = res.data
      const age = c.dateOfBirth ? Math.floor((Date.now() - new Date(c.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : ''
      form.value = { name: c.name, phone: c.phone, email: c.email || '', nationalId: c.nationalId || '', gender: c.gender || '', age, address: c.address || '', businessType: c.businessType || '', totalSavings: c.totalSavings || 0, monthlySavings: c.monthlySavings || 0 }
    }
  }
})

async function handleSubmit() {
  error.value = ''
  success.value = ''
  submitting.value = true
  try {
    const payload = { ...form.value }
    // Convert age to dateOfBirth
    if (payload.age) {
      const dob = new Date()
      dob.setFullYear(dob.getFullYear() - payload.age)
      payload.dateOfBirth = dob.toISOString().split('T')[0]
    }
    delete payload.age
    // Calculate membershipDate by going back computedMembershipMonths from today
    const months = computedMembershipMonths.value
    const memberDate = new Date()
    memberDate.setMonth(memberDate.getMonth() - months)
    payload.membershipDate = memberDate.toISOString().split('T')[0]
    const res = isEdit.value
      ? await updateClient(route.params.id, payload)
      : await createClient(payload)
    if (res.success) {
      success.value = isEdit.value ? 'Client updated successfully!' : 'Client registered successfully!'
      if (!isEdit.value) {
        setTimeout(() => router.push('/officer/clients/' + res.data._id), 1000)
      }
    } else {
      error.value = res.message
    }
  } catch (e) {
    error.value = 'An error occurred. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
