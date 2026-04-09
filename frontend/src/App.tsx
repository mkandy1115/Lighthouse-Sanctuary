import { createContext, lazy, Suspense, useEffect, useMemo, useState } from 'react'
import type { ReactElement } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useRole } from '@/hooks/useRole'
import type { UserRole } from '@/hooks/useRole'
import CookieConsentBanner from '@/components/shared/CookieConsentBanner'
import AdminShell from '@/components/layout/AdminShell'
import { getThemePreference, saveThemePreference, type ThemePreference } from '@/lib/cookies'
import { getStoredAuthUser, getStoredAuthToken } from '@/lib/auth'

// ---------------------------------------------------------------------------
// Role context — consumed by LoginPage and any component that needs the role
// ---------------------------------------------------------------------------
export const RoleContext = createContext<{
  role: UserRole
  setRole: (r: UserRole) => void
}>({
  role: 'staff',
  setRole: () => {},
})

export const ThemeContext = createContext<{
  theme: ThemePreference
  setTheme: (next: ThemePreference) => void
}>({
  theme: 'light',
  setTheme: () => {},
})

// ---------------------------------------------------------------------------
// Public pages
// ---------------------------------------------------------------------------
const HomePage = lazy(() => import('@/pages/public/HomePage'))
const AboutPage = lazy(() => import('@/pages/public/AboutPage'))
const ProgramsPage = lazy(() => import('@/pages/public/ProgramsPage'))
const ImpactPage = lazy(() => import('@/pages/public/ImpactPage'))
const DonatePage = lazy(() => import('@/pages/public/DonatePage'))
const ContactPage = lazy(() => import('@/pages/public/ContactPage'))
const PrivacyPage = lazy(() => import('@/pages/public/PrivacyPage'))

// ---------------------------------------------------------------------------
// Concept previews
// ---------------------------------------------------------------------------
const ConceptB = lazy(() => import('@/pages/concepts/ConceptB'))
const ConceptC = lazy(() => import('@/pages/concepts/ConceptC'))

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))

// ---------------------------------------------------------------------------
// Staff pages
// ---------------------------------------------------------------------------
const StaffDashboardPage = lazy(() => import('@/pages/staff/DashboardPage'))
const CaseListPage = lazy(() => import('@/pages/staff/CaseListPage'))
const CaseDetailPage = lazy(() => import('@/pages/staff/CaseDetailPage'))
const CounselingListPage = lazy(() => import('@/pages/staff/CounselingListPage'))
const CounselingDetailPage = lazy(() => import('@/pages/staff/CounselingDetailPage'))
const HomeVisitsPage = lazy(() => import('@/pages/staff/HomeVisitsPage'))
const InterventionsPage = lazy(() => import('@/pages/staff/InterventionsPage'))
const ConferencesPage = lazy(() => import('@/pages/staff/ConferencesPage'))
const OutcomesPage = lazy(() => import('@/pages/staff/OutcomesPage'))
const StaffDonorListPage = lazy(() => import('@/pages/staff/DonorListPage'))
const StaffDonorProfilePage = lazy(() => import('@/pages/staff/DonorProfilePage'))
const CampaignsPage = lazy(() => import('@/pages/staff/CampaignsPage'))
const SocialMediaPage = lazy(() => import('@/pages/staff/SocialMediaPage'))
const ReportsPage = lazy(() => import('@/pages/staff/ReportsPage'))
const StaffSettingsPage = lazy(() => import('@/pages/staff/SettingsPage'))

// ---------------------------------------------------------------------------
// Donor portal — single self-contained page with internal navigation
// ---------------------------------------------------------------------------
const DonorDashboardPage = lazy(() => import('@/pages/donor/DashboardPage'))

// ---------------------------------------------------------------------------
// Admin — single self-contained page with internal navigation
// ---------------------------------------------------------------------------
const AdminDashboardPage = lazy(() => import('@/pages/admin/DashboardPage'))
const AdminUsersPage = lazy(() => import('@/pages/admin/UsersPage'))
const AdminRolesPage = lazy(() => import('@/pages/admin/RolesPage'))
const AdminAuditPage = lazy(() => import('@/pages/admin/AuditPage'))
const AdminSettingsPage = lazy(() => import('@/pages/admin/SettingsPage'))
const ProfilePage = lazy(() => import('@/pages/shared/ProfilePage'))

