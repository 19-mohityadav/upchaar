/**
 * patientRoutes.jsx
 * ─────────────────────────────────────────────────
 * Defines routes for the Patient Portal.
 *
 * Auth: Uses PatientContext (Supabase Auth + profiles table).
 *       New patients sign up → Supabase Auth user created →
 *       row inserted in `public.profiles` with
 *       profile_type = 'patient'.
 *
 * Layout: PatientLayout wraps the dashboard pages.
 *
 * Route structure:
 *  /patient/login     → Patient sign-in page
 *  /patient/register  → New patient registration
 *  /patient/*         → Protected patient dashboard
 * ─────────────────────────────────────────────────
 */

import { Route } from 'react-router-dom';

// ── Auth pages ────────────────────────────────────
import PatientLogin from '@/patient/pages/PatientLogin.jsx';
import PatientRegister from '@/patient/pages/PatientRegister.jsx';

// ── Dashboard ─────────────────────────────────────
import PatientDashboard from '@/patient/pages/PatientDashboard.jsx';

/**
 * PatientRoutes
 * Returns <Route> elements for the patient portal.
 * Used inside the master <Routes> in routes/index.jsx.
 */
export function PatientRoutes() {
    return (
        <>
            {/* Standalone auth pages (no layout wrapper) */}
            <Route path="/patient/login" element={<PatientLogin />} />
            <Route path="/patient/register" element={<PatientRegister />} />

            {/* Protected patient dashboard */}
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
        </>
    );
}
