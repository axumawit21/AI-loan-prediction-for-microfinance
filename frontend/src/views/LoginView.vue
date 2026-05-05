<template>
  <div class="min-h-screen bg-[#0B1437] flex items-center justify-center relative overflow-hidden">
    <!-- Background glows -->
    <div class="absolute w-[500px] h-[500px] rounded-full bg-blue-500/10 -top-24 -right-24 pointer-events-none"></div>
    <div class="absolute w-[400px] h-[400px] rounded-full bg-blue-500/8 -bottom-36 -left-24 pointer-events-none"></div>

    <div class="relative z-10 w-full max-w-[420px] bg-white rounded-2xl p-10 shadow-[0_25px_60px_rgba(0,0,0,0.3)]">
      <!-- Brand -->
      <div class="flex items-center gap-3 justify-center mb-8">
        <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 100 4h4a2 2 0 010 4H8"/><path d="M12 18V6"/></svg>
        </div>
        <span class="text-xl font-bold text-slate-900">SACCO Lens</span>
      </div>

      <h1 class="text-2xl font-bold text-slate-900 text-center mb-2">Welcome Back</h1>
      <p class="text-sm text-slate-500 text-center mb-8">Sign in to your dashboard</p>

      <!-- Error -->
      <div v-if="error" class="mb-4 px-4 py-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center">
        {{ error }}
      </div>

      <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
        <div class="flex flex-col gap-1.5">
          <label for="login-email" class="text-xs font-semibold text-slate-700">Email Address</label>
          <input
            id="login-email"
            v-model="email"
            type="email"
            placeholder="Enter your email"
            required
            autocomplete="email"
            class="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="login-password" class="text-xs font-semibold text-slate-700">Password</label>
          <input
            id="login-password"
            v-model="password"
            type="password"
            placeholder="Enter your password"
            required
            autocomplete="current-password"
            class="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <svg v-if="loading" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span v-else>Sign In</span>
        </button>
      </form>

      <!-- Demo credentials hint -->
      <div class="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Demo Credentials</p>
        <p class="text-xs text-slate-600 font-mono py-0.5">officer@sacco.com / officer123 <span class="text-slate-400">(Loan Officer)</span></p>
        <p class="text-xs text-slate-600 font-mono py-0.5">committee@sacco.com / committee123 <span class="text-slate-400">(Committee)</span></p>
        <p class="text-xs text-slate-600 font-mono py-0.5">admin@sacco.com / admin123 <span class="text-slate-400">(Admin)</span></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/auth.js'
import { login } from '../services/api.js'

const router = useRouter()
const { setAuth } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    const res = await login(email.value, password.value)
    if (res.success) {
      setAuth(res.data.token, res.data.user)
      const role = res.data.user.role
      const dest = role === 'loan_officer' ? '/officer/dashboard' : role === 'admin' ? '/admin/dashboard' : '/committee/dashboard'
      router.push(dest)
    } else {
      error.value = res.message
    }
  } catch (e) {
    error.value = 'An error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
