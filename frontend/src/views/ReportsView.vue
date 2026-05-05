<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Reports & Analytics</h1>
        <p class="text-sm text-slate-500 mt-0.5">Real-time performance metrics and exportable reports</p>
      </div>
      <div class="flex items-center gap-3">
        <button @click="generatePDF" :disabled="exporting" class="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          {{ exporting ? 'Generating...' : 'Export PDF' }}
        </button>
        <button @click="generateExcel" :disabled="exporting" class="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
          {{ exporting ? 'Generating...' : 'Export Excel' }}
        </button>
      </div>
    </div>

    <!-- KPI Row -->
    <div class="grid grid-cols-4 gap-5">
      <div class="bg-white border border-slate-200 rounded-xl p-5 flex justify-between items-start shadow-sm hover:shadow-md transition-shadow">
        <div>
          <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Total Applications</span>
          <p class="text-3xl font-bold text-slate-900 mt-1 leading-none">{{ loanStats.totalLoans }}</p>
        </div>
        <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl p-5 flex justify-between items-start shadow-sm hover:shadow-md transition-shadow">
        <div>
          <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Approval Rate</span>
          <p class="text-3xl font-bold text-emerald-600 mt-1 leading-none">{{ riskData.approvalRate }}%</p>
        </div>
        <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl p-5 flex justify-between items-start shadow-sm hover:shadow-md transition-shadow">
        <div>
          <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Avg Risk Score</span>
          <p class="text-3xl font-bold text-amber-600 mt-1 leading-none">{{ riskData.averageRiskScore }}</p>
        </div>
        <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl p-5 flex justify-between items-start shadow-sm hover:shadow-md transition-shadow">
        <div>
          <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Total Disbursed</span>
          <p class="text-2xl font-bold text-violet-600 mt-1 leading-none">{{ formatETB(loanStats.approvedAmount) }}</p>
        </div>
        <div class="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-6">
      <!-- Monthly Trend Chart — REAL DATA -->
      <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 class="text-sm font-bold text-slate-900 mb-5">Monthly Loan Trends</h3>
        <div class="h-72">
          <Bar :data="trendChartData" :options="trendChartOptions" />
        </div>
      </div>

      <!-- Risk Distribution Chart — REAL DATA -->
      <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 class="text-sm font-bold text-slate-900 mb-5">Risk Distribution</h3>
        <div class="flex items-center justify-center h-72">
          <div class="w-56 h-56">
            <Doughnut :data="riskChartData" :options="riskChartOptions" />
          </div>
        </div>
      </div>
    </div>

    <!-- Monthly Breakdown Table -->
    <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100">
        <h3 class="text-sm font-bold text-slate-900">Monthly Breakdown</h3>
      </div>
      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-100">
            <th class="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Month</th>
            <th class="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Total</th>
            <th class="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Approved</th>
            <th class="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Rejected</th>
            <th class="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Pending</th>
            <th class="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Approval Rate</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in riskData.monthlyTrend" :key="m.month" class="hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors">
            <td class="px-6 py-4 text-sm font-semibold text-slate-800">{{ formatMonth(m.month) }}</td>
            <td class="px-4 py-4 text-sm font-bold text-slate-900">{{ m.total }}</td>
            <td class="px-4 py-4 text-sm font-semibold text-emerald-600">{{ m.approved }}</td>
            <td class="px-4 py-4 text-sm font-semibold text-red-500">{{ m.rejected }}</td>
            <td class="px-4 py-4 text-sm font-semibold text-amber-600">{{ m.total - m.approved - m.rejected }}</td>
            <td class="px-4 py-4">
              <div class="flex items-center gap-3">
                <div class="flex-1 h-1.5 bg-slate-100 rounded-full max-w-[120px]">
                  <div class="h-full bg-emerald-500 rounded-full" :style="{width: (m.total > 0 ? Math.round((m.approved/m.total)*100) : 0)+'%'}"></div>
                </div>
                <span class="text-xs font-semibold text-slate-700">{{ m.total > 0 ? Math.round((m.approved/m.total)*100) : 0 }}%</span>
              </div>
            </td>
          </tr>
          <tr v-if="!riskData.monthlyTrend || riskData.monthlyTrend.length === 0">
            <td colspan="6" class="px-6 py-8 text-center text-sm text-slate-400">No data available yet</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Export Status -->
    <div v-if="exportMsg" class="px-4 py-3 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg">{{ exportMsg }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js'
import { fetchRiskDistribution, fetchLoanStats } from '../services/api.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

const riskData = ref({ distribution: { Low: 0, Medium: 0, High: 0 }, averageRiskScore: 0, approvalRate: 0, monthlyTrend: [] })
const loanStats = ref({ totalLoans: 0, approvedAmount: 0 })
const exporting = ref(false)
const exportMsg = ref('')

onMounted(async () => {
  const [riskRes, statsRes] = await Promise.all([fetchRiskDistribution(), fetchLoanStats()])
  if (riskRes.success) riskData.value = riskRes.data
  if (statsRes.success) loanStats.value = statsRes.data
})

// ── Charts using REAL data ───────────────────
const trendChartData = computed(() => {
  const trend = riskData.value.monthlyTrend || []
  return {
    labels: trend.map(m => {
      const [year, month] = m.month.split('-')
      const d = new Date(parseInt(year), parseInt(month) - 1, 1)
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }),
    datasets: [
      { label: 'Approved', data: trend.map(m => m.approved), backgroundColor: '#16A34A', borderRadius: 4, barPercentage: 0.5 },
      { label: 'Rejected', data: trend.map(m => m.rejected), backgroundColor: '#DC2626', borderRadius: 4, barPercentage: 0.5 },
      { label: 'Pending', data: trend.map(m => m.total - m.approved - m.rejected), backgroundColor: '#F59E0B', borderRadius: 4, barPercentage: 0.5 },
    ]
  }
})

const riskChartData = computed(() => ({
  labels: ['Low Risk', 'Medium Risk', 'High Risk'],
  datasets: [{
    data: [
      riskData.value.distribution?.Low || 0,
      riskData.value.distribution?.Medium || 0,
      riskData.value.distribution?.High || 0
    ],
    backgroundColor: ['#16A34A', '#F59E0B', '#DC2626'],
    borderWidth: 0, cutout: '65%', borderRadius: 3
  }]
}))

const trendChartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top', labels: { font: { family: 'Inter', size: 12 }, usePointStyle: true, pointStyle: 'circle', padding: 20 } },
    tooltip: { backgroundColor: '#1E293B', titleFont: { family: 'Inter' }, bodyFont: { family: 'Inter' }, cornerRadius: 8 }
  },
  scales: {
    x: { stacked: true, grid: { display: false }, ticks: { font: { family: 'Inter', size: 12 }, color: '#94A3B8' }, border: { display: false } },
    y: { stacked: true, grid: { color: '#F1F5F9' }, ticks: { stepSize: 1, font: { family: 'Inter', size: 11 }, color: '#94A3B8' }, border: { display: false }, beginAtZero: true }
  }
}
const riskChartOptions = {
  responsive: true, maintainAspectRatio: true,
  plugins: {
    legend: { position: 'bottom', labels: { font: { family: 'Inter', size: 12 }, usePointStyle: true, pointStyle: 'circle', padding: 16 } },
    tooltip: { backgroundColor: '#1E293B', cornerRadius: 8 }
  }
}

