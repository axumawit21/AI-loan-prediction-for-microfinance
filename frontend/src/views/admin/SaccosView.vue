<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-900">SACCO Organizations</h1>
        <p class="text-sm text-slate-500 mt-0.5">Manage registered SACCO organizations</p>
      </div>
    </div>

    <div v-if="success" class="px-4 py-3 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg">{{ success }}</div>
    <div v-if="error" class="px-4 py-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg">{{ error }}</div>

    <!-- Add SACCO Form -->
    <div class="bg-white rounded-xl border border-slate-200/60 p-6">
      <h2 class="text-sm font-bold text-slate-900 mb-4">{{ editId ? 'Edit SACCO' : 'Register New SACCO' }}</h2>
      <form @submit.prevent="handleSubmit" class="flex items-end gap-4">
        <div class="flex-1 flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-700">SACCO Name *</label>
          <input v-model="formName" required placeholder="Enter SACCO name" class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" />
        </div>
        <button type="submit" :disabled="submitting" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 whitespace-nowrap">
          {{ submitting ? 'Saving...' : (editId ? 'Update' : 'Add SACCO') }}
        </button>
        <button v-if="editId" type="button" @click="cancelEdit" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors">Cancel</button>
      </form>
    </div>

    <!-- SACCOs Table -->
    <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <table class="w-full" v-if="saccos.length > 0">
        <thead>
          <tr class="border-b border-slate-100">
            <th class="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Name</th>
            <th class="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Status</th>
            <th class="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Created</th>
            <th class="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sacco in saccos" :key="sacco._id" class="hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {{ sacco.name.charAt(0).toUpperCase() }}
                </div>
                <span class="text-sm font-semibold text-slate-900">{{ sacco.name }}</span>
              </div>
            </td>
            <td class="px-4 py-4">
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold" :class="sacco.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'">
                {{ sacco.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-4 py-4 text-xs text-slate-500">{{ formatDate(sacco.createdAt) }}</td>
            <td class="px-4 py-4">
              <div class="flex items-center gap-2">
                <button @click="startEdit(sacco)" class="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-md transition-colors">Edit</button>
                <button @click="toggleStatus(sacco)" class="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors" :class="sacco.isActive ? 'bg-red-50 hover:bg-red-100 text-red-600' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'">
                  {{ sacco.isActive ? 'Deactivate' : 'Activate' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="flex flex-col items-center justify-center py-16 text-center">
        <span class="text-4xl mb-3">🏦</span>
        <p class="text-sm font-semibold text-slate-600">No SACCOs registered yet</p>
        <p class="text-xs text-slate-400 mt-1">Add your first SACCO above.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchSaccos, createSacco, updateSacco } from '../../services/api.js'

const saccos = ref([])
const formName = ref('')
const editId = ref(null)
const submitting = ref(false)
const error = ref('')
const success = ref('')

onMounted(loadSaccos)

async function loadSaccos() {
  const res = await fetchSaccos()
  if (res.success) saccos.value = res.data
}

async function handleSubmit() {
  error.value = ''
  success.value = ''
  submitting.value = true
  try {
    const res = editId.value
      ? await updateSacco(editId.value, { name: formName.value })
      : await createSacco({ name: formName.value })
    if (res.success) {
      success.value = editId.value ? 'SACCO updated!' : 'SACCO created!'
      formName.value = ''
      editId.value = null
      await loadSaccos()
    } else {
      error.value = res.message
    }
  } catch (e) { error.value = 'An error occurred.' }
  finally { submitting.value = false; setTimeout(() => success.value = '', 3000) }
}

function startEdit(sacco) {
  editId.value = sacco._id
  formName.value = sacco.name
}

function cancelEdit() {
  editId.value = null
  formName.value = ''
}

async function toggleStatus(sacco) {
  await updateSacco(sacco._id, { isActive: !sacco.isActive })
  await loadSaccos()
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
