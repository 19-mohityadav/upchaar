/**
 * bloggerRoutes.jsx
 * ─────────────────────────────────────────────────
 * Defines routes for the Blogger Portal.
 *
 * Auth: Uses BlogContext (Supabase Auth).
 *       Bloggers are stored in the `controllers` table
 *       with role = 'blogger'.
 *
 * Layout: BloggerLayout wraps all dashboard pages with
 *         the blogger-specific sidebar and navigation.
 *
 * Route structure:
 *  /blogger/login    → Blogger sign-in page
 *  /blogger/*        → Protected blogger dashboard
 * ─────────────────────────────────────────────────
 */

import { Route } from 'react-router-dom';

// ── Blogger layout ────────────────────────────────
import BloggerLayout from '@/blog/layouts/BloggerLayout.jsx';

// ── Auth page ─────────────────────────────────────
import BloggerLogin from '@/blog/pages/BloggerLogin.jsx';

// ── Dashboard pages ───────────────────────────────
import BloggerDashboard from '@/blog/pages/BloggerDashboard.jsx';
import PostEditor from '@/blog/pages/PostEditor.jsx';
import MyPosts from '@/blog/pages/MyPosts.jsx';
import BloggerProfile from '@/blog/pages/BloggerProfile.jsx';

/**
 * BloggerRoutes
 * Returns <Route> elements for the blogger portal.
 * Used inside the master <Routes> in routes/index.jsx.
 */
export function BloggerRoutes() {
    return (
        <>
            {/* Standalone blogger login (no layout wrapper) */}
            <Route path="/blogger/login" element={<BloggerLogin />} />

            {/* Protected blogger routes — all share BloggerLayout */}
            <Route path="/blogger" element={<BloggerLayout />}>

                {/* Default redirect: /blogger → /blogger/dashboard */}
                <Route index element={<BloggerDashboard />} />
                <Route path="dashboard" element={<BloggerDashboard />} />

                {/* Blog management */}
                <Route path="write" element={<PostEditor />} />
                <Route path="edit/:id" element={<PostEditor />} />
                <Route path="posts" element={<MyPosts />} />
                <Route path="profile" element={<BloggerProfile />} />
            </Route>
        </>
    );
}