function formatMonth(m) {
  const [year, month] = m.split('-')
  const months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${months[parseInt(month)]} ${year}`
}

function formatETB(val) {
  return Number(val || 0).toLocaleString() + ' ETB'
}

// ── PDF Export ───────────────────────────────
async function generatePDF() {
  exporting.value = true
  exportMsg.value = ''
  try {
    const { default: jsPDF } = await import('jspdf')
    await import('jspdf-autotable')
    const doc = new jsPDF()
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    // Header
    doc.setFillColor(30, 41, 59)
    doc.rect(0, 0, 210, 35, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('SACCO Loan Report', 14, 18)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generated: ${today}`, 14, 27)
    doc.text('Axum SACCO — Loan Decision Support System', 210 - 14, 27, { align: 'right' })

    // KPIs
    doc.setTextColor(30, 41, 59)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Summary', 14, 48)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const kpis = [
      ['Total Applications', String(loanStats.value.totalLoans)],
      ['Approval Rate', riskData.value.approvalRate + '%'],
      ['Average Risk Score', String(riskData.value.averageRiskScore)],
      ['Total Disbursed', formatETB(loanStats.value.approvedAmount)],
      ['Low Risk', String(riskData.value.distribution?.Low || 0)],
      ['Medium Risk', String(riskData.value.distribution?.Medium || 0)],
      ['High Risk', String(riskData.value.distribution?.High || 0)],
    ]

    doc.autoTable({
      startY: 53,
      head: [['Metric', 'Value']],
      body: kpis,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], fontSize: 10, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 80 } },
    })

    // Monthly Breakdown
    const trend = riskData.value.monthlyTrend || []
    if (trend.length > 0) {
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Monthly Breakdown', 14, doc.lastAutoTable.finalY + 15)

      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Month', 'Total', 'Approved', 'Rejected', 'Pending', 'Approval Rate']],
        body: trend.map(m => [
          formatMonth(m.month),
          m.total,
          m.approved,
          m.rejected,
          m.total - m.approved - m.rejected,
          m.total > 0 ? Math.round((m.approved / m.total) * 100) + '%' : '0%',
        ]),
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], fontSize: 10, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 5 },
      })
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(148, 163, 184)
      doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' })
      doc.text('Confidential — Axum SACCO', 14, 290)
    }

    doc.save(`SACCO_Report_${new Date().toISOString().split('T')[0]}.pdf`)
    exportMsg.value = '✅ PDF report downloaded successfully!'
  } catch (e) {
    console.error(e)
    exportMsg.value = '❌ Failed to generate PDF'
  } finally {
    exporting.value = false
    setTimeout(() => exportMsg.value = '', 4000)
  }
}

