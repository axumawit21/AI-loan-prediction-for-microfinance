// ═══════════════════════════════════════════
// API Service — Real Backend Integration
// Base URL: http://localhost:5000/api
// ═══════════════════════════════════════════

const BASE_URL = 'http://localhost:5000/api'

// ── HTTP Helper ─────────────────────────────
function getToken() {
  return localStorage.getItem('sacco_token')
}

function authHeaders() {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

async function request(method, path, body = null) {
  try {
    const opts = { method, headers: authHeaders() }
    if (body && method !== 'GET') {
      opts.body = JSON.stringify(body)
    }
    const res = await fetch(`${BASE_URL}${path}`, opts)
    const data = await res.json()
    return data
  } catch (error) {
    console.error(`API Error [${method} ${path}]:`, error)
    return { success: false, message: 'Network error. Is the backend running?', data: null }
  }
}

// ── Auth ─────────────────────────────────────
export async function login(email, password) {
  return request('POST', '/auth/login', { email, password })
}

// ── SACCOs ───────────────────────────────────
export async function fetchSaccos() {
  return request('GET', '/saccos')
}

export async function createSacco(data) {
  return request('POST', '/saccos', data)
}

export async function updateSacco(id, data) {
  return request('PATCH', `/saccos/${id}`, data)
}

export async function getMe() {
  return request('GET', '/auth/me')
}

// ── Loans ────────────────────────────────────
export async function fetchLoans({ page = 1, limit = 10, status = '', search = '', riskLevel = '', officerId = '' } = {}) {
  const params = new URLSearchParams()
  params.set('page', page)
  params.set('limit', limit)
  if (status) params.set('status', status)
  if (search) params.set('search', search)
  if (riskLevel) params.set('riskLevel', riskLevel)
  if (officerId) params.set('officerId', officerId)
  const res = await request('GET', `/loans?${params.toString()}`)

  // Enrich each loan with its prediction (backend list doesn't include it)
  if (res.success && res.data?.items) {
    const enriched = await Promise.all(
      res.data.items.map(async (loan) => {
        if (!loan.prediction) {
          const predRes = await request('GET', `/predictions/${loan._id}`)
          if (predRes.success && predRes.data) {
            loan.prediction = predRes.data
          }
        }
        return loan
      })
    )
    res.data.items = enriched
  }
  return res
}

export async function fetchLoanById(id) {
  const res = await request('GET', `/loans/${id}`)
  if (!res.success) return res

  // Ensure decisions are loaded (fetch separately if missing)
  if (!res.data.decisions || res.data.decisions.length === 0) {
    const reviewsRes = await request('GET', `/reviews/loan/${id}`)
    if (reviewsRes.success && reviewsRes.data) {
      res.data.decisions = reviewsRes.data
    }
  }

  // Ensure prediction is loaded (fetch separately if missing)
  if (!res.data.prediction) {
    const predRes = await request('GET', `/predictions/${id}`)
    if (predRes.success && predRes.data) {
      res.data.prediction = predRes.data
    }
  }

  return res
}

export async function createLoan(data) {
  return request('POST', '/loans', data)
}

export async function updateLoan(id, data) {
  return request('PATCH', `/loans/${id}`, data)
}

// ── AI Prediction ────────────────────────────
export async function runAIPrediction(loanId) {
  return request('POST', '/predictions/predict-risk', { loanId })
}

export async function fetchPrediction(loanId) {
  return request('GET', `/predictions/${loanId}`)
}

// ── Reviews ──────────────────────────────────
export async function submitOfficerReview({ loanId, comment }) {
  return request('POST', '/reviews', {
    loanId,
    reviewerType: 'officer',
    decision: 'send_to_committee',
    comment
  })
}

export async function submitCommitteeDecision({ loanId, decision, comment }) {
  return request('POST', '/reviews', { loanId, reviewerType: 'committee', decision, comment })
}

export async function fetchReviews(loanId) {
  return request('GET', `/reviews/loan/${loanId}`)
}

// ── Clients ──────────────────────────────────
export async function fetchClients({ page = 1, limit = 20, search = '', status = '' } = {}) {
  const params = new URLSearchParams()
  params.set('page', page)
  params.set('limit', limit)
  if (search) params.set('search', search)
  if (status) params.set('status', status)
  return request('GET', `/clients?${params.toString()}`)
}

export async function fetchClientById(id) {
  return request('GET', `/clients/${id}`)
}

export async function createClient(data) {
  return request('POST', '/clients', data)
}

export async function updateClient(id, data) {
  return request('PATCH', `/clients/${id}`, data)
}

// ── Users (Admin) ────────────────────────────
export async function fetchUsers({ search = '', role = '', limit = 100 } = {}) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (role) params.set('role', role)
  params.set('limit', limit)
  const res = await request('GET', `/users?${params.toString()}`)
  // Normalize: backend returns { items, total, ... } but some views expect flat array
  if (res.success && res.data?.items) {
    return { ...res, data: res.data.items }
  }
  return res
}

export async function createUser(data) {
  return request('POST', '/auth/register', data)
}

export async function updateUser(id, data) {
  return request('PUT', `/users/${id}`, data)
}