// ---------------------------------------------------------------------------
// Loading fallback
// ---------------------------------------------------------------------------
function PageLoader() {
  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-brand-border border-t-brand-bronze rounded-full animate-spin mx-auto mb-3" />
        <p className="text-brand-muted text-sm">Loading…</p>
      </div>
    </div>
  )
}

function StaffRedirect() {
  const location = useLocation()
  const adminPath = `/admin${location.pathname.slice('/staff'.length)}${location.search}${location.hash}`
  return <Navigate to={adminPath === '/admin' ? '/admin' : adminPath} replace />
}

function RequireAuth({ children }: { children: ReactElement }) {
  const token = getStoredAuthToken()
  const user = getStoredAuthUser()
  if (!token || !user) {
    return <Navigate to="/login" replace />
  }
  return children
}

function RequireRole({
  role,
  children,
}: {
  role: 'Admin' | 'Donor'
  children: ReactElement
}) {
  const user = getStoredAuthUser()
  if (!user || user.role !== role) {
    return <Navigate to="/login" replace />
  }
  return children
}

// ---------------------------------------------------------------------------
// App root
// ---------------------------------------------------------------------------
export default function App() {
  const { role, setRole } = useRole()
  const [theme, setThemeState] = useState<ThemePreference>(() => getThemePreference())

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    saveThemePreference(theme)
  }, [theme])

  const themeContext = useMemo(() => ({
    theme,
    setTheme: setThemeState,
  }), [theme])

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      <ThemeContext.Provider value={themeContext}>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <CookieConsentBanner />
            <Routes>
            {/* ── Public ─────────────────────────────────────────────────── */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/programs" element={<ProgramsPage />} />
            <Route path="/impact" element={<ImpactPage />} />
            <Route path="/donate" element={<DonatePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />

            {/* ── Concept previews ───────────────────────────────────────── */}
            <Route path="/concepts/saas" element={<ConceptB />} />
            <Route path="/concepts/sanctuary" element={<ConceptC />} />

            {/* ── Auth ───────────────────────────────────────────────────── */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* ── Donor portal — has its own layout (top bar + sidebar) ──── */}
            <Route path="/donor" element={<RequireAuth><RequireRole role="Donor"><DonorDashboardPage /></RequireRole></RequireAuth>} />
            <Route path="/donor/donations" element={<RequireAuth><RequireRole role="Donor"><DonorDashboardPage /></RequireRole></RequireAuth>} />
            <Route path="/donor/impact" element={<RequireAuth><RequireRole role="Donor"><DonorDashboardPage /></RequireRole></RequireAuth>} />
            <Route path="/donor/campaigns" element={<RequireAuth><RequireRole role="Donor"><DonorDashboardPage /></RequireRole></RequireAuth>} />
            <Route path="/donor/messages" element={<RequireAuth><RequireRole role="Donor"><DonorDashboardPage /></RequireRole></RequireAuth>} />
            <Route path="/donor/profile" element={<RequireAuth><RequireRole role="Donor"><ProfilePage /></RequireRole></RequireAuth>} />

            {/* ── Admin + staff workspace — single unified layout ────────── */}
            <Route path="/admin" element={<RequireAuth><RequireRole role="Admin"><AdminShell /></RequireRole></RequireAuth>}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="cases" element={<CaseListPage />} />
              <Route path="cases/:id" element={<CaseDetailPage />} />
              <Route path="counseling" element={<CounselingListPage />} />
              <Route path="counseling/:id" element={<CounselingDetailPage />} />
              <Route path="home-visits" element={<HomeVisitsPage />} />
              <Route path="interventions" element={<InterventionsPage />} />
              <Route path="conferences" element={<ConferencesPage />} />
              <Route path="outcomes" element={<OutcomesPage />} />
              <Route path="donors" element={<StaffDonorListPage />} />
              <Route path="donors/:id" element={<StaffDonorProfilePage />} />
              <Route path="campaigns" element={<CampaignsPage />} />
              <Route path="social" element={<SocialMediaPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="roles" element={<AdminRolesPage />} />
              <Route path="audit" element={<AdminAuditPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="staff-dashboard" element={<StaffDashboardPage />} />
              <Route path="staff-settings" element={<StaffSettingsPage />} />
            </Route>

            {/* ── Legacy staff URLs redirect into admin workspace ────────── */}
            <Route path="/staff/*" element={<StaffRedirect />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ThemeContext.Provider>
    </RoleContext.Provider>
  )
}