// ── Excel Export ─────────────────────────────
async function generateExcel() {
  exporting.value = true
  exportMsg.value = ''
  try {
    const XLSX = await import('xlsx')

    // Summary sheet
    const summaryData = [
      ['SACCO Loan Report'],
      ['Generated', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
      [],
      ['Metric', 'Value'],
      ['Total Applications', loanStats.value.totalLoans],
      ['Approval Rate', riskData.value.approvalRate + '%'],
      ['Average Risk Score', riskData.value.averageRiskScore],
      ['Total Disbursed (ETB)', loanStats.value.approvedAmount],
      ['Low Risk Count', riskData.value.distribution?.Low || 0],
      ['Medium Risk Count', riskData.value.distribution?.Medium || 0],
      ['High Risk Count', riskData.value.distribution?.High || 0],
    ]
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
    summaryWs['!cols'] = [{ wch: 25 }, { wch: 25 }]

    // Monthly sheet
    const trend = riskData.value.monthlyTrend || []
    const monthlyData = [
      ['Month', 'Total', 'Approved', 'Rejected', 'Pending', 'Approval Rate'],
      ...trend.map(m => [
        formatMonth(m.month),
        m.total,
        m.approved,
        m.rejected,
        m.total - m.approved - m.rejected,
        m.total > 0 ? Math.round((m.approved / m.total) * 100) + '%' : '0%',
      ])
    ]
    const monthlyWs = XLSX.utils.aoa_to_sheet(monthlyData)
    monthlyWs['!cols'] = [{ wch: 18 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 15 }]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary')
    XLSX.utils.book_append_sheet(wb, monthlyWs, 'Monthly Breakdown')
    XLSX.writeFile(wb, `SACCO_Report_${new Date().toISOString().split('T')[0]}.xlsx`)
    exportMsg.value = '✅ Excel report downloaded successfully!'
  } catch (e) {
    console.error(e)
    exportMsg.value = '❌ Failed to generate Excel'
  } finally {
    exporting.value = false
    setTimeout(() => exportMsg.value = '', 4000)
  }
}
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