export async function toggleUserStatus(id) {
  // Fetch user first, then toggle isActive
  const usersRes = await fetchUsers({})
  if (!usersRes.success) return usersRes
  const user = (Array.isArray(usersRes.data) ? usersRes.data : []).find(u => u._id === id)
  if (!user) return { success: false, message: 'User not found', data: null }
  return request('PUT', `/users/${id}`, { isActive: !user.isActive })
}

export async function deleteUser(id) {
  return request('DELETE', `/users/${id}`)
}

// ── Reports / Dashboard Stats ────────────────
export async function fetchDashboardStats() {
  const res = await request('GET', '/reports/dashboard')
  if (!res.success) return res

  // Backend returns { loans: {...}, clients: {...}, predictions: {...} }
  // Views expect flat: { totalLoans, pendingLoans, approvedLoans, ... }
  const d = res.data
  const loans = d.loans || d
  const clients = d.clients || {}
  const predictions = d.predictions || {}

  return {
    success: true,
    message: res.message,
    data: {
      totalLoans: loans.totalLoans || 0,
      pendingLoans: loans.pendingLoans || 0,
      approvedLoans: loans.approvedLoans || 0,
      rejectedLoans: loans.rejectedLoans || 0,
      highRiskLoans: predictions.highRisk || 0,
      totalClients: clients.totalClients || clients.activeClients || 0,
      totalDisbursed: loans.approvedAmount || 0,
      recentApplications: d.recentApplications || [],
    }
  }
}

export async function fetchRiskDistribution() {
  const [predRes, loanRes] = await Promise.all([
    request('GET', '/reports/predictions'),
    request('GET', '/reports/loans'),
  ])

  const pred = predRes.success ? predRes.data : {}
  const loans = loanRes.success ? loanRes.data : {}

  const totalPred = (pred.lowRisk || 0) + (pred.mediumRisk || 0) + (pred.highRisk || 0)
  const avgScore = totalPred > 0 ? Math.round(((pred.lowRisk || 0) * 25 + (pred.mediumRisk || 0) * 50 + (pred.highRisk || 0) * 75) / totalPred) : 0
  const totalLoans = loans.totalLoans || 1
  const approvalRate = totalLoans > 0 ? Math.round(((loans.approvedLoans || 0) / totalLoans) * 1000) / 10 : 0

  return {
    success: true,
    message: 'Risk distribution',
    data: {
      distribution: { Low: pred.lowRisk || 0, Medium: pred.mediumRisk || 0, High: pred.highRisk || 0 },
      averageRiskScore: avgScore,
      approvalRate,
      monthlyTrend: loans.monthlyTrend || []
    }
  }
}

export async function fetchLoanStats() {
  return request('GET', '/reports/loans')
}

// ── Officer Dashboard Stats ──────────────────
// Uses the loans endpoint filtered by officer + reports
export async function fetchOfficerStats(officerId) {
  try {
    // Fetch officer's loans
    const loansRes = await fetchLoans({ officerId, limit: 50 })
    const dashRes = await fetchDashboardStats()

    if (!loansRes.success) return loansRes

    const myLoans = loansRes.data?.items || []
    const assigned = myLoans.length
    const pending = myLoans.filter(l => ['pending', 'officer_review'].includes(l.status)).length
    const forwarded = myLoans.filter(l => ['committee_review', 'approved', 'rejected', 'modification_requested'].includes(l.status)).length
    const myClients = [...new Set(myLoans.map(l => l.clientId?._id).filter(Boolean))].length

    const recentLoans = myLoans
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)

    return {
      success: true,
      message: 'Officer stats',
      data: { assigned, pending, forwarded, myClients, recentLoans }
    }
  } catch (error) {
    return { success: false, message: 'Failed to fetch officer stats', data: null }
  }
}

// ── Admin Dashboard Stats ────────────────────
// Combines dashboard + users for full admin overview
export async function fetchAdminStats() {
  try {
    const [dashRes, usersRes, clientsRes] = await Promise.all([
      fetchDashboardStats(),
      fetchUsers({}),
      fetchClients({ limit: 1 })
    ])

    const dashData = dashRes.success ? dashRes.data : {}
    const users = usersRes.success ? (Array.isArray(usersRes.data) ? usersRes.data : []) : []
    const totalClients = clientsRes.success ? (clientsRes.data?.total || 0) : 0

    const totalUsers = users.length
    const activeOfficers = users.filter(u => u.role === 'loan_officer' && u.isActive).length

    const totalLoans = dashData.totalLoans || 0
    const approved = dashData.approvedLoans || 0
    const totalDisbursed = dashData.totalDisbursed || 0
    const approvalRate = totalLoans > 0 ? Math.round((approved / totalLoans) * 1000) / 10 : 0

    // Build status breakdown from dashboard data
    const statusBreakdown = {
      pending: dashData.pendingLoans || 0,
      approved: dashData.approvedLoans || 0,
      rejected: dashData.rejectedLoans || 0,
    }

    const roleBreakdown = {
      admin: users.filter(u => u.role === 'admin').length,
      loan_officer: users.filter(u => u.role === 'loan_officer').length,
      committee: users.filter(u => u.role === 'committee').length,
    }

    return {
      success: true,
      message: 'Admin stats',
      data: {
        totalUsers, activeOfficers, totalLoans, totalClients,
        totalDisbursed, approvalRate, statusBreakdown, roleBreakdown
      }
    }
  } catch (error) {
    return { success: false, message: 'Failed to fetch admin stats', data: null }
  }
}
