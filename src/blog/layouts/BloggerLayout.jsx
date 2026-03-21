import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useBlog } from '../context/BlogContext.jsx';
import { PenLine, LayoutDashboard, FileText, BarChart2, User, LogOut, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const NAV = [
    { to: '/blogger/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/blogger/write', icon: PenLine, label: 'Write New' },
    { to: '/blogger/posts', icon: FileText, label: 'My Posts' },
    { to: '/blogger/profile', icon: User, label: 'Profile' },
];

export default function BloggerLayout() {
    const { blogger, logoutBlogger, loading } = useBlog();
    const [collapsed, setCollapsed] = useState(false);

    // Wait for Supabase session restore before deciding to redirect
    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-[#f1f5f9]">
            <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
        </div>
    );

    if (!blogger) return <Navigate to="/blogger/login" replace />;

    const initials = blogger.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div className="flex h-screen bg-[#f1f5f9] overflow-hidden">
            {/* Sidebar */}
            <motion.aside
                animate={{ width: collapsed ? 64 : 210 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="relative flex flex-col bg-white border-r border-slate-200 shadow-sm flex-shrink-0 overflow-hidden z-20">

                {/* Logo */}
                <div className="flex items-center gap-2 px-4 py-5 border-b border-slate-100 h-16">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center flex-shrink-0">
                        <PenLine className="text-white" size={15} />
                    </div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                                className="font-bold text-sm text-primary whitespace-nowrap">
                                Blogger Studio
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                {/* Nav */}
                <nav className="flex flex-col gap-1 p-3 flex-1">
                    {NAV.map(({ to, icon: Icon, label }) => (
                        <NavLink key={to} to={to}
                            className={({ isActive }) => cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                                isActive ? 'bg-primary text-white shadow-md shadow-primary/25' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                            )}>
                            {({ isActive }) => (
                                <>
                                    <Icon size={17} className={cn('flex-shrink-0', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600')} />
                                    <AnimatePresence>
                                        {!collapsed && (
                                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
                                                {label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom */}
                <div className="p-3 border-t border-slate-100 space-y-1">
                    <a href="/blogs" target="_blank" rel="noreferrer"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition group">
                        <ExternalLink size={14} className="flex-shrink-0" />
                        <AnimatePresence>{!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>View Blog</motion.span>}</AnimatePresence>
                    </a>
                    <button onClick={logoutBlogger}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-50 hover:text-red-500 w-full transition">
                        <LogOut size={14} className="flex-shrink-0" />
                        <AnimatePresence>{!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Sign Out</motion.span>}</AnimatePresence>
                    </button>
                </div>

                {/* Collapse toggle */}
                <button onClick={() => setCollapsed(c => !c)}
                    className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-slate-200 bg-white shadow flex items-center justify-center text-slate-400 hover:text-primary transition-colors z-10">
                    <span className="text-xs">{collapsed ? '›' : '‹'}</span>
                </button>
            </motion.aside>

            {/* Main */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center gap-4 px-6 flex-shrink-0">
                    <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">{blogger.name}</p>
                        <p className="text-[11px] text-slate-400">{blogger.specialty}</p>
                    </div>
                    <NavLink to="/blogger/write"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all">
                        <PenLine size={14} /> New Post
                    </NavLink>
                    <div className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-white text-sm"
                        style={{ background: blogger.avatarColor }}>
                        {initials}
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
