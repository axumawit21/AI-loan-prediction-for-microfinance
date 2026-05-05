<template>
  <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
    <div class="flex items-center justify-between mb-5">
      <div>
        <h3 class="text-base font-bold text-slate-900">Application Volume Trends</h3>
        <p class="text-xs text-slate-500 mt-0.5">Loan applications per month</p>
      </div>
      <span class="text-[11px] font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full uppercase tracking-wide">Monthly</span>
    </div>
    <div class="h-60">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const props = defineProps({
  monthlyData: { type: Array, default: () => [] }
})

const chartData = computed(() => {
  let labels = []
  let values = []

  if (props.monthlyData && props.monthlyData.length > 0) {
    // Use real backend monthly trend data
    labels = props.monthlyData.map(m => {
      // m.month is like "2026-04"
      const [year, month] = m.month.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1, 1)
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    })
    values = props.monthlyData.map(m => m.total || 0)
  } else {
    // No data — show current month with 0
    const now = new Date()
    labels = [now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })]
    values = [0]
  }

  const peakIdx = values.length > 0 ? values.indexOf(Math.max(...values)) : -1

  return {
    labels,
    datasets: [{
      data: values,
      backgroundColor: values.map((_, i) => i === peakIdx ? '#2563EB' : '#BFDBFE'),
      borderRadius: 4,
      borderSkipped: false,
      barPercentage: 0.6,
      categoryPercentage: 0.8,
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1E293B',
      titleFont: { family: 'Inter', size: 12 },
      bodyFont: { family: 'Inter', size: 12 },
      padding: 10,
      cornerRadius: 8,
      callbacks: { label: ctx => `${ctx.raw} applications` }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { family: 'Inter', size: 11 }, color: '#94A3B8', maxRotation: 0 },
      border: { display: false }
    },
    y: {
      grid: { color: '#F1F5F9' },
      ticks: { stepSize: 1, font: { family: 'Inter', size: 11 }, color: '#94A3B8' },
      border: { display: false },
      beginAtZero: true,
    }
  }
}
</script>
