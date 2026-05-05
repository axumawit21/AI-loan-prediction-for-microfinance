<template>
  <div class="space-y-6 animate-fade-in">
    <div>
      <button @click="$router.push('/admin/users')" class="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Back to Users
      </button>
      <h1 class="text-xl font-bold text-slate-900">{{ isEdit ? 'Edit User' : 'Create New User' }}</h1>
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
          <label class="text-xs font-semibold text-slate-700">Email *</label>
          <input v-model="form.email" type="email" required placeholder="user@sacco.com" class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" />
        </div>
        <div v-if="!isEdit" class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-700">Password *</label>
          <input v-model="form.password" type="password" required placeholder="Create password" class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-700">Role *</label>
          <select v-model="form.role" required class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all bg-white">
            <option value="">Select role</option>
            <option value="admin">Admin</option>
            <option value="loan_officer">Loan Officer</option>
            <option value="committee">Committee</option>
          </select>
        </div>
        <div v-if="form.role && form.role !== 'admin'" class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-700">SACCO Organization *</label>
          <select v-model="form.saccoId" required class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all bg-white">
            <option value="">Select SACCO</option>
            <option v-for="s in saccos" :key="s._id" :value="s._id">{{ s.name }}</option>
          </select>
        </div>
        <div v-if="form.role === 'admin'" class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-700">SACCO Organization</label>
          <div class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500">Centralized — manages all SACCOs</div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-700">Phone *</label>
          <input v-model="form.phone" required placeholder="+251..." class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" />
        </div>
      </div>
      <div class="flex items-center gap-4 mt-8 pt-6 border-t border-slate-100">
        <button type="submit" :disabled="submitting" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60">
          {{ submitting ? 'Saving...' : (isEdit ? 'Update User' : 'Create User') }}
        </button>
        <button type="button" @click="$router.push('/admin/users')" class="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors">Cancel</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchUsers, createUser, updateUser, fetchSaccos } from '../../services/api.js'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)
const form = ref({ name: '', email: '', password: '', role: '', phone: '', saccoId: '' })
const submitting = ref(false)
const error = ref('')
const success = ref('')
const saccos = ref([])

onMounted(async () => {
  // Load SACCOs for dropdown
  const sRes = await fetchSaccos()
  if (sRes.success) saccos.value = sRes.data

  if (isEdit.value) {
    const res = await fetchUsers({})
    if (res.success) {
      const u = res.data.find(u => u._id === route.params.id)
      if (u) form.value = { name: u.name, email: u.email, role: u.role, phone: u.phone, password: '', saccoId: u.saccoId || '' }
    }
  }
})

async function handleSubmit() {
  error.value = ''
  success.value = ''
  submitting.value = true
  try {
    const payload = { ...form.value }
    if (payload.role === 'admin') delete payload.saccoId
    const res = isEdit.value ? await updateUser(route.params.id, payload) : await createUser(payload)
    if (res.success) {
      success.value = isEdit.value ? 'User updated!' : 'User created!'
      if (!isEdit.value) setTimeout(() => router.push('/admin/users'), 1000)
    } else {
      error.value = res.message
    }
  } catch (e) { error.value = 'An error occurred.' }
  finally { submitting.value = false }
}
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
