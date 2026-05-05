<template>
  <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
    <div class="mb-4">
      <h3 class="text-base font-bold text-slate-900">Portfolio Risk Profile</h3>
      <p class="text-xs text-slate-500 mt-0.5">Weighted risk distribution</p>
    </div>

    <div class="flex flex-col items-center">
      <!-- Donut + center -->
      <div class="relative w-44 h-44 mb-5">
        <Doughnut :data="chartData" :options="chartOptions" />
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-3xl font-bold text-slate-900 leading-none">{{ healthScore }}</span>
          <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mt-1">Health Score</span>
        </div>
      </div>

      <!-- Legend -->
      <div class="w-full space-y-3">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-600 flex-shrink-0"></span>
          <span class="text-xs text-slate-600 flex-1">Low Risk ({{ lowPct }}%)</span>
          <span class="text-xs font-semibold text-slate-800">{{ formatAmt(lowAmount) }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0"></span>
          <span class="text-xs text-slate-600 flex-1">Moderate ({{ medPct }}%)</span>
          <span class="text-xs font-semibold text-slate-800">{{ formatAmt(medAmount) }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0"></span>
          <span class="text-xs text-slate-600 flex-1">High Risk ({{ highPct }}%)</span>
          <span class="text-xs font-semibold text-slate-800">{{ formatAmt(highAmount) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js'
ChartJS.register(ArcElement, Tooltip)

const props = defineProps({
  distribution: { type: Object, default: () => ({ Low: 5, Medium: 2, High: 1 }) },
  totalDisbursed: { type: Number, default: 1300000 }
})

const total = computed(() => (props.distribution.Low || 0) + (props.distribution.Medium || 0) + (props.distribution.High || 0))
const lowPct = computed(() => total.value ? Math.round((props.distribution.Low / total.value) * 100) : 0)
const medPct = computed(() => total.value ? Math.round((props.distribution.Medium / total.value) * 100) : 0)
const highPct = computed(() => total.value ? Math.round((props.distribution.High / total.value) * 100) : 0)
const lowAmount = computed(() => Math.round(props.totalDisbursed * (lowPct.value / 100)))
const medAmount = computed(() => Math.round(props.totalDisbursed * (medPct.value / 100)))
const highAmount = computed(() => Math.round(props.totalDisbursed * (highPct.value / 100)))
const healthScore = computed(() => total.value
  ? (100 - (props.distribution.High / total.value) * 60 - (props.distribution.Medium / total.value) * 20).toFixed(1)
  : '0.0')

function formatAmt(v) {
  if (v >= 1000000) return (v/1000000).toFixed(1)+'M ETB'
  if (v >= 1000) return (v/1000).toFixed(0)+'K ETB'
  return v+' ETB'
}

const chartData = computed(() => ({
  labels: ['Low Risk', 'Moderate', 'High Risk'],
  datasets: [{
    data: [props.distribution.Low || 0, props.distribution.Medium || 0, props.distribution.High || 0],
    backgroundColor: ['#16A34A', '#2563EB', '#DC2626'],
    borderWidth: 0,
    cutout: '75%',
    borderRadius: 3,
  }]
}))

const chartOptions = {
  responsive: true, maintainAspectRatio: true,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: '#1E293B', cornerRadius: 8, padding: 10 }
  }
}
</script>
