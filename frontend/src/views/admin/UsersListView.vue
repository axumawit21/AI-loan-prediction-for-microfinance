<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-900">User Management</h1>
        <p class="text-sm text-slate-500 mt-0.5">Manage system users and their roles</p>
      </div>
      <button @click="$router.push('/admin/users/new')" class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add User
      </button>
    </div>

    <div v-if="success" class="px-4 py-3 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg">{{ success }}</div>
    <div v-if="error" class="px-4 py-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg">{{ error }}</div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-4">
      <div class="relative flex-1 min-w-[250px]">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" @input="loadUsers" placeholder="Search by name or email..." class="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all bg-white" />
      </div>
      <select v-model="roleFilter" @change="loadUsers" class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 bg-white min-w-[150px]">
        <option value="">All Roles</option>
        <option value="admin">Admin</option>
        <option value="loan_officer">Loan Officer</option>
        <option value="committee">Committee</option>
      </select>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-100">
            <th class="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-6 py-3">User</th>
            <th class="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Role</th>
            <th class="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Phone</th>
            <th class="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Status</th>
            <th class="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u._id" class="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" :style="{ background: avatarColor(u.name) }">
                  {{ initials(u.name) }}
                </div>
                <div>
                  <div class="text-sm font-semibold text-slate-900">{{ u.name }}</div>
                  <div class="text-xs text-slate-400">{{ u.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-4 py-4">
              <span :class="roleBadge(u.role)" class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize">
                {{ u.role?.replace(/_/g, ' ') }}
              </span>
            </td>
            <td class="px-4 py-4 text-sm text-slate-600">{{ u.phone }}</td>
            <td class="px-4 py-4">
              <span :class="u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'" class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold">
                {{ u.isActive ? 'Active' : 'Deactivated' }}
              </span>
            </td>
            <td class="px-4 py-4">
              <div class="flex items-center gap-2">
                <button @click="$router.push('/admin/users/' + u._id + '/edit')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition-colors">Edit</button>
                <button @click="handleToggle(u)" class="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors" :class="u.isActive ? 'bg-amber-50 hover:bg-amber-100 text-amber-700' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'">
                  {{ u.isActive ? 'Deactivate' : 'Activate' }}
                </button>
                <button @click="handleDelete(u)" class="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-md transition-colors">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Delete Confirmation -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
        <h3 class="text-base font-bold text-slate-900 mb-2">Delete User</h3>
        <p class="text-sm text-slate-600 mb-5">Are you sure you want to permanently delete <strong>{{ deleteTarget?.name }}</strong>? This action cannot be undone.</p>
        <div class="flex items-center gap-3">
          <button @click="confirmDelete" class="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors">Delete</button>
          <button @click="showDeleteConfirm = false" class="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchUsers, updateUser, deleteUser } from '../../services/api.js'

const users = ref([])
const search = ref('')
const roleFilter = ref('')
const success = ref('')
const error = ref('')
const showDeleteConfirm = ref(false)
const deleteTarget = ref(null)

// Get current user ID to prevent self-deactivation/deletion
const currentUserId = JSON.parse(localStorage.getItem('user') || '{}')?.id

async function loadUsers() {
  const res = await fetchUsers({ search: search.value, role: roleFilter.value })
  if (res.success) users.value = res.data
}

async function handleToggle(user) {
  if (user._id === currentUserId) {
    error.value = 'You cannot deactivate your own account'
    setTimeout(() => error.value = '', 3000)
    return
  }
  await updateUser(user._id, { isActive: !user.isActive })
  success.value = user.isActive ? `${user.name} has been deactivated` : `${user.name} has been activated`
  loadUsers()
  setTimeout(() => success.value = '', 3000)
}

function handleDelete(user) {
  if (user._id === currentUserId) {
    error.value = 'You cannot delete your own account'
    setTimeout(() => error.value = '', 3000)
    return
  }
  deleteTarget.value = user
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  await deleteUser(deleteTarget.value._id)
  success.value = `${deleteTarget.value.name} has been deleted`
  showDeleteConfirm.value = false
  deleteTarget.value = null
  loadUsers()
  setTimeout(() => success.value = '', 3000)
}

onMounted(loadUsers)

function initials(name) { return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?' }
function avatarColor(name) { const colors = ['#3b82f6','#10b981','#8b5cf6','#f59e0b','#ef4444','#06b6d4']; return colors[(name || '').length % colors.length] }
function roleBadge(role) {
  const map = { admin: 'bg-violet-50 text-violet-700', loan_officer: 'bg-blue-50 text-blue-700', committee: 'bg-amber-50 text-amber-700' }
  return map[role] || 'bg-slate-100 text-slate-600'
}
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
