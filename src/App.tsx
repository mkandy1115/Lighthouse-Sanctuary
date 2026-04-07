import React, { createContext, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useRole } from '@/hooks/useRole'
import type { UserRole } from '@/hooks/useRole'
import AppShell from '@/components/AppShell'

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

// ---------------------------------------------------------------------------
// Public pages
// ---------------------------------------------------------------------------
const HomePage = lazy(() => import('@/pages/public/HomePage'))
const AboutPage = lazy(() => import('@/pages/public/AboutPage'))
const ProgramsPage = lazy(() => import('@/pages/public/ProgramsPage'))
const ImpactPage = lazy(() => import('@/pages/public/ImpactPage'))
const DonatePage = lazy(() => import('@/pages/public/DonatePage'))
const ContactPage = lazy(() => import('@/pages/public/ContactPage'))

// ---------------------------------------------------------------------------
// Concept previews
// ---------------------------------------------------------------------------
const ConceptB = lazy(() => import('@/pages/concepts/ConceptB'))
const ConceptC = lazy(() => import('@/pages/concepts/ConceptC'))

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))

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

// ---------------------------------------------------------------------------
// Shell wrapper — used for staff portal only
// ---------------------------------------------------------------------------
function StaffShell({ children }: { children: React.ReactNode }) {
  return <AppShell role="staff">{children}</AppShell>
}

// ---------------------------------------------------------------------------
// App root
// ---------------------------------------------------------------------------
export default function App() {
  const { role, setRole } = useRole()

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Public ─────────────────────────────────────────────────── */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/programs" element={<ProgramsPage />} />
            <Route path="/impact" element={<ImpactPage />} />
            <Route path="/donate" element={<DonatePage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* ── Concept previews ───────────────────────────────────────── */}
            <Route path="/concepts/saas" element={<ConceptB />} />
            <Route path="/concepts/sanctuary" element={<ConceptC />} />

            {/* ── Auth ───────────────────────────────────────────────────── */}
            <Route path="/login" element={<LoginPage />} />

            {/* ── Staff ──────────────────────────────────────────────────── */}
            <Route
              path="/staff"
              element={<StaffShell><StaffDashboardPage /></StaffShell>}
            />
            <Route
              path="/staff/cases"
              element={<StaffShell><CaseListPage /></StaffShell>}
            />
            <Route
              path="/staff/cases/:id"
              element={<StaffShell><CaseDetailPage /></StaffShell>}
            />
            <Route
              path="/staff/counseling"
              element={<StaffShell><CounselingListPage /></StaffShell>}
            />
            <Route
              path="/staff/counseling/:id"
              element={<StaffShell><CounselingDetailPage /></StaffShell>}
            />
            <Route
              path="/staff/home-visits"
              element={<StaffShell><HomeVisitsPage /></StaffShell>}
            />
            <Route
              path="/staff/interventions"
              element={<StaffShell><InterventionsPage /></StaffShell>}
            />
            <Route
              path="/staff/conferences"
              element={<StaffShell><ConferencesPage /></StaffShell>}
            />
            <Route
              path="/staff/outcomes"
              element={<StaffShell><OutcomesPage /></StaffShell>}
            />
            <Route
              path="/staff/donors"
              element={<StaffShell><StaffDonorListPage /></StaffShell>}
            />
            <Route
              path="/staff/donors/:id"
              element={<StaffShell><StaffDonorProfilePage /></StaffShell>}
            />
            <Route
              path="/staff/campaigns"
              element={<StaffShell><CampaignsPage /></StaffShell>}
            />
            <Route
              path="/staff/social"
              element={<StaffShell><SocialMediaPage /></StaffShell>}
            />
            <Route
              path="/staff/reports"
              element={<StaffShell><ReportsPage /></StaffShell>}
            />
            <Route
              path="/staff/settings"
              element={<StaffShell><StaffSettingsPage /></StaffShell>}
            />

            {/* ── Donor portal — has its own layout (top bar + sidebar) ──── */}
            <Route path="/donor" element={<DonorDashboardPage />} />
            <Route path="/donor/donations" element={<DonorDashboardPage />} />
            <Route path="/donor/impact" element={<DonorDashboardPage />} />
            <Route path="/donor/campaigns" element={<DonorDashboardPage />} />
            <Route path="/donor/messages" element={<DonorDashboardPage />} />
            <Route path="/donor/profile" element={<DonorDashboardPage />} />

            {/* ── Admin — has its own layout (top bar + sidebar) ─────────── */}
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminDashboardPage />} />
            <Route path="/admin/roles" element={<AdminDashboardPage />} />
            <Route path="/admin/audit" element={<AdminDashboardPage />} />
            <Route path="/admin/settings" element={<AdminDashboardPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </RoleContext.Provider>
  )
}
