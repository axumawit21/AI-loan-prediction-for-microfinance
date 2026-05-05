<template>
  <header class="fixed top-0 left-[250px] right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-40">
    <div class="flex items-center gap-4">
      <h1 class="text-lg font-bold text-slate-900">{{ pageTitle }}</h1>
      <div class="w-px h-6 bg-slate-300"></div>
      <span class="text-[13px] text-slate-500 font-medium">{{ formattedDate }}</span>
    </div>
    <div class="flex items-center gap-4">
      <button class="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </button>
      <button class="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
      </button>
      <div
        class="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold cursor-pointer hover:shadow-[0_0_0_3px_#DBEAFE] transition-shadow"
        :title="userName"
      >
        {{ userInitials }}
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '../../stores/auth.js'

const route = useRoute()
const { userName, userInitials } = useAuth()

const pageTitle = computed(() => route.meta.title || 'Dashboard')

const formattedDate = computed(() => {
  const d = new Date()
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`
})
</script>
