// ═══════════════════════════════════════════
// Vue Router — Multi-role routes
// ═══════════════════════════════════════════

import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../stores/auth.js'

import LoginView from '../views/LoginView.vue'
import AppLayout from '../components/layout/AppLayout.vue'

// ── Committee views ────────────
import DashboardView from '../views/DashboardView.vue'
import ApplicationsView from '../views/ApplicationsView.vue'
import ApplicationDetailView from '../views/ApplicationDetailView.vue'
import ReportsView from '../views/ReportsView.vue'

// ── Officer views ────────────────────────
import OfficerDashboardView from '../views/officer/OfficerDashboardView.vue'
import ClientsListView from '../views/officer/ClientsListView.vue'
import ClientFormView from '../views/officer/ClientFormView.vue'
import ClientDetailView from '../views/officer/ClientDetailView.vue'
import OfficerApplicationsView from '../views/officer/OfficerApplicationsView.vue'
import NewApplicationView from '../views/officer/NewApplicationView.vue'
import OfficerApplicationDetailView from '../views/officer/OfficerApplicationDetailView.vue'

// ── Admin views ──────────────────────────
import AdminDashboardView from '../views/admin/AdminDashboardView.vue'
import UsersListView from '../views/admin/UsersListView.vue'
import UserFormView from '../views/admin/UserFormView.vue'
import AdminClientsView from '../views/admin/AdminClientsView.vue'
import AdminReportsView from '../views/admin/AdminReportsView.vue'
import SaccosView from '../views/admin/SaccosView.vue'

function roleDashboard(role) {
  if (role === 'loan_officer') return '/officer/dashboard'
  if (role === 'admin') return '/admin/dashboard'
  return '/committee/dashboard'
}

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    redirect: () => {
      const { userRole } = useAuth()
      return roleDashboard(userRole.value)
    }
  },

  // ── Officer Routes ───────────────────────
  {
    path: '/officer',
    component: AppLayout,
    meta: { requiresAuth: true, allowedRoles: ['loan_officer'] },
    children: [
      { path: 'dashboard', name: 'OfficerDashboard', component: OfficerDashboardView, meta: { title: 'Officer Dashboard' } },
      { path: 'clients', name: 'ClientsList', component: ClientsListView, meta: { title: 'Clients' } },
      { path: 'clients/new', name: 'ClientCreate', component: ClientFormView, meta: { title: 'Register Client' } },
      { path: 'clients/:id', name: 'ClientDetail', component: ClientDetailView, meta: { title: 'Client Detail' } },
      { path: 'clients/:id/edit', name: 'ClientEdit', component: ClientFormView, meta: { title: 'Edit Client' } },
      { path: 'applications', name: 'OfficerApplications', component: OfficerApplicationsView, meta: { title: 'My Applications' } },
      { path: 'applications/new', name: 'NewApplication', component: NewApplicationView, meta: { title: 'New Loan Application' } },
      { path: 'applications/:id', name: 'OfficerApplicationDetail', component: OfficerApplicationDetailView, meta: { title: 'Application Detail' } },
    ]
  },

  // ── Committee Routes ───────────
  {
    path: '/committee',
    component: AppLayout,
    meta: { requiresAuth: true, allowedRoles: ['committee'] },
    children: [
      { path: 'dashboard', name: 'CommitteeDashboard', component: DashboardView, meta: { title: 'Committee Dashboard' } },
      { path: 'applications', name: 'CommitteeApplications', component: ApplicationsView, meta: { title: 'Applications' } },
      { path: 'applications/:id', name: 'CommitteeApplicationDetail', component: ApplicationDetailView, meta: { title: 'Application Detail' } },
      { path: 'reports', name: 'CommitteeReports', component: ReportsView, meta: { title: 'Reports' } },
    ]
  },

  // ── Admin Routes ─────────────────────────
  {
    path: '/admin',
    component: AppLayout,
    meta: { requiresAuth: true, allowedRoles: ['admin'] },
    children: [
      { path: 'dashboard', name: 'AdminDashboard', component: AdminDashboardView, meta: { title: 'Admin Dashboard' } },
      { path: 'users', name: 'UsersList', component: UsersListView, meta: { title: 'User Management' } },
      { path: 'users/new', name: 'UserCreate', component: UserFormView, meta: { title: 'Create User' } },
      { path: 'users/:id/edit', name: 'UserEdit', component: UserFormView, meta: { title: 'Edit User' } },
      { path: 'saccos', name: 'AdminSaccos', component: SaccosView, meta: { title: 'SACCO Organizations' } },
    ]
  },

  // Legacy redirects
  { path: '/dashboard', redirect: '/' },
  { path: '/applications', redirect: '/' },
  { path: '/reports', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const { isAuthenticated, userRole } = useAuth()

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return next('/login')
  }

  if (to.path === '/login' && isAuthenticated.value) {
    return next(roleDashboard(userRole.value))
  }

  // Role-based access control
  if (to.matched.some(r => r.meta.allowedRoles)) {
    const allowed = to.matched.find(r => r.meta.allowedRoles)?.meta.allowedRoles
    if (allowed && !allowed.includes(userRole.value)) {
      return next(roleDashboard(userRole.value))
    }
  }

  next()
})

export default router
