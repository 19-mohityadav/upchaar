/**
 * publicRoutes.jsx
 * ─────────────────────────────────────────────────
 * Defines all publicly accessible routes that any
 * visitor (unauthenticated) can reach.
 *
 * Covers:
 *  - Main landing page
 *  - Patient-facing feature pages (doctors, hospitals, etc.)
 *  - Public blog listing and individual post pages
 *
 * Layout: All wrapped in <AppLayout> which renders the
 * top navigation bar and footer.
 * ─────────────────────────────────────────────────
 */

import { Route } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';

// ── Public pages ──────────────────────────────────
import LandingPage from '@/pages/Landing';
import DashboardPage from '@/pages/Dashboard';
import DoctorsPage from '@/pages/Doctors';
import DoctorDetailPage from '@/pages/DoctorDetail.jsx';
import DiagnosticsPage from '@/pages/Diagnostics';
import HospitalsPage from '@/pages/Hospitals';
import RecordsPage from '@/pages/Records';
import EmergencyPage from '@/pages/Emergency';

// ── Blog public pages ─────────────────────────────
import BlogsPage from '@/pages/Blogs.jsx';
import BlogPostPage from '@/pages/BlogPost.jsx';

/**
 * PublicRoutes
 * Returns an array of <Route> elements for public pages.
 * Used inside the master <Routes> in routes/index.jsx.
 */
export function PublicRoutes() {
    return (
        <>
            {/* Landing / Home */}
            <Route path="/" element={<LandingPage />} />

            {/* Patient-facing feature pages */}
            <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
            <Route path="/doctors" element={<AppLayout><DoctorsPage /></AppLayout>} />
            <Route path="/doctors/:id" element={<AppLayout><DoctorDetailPage /></AppLayout>} />
            <Route path="/diagnostics" element={<AppLayout><DiagnosticsPage /></AppLayout>} />
            <Route path="/hospitals" element={<AppLayout><HospitalsPage /></AppLayout>} />
            <Route path="/records" element={<AppLayout><RecordsPage /></AppLayout>} />
            <Route path="/emergency" element={<EmergencyPage />} />

            {/* Blog – public listing and post detail */}
            <Route path="/blogs" element={<AppLayout><BlogsPage /></AppLayout>} />
            <Route path="/blogs/:slug" element={<AppLayout><BlogPostPage /></AppLayout>} />
        </>
    );
}
