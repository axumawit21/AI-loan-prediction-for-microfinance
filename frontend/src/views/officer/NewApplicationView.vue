<template>
  <div class="space-y-6 animate-fade-in">
    <div>
      <button @click="$router.push('/officer/applications')" class="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Back to Applications
      </button>
      <h1 class="text-xl font-bold text-slate-900">New Loan Application</h1>
      <p class="text-sm text-slate-500 mt-0.5">Step {{ step }} of 5 — {{ stepLabels[step - 1] }}</p>
    </div>

    <!-- Step Progress -->
    <div class="flex items-center gap-2">
      <div v-for="s in 5" :key="s" class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
             :class="s <= step ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'">
          <svg v-if="s < step" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          <span v-else>{{ s }}</span>
        </div>
        <div v-if="s < 5" class="w-12 h-0.5 transition-all" :class="s < step ? 'bg-blue-600' : 'bg-slate-200'"></div>
      </div>
    </div>

    <div v-if="success" class="px-4 py-3 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg">{{ success }}</div>
    <div v-if="error" class="px-4 py-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg">{{ error }}</div>

    <form @submit.prevent="handleNext" class="bg-white rounded-xl border border-slate-200/60 p-8">
      <!-- Step 1: Client -->
      <div v-if="step === 1" class="space-y-6">
        <h2 class="text-base font-bold text-slate-900 mb-4">Select Client</h2>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-700">Search Client *</label>
          <input v-model="clientSearch" @input="searchClients" placeholder="Type client name..." class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" />
        </div>
        <div v-if="clientResults.length > 0" class="border border-slate-200 rounded-lg max-h-60 overflow-auto">
          <div v-for="c in clientResults" :key="c._id" @click="selectClient(c)" class="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-slate-100 last:border-0" :class="form.clientId === c._id ? 'bg-blue-50' : ''">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" :style="{ background: avatarColor(c.name) }">{{ initials(c.name) }}</div>
            <div>
              <div class="text-sm font-semibold text-slate-900">{{ c.name }}</div>
              <div class="text-xs text-slate-400">{{ c.phone }} · {{ c.businessType }}</div>
            </div>
            <svg v-if="form.clientId === c._id" class="ml-auto text-blue-600" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>
        <div v-if="selectedClient" class="p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm">
          <span class="font-semibold text-blue-900">Selected:</span> {{ selectedClient.name }} · Savings: {{ (selectedClient.totalSavings || 0).toLocaleString() }} ETB
        </div>
      </div>

      <!-- Step 2: Loan Details -->
      <div v-if="step === 2" class="space-y-6">
        <h2 class="text-base font-bold text-slate-900 mb-4">Loan Details</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-700">Loan Amount (ETB) *</label>
            <input v-model.number="form.amount" type="number" min="1000" required placeholder="100000" class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-700">Duration (months) *</label>
            <select v-model.number="form.duration" required class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all bg-white">
              <option v-for="d in [3,6,12,18,24,36,48]" :key="d" :value="d">{{ d }} months</option>
            </select>
          </div>
          <div class="flex flex-col gap-1.5 md:col-span-2">
            <label class="text-xs font-semibold text-slate-700">Purpose *</label>
            <input v-model="form.purpose" required placeholder="Business Expansion, Equipment Purchase..." class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-700">Monthly Income (ETB) *</label>
            <input v-model.number="form.income" type="number" min="0" required placeholder="15000" class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-700">Monthly Expenses (ETB) *</label>
            <input v-model.number="form.expenses" type="number" min="0" required placeholder="8000" class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-700">Family Members (Dependents) *</label>
            <input v-model.number="form.numberOfDependents" type="number" min="0" max="15" required placeholder="3" class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" />
          </div>
        </div>
      </div>

      <!-- Step 3: Collateral -->
      <div v-if="step === 3" class="space-y-6">
        <h2 class="text-base font-bold text-slate-900 mb-4">Collateral Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-700">Collateral Type *</label>
            <select v-model="form.collateralType" required class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all bg-white">
              <option value="none">None</option>
              <option value="property">Property</option>
              <option value="vehicle">Vehicle</option>
              <option value="equipment">Equipment</option>
              <option value="livestock">Livestock</option>
              <option value="savings">Savings</option>
            </select>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-700">Collateral Value (ETB) *</label>
            <input v-model.number="form.collateralValue" type="number" min="0" required placeholder="0" class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-700">Guarantor Name *</label>
            <input v-model="form.guarantorName" required placeholder="Full name" class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-700">Guarantor Member ID</label>
            <input v-model="form.guarantorMemberId" placeholder="MEM-XXXX" class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-700">Guarantor Salary (ETB) *</label>
            <input v-model.number="form.guarantorSalary" type="number" min="0" required placeholder="0" class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-700">Relationship</label>
            <input v-model="form.relationship" placeholder="Business Partner, Family..." class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" />
          </div>
        </div>
      </div>

      <!-- Step 4: Business Plan -->
      <div v-if="step === 4" class="space-y-6">
        <h2 class="text-base font-bold text-slate-900 mb-4">Business Plan</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-700">Business Type *</label>
            <select v-model="form.businessType" required class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all bg-white">
              <option value="" disabled>Select business type</option>
              <option value="Retail Trade">Retail Trade</option>
              <option value="Wholesale">Wholesale</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Construction">Construction</option>
              <option value="Transport">Transport</option>
              <option value="Food & Beverage">Food & Beverage</option>
              <option value="Services">Services</option>
              <option value="Technology">Technology</option>
              <option value="Education">Education</option>
              <option value="Health">Health</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-700">Expected Monthly Return (ETB) *</label>
            <input v-model.number="form.expectedReturn" type="number" min="0" required placeholder="25000" class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" />
          </div>
          <div v-if="form.businessType === 'Other'" class="flex flex-col gap-1.5 md:col-span-2">
            <label class="text-xs font-semibold text-slate-700">Specify Business Type *</label>
            <textarea v-model="form.businessTypeOther" required rows="2" placeholder="Describe the type of business..." class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all resize-none"></textarea>
          </div>
        </div>
      </div>

      <!-- Step 5: Review -->
      <div v-if="step === 5" class="space-y-6">
        <h2 class="text-base font-bold text-slate-900 mb-4">Review & Submit</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="p-4 bg-slate-50 rounded-lg">
            <p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Client</p>
            <p class="text-sm font-semibold text-slate-900">{{ selectedClient?.name || '—' }}</p>
          </div>
          <div class="p-4 bg-slate-50 rounded-lg">
            <p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Amount</p>
            <p class="text-sm font-bold text-blue-600">{{ (form.amount || 0).toLocaleString() }} ETB / {{ form.duration }} months</p>
          </div>
          <div class="p-4 bg-slate-50 rounded-lg">
            <p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Purpose</p>
            <p class="text-sm text-slate-900">{{ form.purpose }}</p>
          </div>
          <div class="p-4 bg-slate-50 rounded-lg">
            <p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Collateral</p>
            <p class="text-sm text-slate-900 capitalize">{{ form.collateralType }} — {{ (form.collateralValue || 0).toLocaleString() }} ETB</p>
          </div>
          <div class="p-4 bg-slate-50 rounded-lg">
            <p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Income / Expenses</p>
            <p class="text-sm text-slate-900">{{ (form.income || 0).toLocaleString() }} / {{ (form.expenses || 0).toLocaleString() }} ETB</p>
          </div>
          <div class="p-4 bg-slate-50 rounded-lg">
            <p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Dependents</p>
            <p class="text-sm text-slate-900">{{ form.numberOfDependents }}</p>
          </div>
          <div class="p-4 bg-slate-50 rounded-lg">
            <p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Guarantor</p>
            <p class="text-sm text-slate-900">{{ form.guarantorName || 'None' }}</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
        <button type="button" v-if="step > 1" @click="step--" class="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors">
          ← Previous
        </button>
        <div v-else></div>
        <button type="submit" :disabled="submitting" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60">
          {{ step === 5 ? (submitting ? 'Submitting...' : 'Submit Application') : 'Next →' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchClients, createLoan } from '../../services/api.js'

const route = useRoute()
const router = useRouter()
const step = ref(1)
const stepLabels = ['Select Client', 'Loan Details', 'Collateral & Guarantor', 'Business Plan', 'Review & Submit']
const submitting = ref(false)
const error = ref('')
const success = ref('')

const form = ref({
  clientId: '', amount: 100000, duration: 12, purpose: '', income: 0, expenses: 0,
  totalSavings: 0, monthlySavings: 0, membershipDuration: 0,
  numberOfDependents: 0,
  collateralType: 'none', collateralValue: 0,
  guarantorName: '', guarantorMemberId: '', guarantorSalary: 0, relationship: '',
  businessType: '', businessTypeOther: '', expectedReturn: 0,
})

const clientSearch = ref('')
const clientResults = ref([])
const selectedClient = ref(null)

onMounted(async () => {
  if (route.query.clientId) {
    const res = await fetchClients({ search: '' })
    if (res.success) {
      const c = res.data.items.find(i => i._id === route.query.clientId)
      if (c) selectClient(c)
    }
  }
})

async function searchClients() {
  if (!clientSearch.value) { clientResults.value = []; return }
  const res = await fetchClients({ search: clientSearch.value })
  if (res.success) clientResults.value = res.data.items
}

function selectClient(c) {
  selectedClient.value = c
  form.value.clientId = c._id
  form.value.totalSavings = c.totalSavings || 0
  form.value.monthlySavings = c.monthlySavings || 0
  const memberSince = c.membershipDate ? new Date(c.membershipDate) : new Date()
  form.value.membershipDuration = Math.round((Date.now() - memberSince.getTime()) / (1000 * 60 * 60 * 24 * 30))
  clientSearch.value = c.name
}

function handleNext() {
  error.value = ''
  if (step.value === 1 && !form.value.clientId) { error.value = 'Please select a client'; return }
  if (step.value === 2 && (!form.value.amount || !form.value.purpose)) { error.value = 'Please fill in required fields'; return }
  if (step.value < 5) { step.value++; return }
  submitApplication()
}

async function submitApplication() {
  submitting.value = true
  try {
    const payload = { ...form.value }
    // If "Other" is selected, use the custom text as businessType
    if (payload.businessType === 'Other' && payload.businessTypeOther) {
      payload.businessType = payload.businessTypeOther
    }
    delete payload.businessTypeOther
    const res = await createLoan(payload)
    if (res.success) {
      success.value = 'Loan application submitted successfully!'
      setTimeout(() => router.push('/officer/applications/' + res.data._id), 1500)
    } else {
      error.value = res.message
    }
  } catch (e) {
    error.value = 'An error occurred.'
  } finally {
    submitting.value = false
  }
}

function initials(name) { return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?' }
function avatarColor(name) { const colors = ['#3b82f6','#10b981','#8b5cf6','#f59e0b','#ef4444','#06b6d4']; return colors[(name || '').length % colors.length] }
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
