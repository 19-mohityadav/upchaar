/**
 * adminRoutes.jsx
 * ─────────────────────────────────────────────────
 * Defines routes for the Admin Portal.
 *
 * Roles served:
 *  - super_admin  – full access to all pages
 *  - support_admin – limited access (no super-admin-only pages)
 *
 * Auth: Uses AdminContext (Supabase-backed).
 * Layout: AdminLayout provides the sidebar + top bar.
 *
 * Route structure:
 *  /admin/login       → Public login page
 *  /admin/*           → Protected (requires admin session)
 * ─────────────────────────────────────────────────
 */

import { Route } from 'react-router-dom';

// ── Admin layout & login ──────────────────────────
import AdminLayout from '@/admin/layouts/AdminLayout.jsx';
import AdminLogin from '@/admin/pages/AdminLogin.jsx';

// ── Admin dashboard pages ─────────────────────────
import AdminDashboard from '@/admin/pages/AdminDashboard.jsx';
import DoctorManagement from '@/admin/pages/DoctorManagement.jsx';
import PatientManagement from '@/admin/pages/PatientManagement.jsx';
import AppointmentManagement from '@/admin/pages/AppointmentManagement.jsx';
import NotificationCenter from '@/admin/pages/NotificationCenter.jsx';
import ActivityLogs from '@/admin/pages/ActivityLogs.jsx';
import Settings from '@/admin/pages/Settings.jsx';

// ── Super Admin only pages ────────────────────────
import FacilitiesManagement from '@/admin/pages/FacilitiesManagement.jsx';
import SupportAdminManagement from '@/admin/pages/SupportAdminManagement.jsx';
import BloggerManagement from '@/admin/pages/BloggerManagement.jsx';

/**
 * AdminRoutes
 * Returns <Route> elements for the admin portal.
 * Used inside the master <Routes> in routes/index.jsx.
 */
export function AdminRoutes() {
    return (
        <>
            {/* Standalone admin login page (no layout wrapper) */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected admin routes — all share AdminLayout */}
            <Route path="/admin" element={<AdminLayout />}>

                {/* Default redirect: /admin → /admin/dashboard */}
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />

                {/* Management pages */}
                <Route path="doctors" element={<DoctorManagement />} />
                <Route path="patients" element={<PatientManagement />} />
                <Route path="appointments" element={<AppointmentManagement />} />
                <Route path="notifications" element={<NotificationCenter />} />
                <Route path="logs" element={<ActivityLogs />} />
                <Route path="settings" element={<Settings />} />

                {/* Super Admin only — guarded inside AdminLayout via role check */}
                <Route path="facilities" element={<FacilitiesManagement />} />
                <Route path="support-admins" element={<SupportAdminManagement />} />
                <Route path="bloggers" element={<BloggerManagement />} />
            </Route>
        </>
    );
}
