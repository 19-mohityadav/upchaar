/**
 * adminApi.js
 * ─────────────────────────────────────────────────
 * All Supabase queries used by the Admin portal.
 * Imported by AdminContext and admin page components.
 */
import { supabase } from '@/lib/supabase.js';

// ── Doctors ──────────────────────────────────────────────────────────────────

export async function fetchDoctors() {
    const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('applied_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
}

export async function updateDoctorStatus(doctorId, status, rejectionReason = '') {
    const updates = {
        status,
        rejection_reason: rejectionReason,
        updated_at: new Date().toISOString(),
    };
    if (status === 'Approved') updates.approved_at = new Date().toISOString();
    const { data, error } = await supabase
        .from('doctors')
        .update(updates)
        .eq('id', doctorId)
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
}

// ── Patients ─────────────────────────────────────────────────────────────────

export async function fetchPatients() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('profile_type', 'patient')
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
}

export async function updatePatientStatus(patientId, status) {
    const { data, error } = await supabase
        .from('profiles')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', patientId)
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
}

// ── Appointments ─────────────────────────────────────────────────────────────

export async function fetchAppointments() {
    const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
}

// ── Facilities ───────────────────────────────────────────────────────────────

export async function fetchFacilities() {
    const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .order('added_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
}

export async function addFacility(facility) {
    const { data, error } = await supabase
        .from('facilities')
        .insert([facility])
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
}

export async function updateFacility(id, updates) {
    const { data, error } = await supabase
        .from('facilities')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
}

export async function deleteFacility(id) {
    const { error } = await supabase.from('facilities').delete().eq('id', id);
    if (error) throw new Error(error.message);
}

// ── Settings ─────────────────────────────────────────────────────────────────

export async function fetchSettings() {
    const { data, error } = await supabase.from('settings').select('*');
    if (error) throw new Error(error.message);
    // Convert rows into a flat object { key: value }
    const result = {};
    for (const row of (data || [])) {
        result[row.key] = row.value;
    }
    return result;
}

export async function saveSetting(key, value, adminId) {
    const { error } = await supabase
        .from('settings')
        .upsert({ key, value, updated_at: new Date().toISOString(), updated_by: adminId });
    if (error) throw new Error(error.message);
}

// ── Activity Logs ────────────────────────────────────────────────────────────

export async function fetchLogs(limit = 50) {
    const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) throw new Error(error.message);
    return data || [];
}

export async function logAction({ adminId, adminName, action, target, details }) {
    await supabase.from('activity_logs').insert([{
        admin_id: adminId,
        admin_name: adminName,
        action,
        target: target || '',
        details: details || '',
    }]);
    // Don't throw on log failure — non-critical
}

// ── Bloggers (controllers with role='blogger') ───────────────────────────────

export async function fetchBloggers() {
    const { data, error } = await supabase
        .from('controllers')
        .select('*')
        .eq('role', 'blogger')
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    // Join with posts count
    const bloggers = data || [];
    const { data: postCounts } = await supabase
        .from('posts')
        .select('author_id')
        .in('author_id', bloggers.map(b => b.id));
    const countMap = {};
    for (const p of (postCounts || [])) {
        countMap[p.author_id] = (countMap[p.author_id] || 0) + 1;
    }
    return bloggers.map(b => ({ ...b, posts: countMap[b.id] || 0 }));
}

// ── Dashboard stats (aggregated) ─────────────────────────────────────────────

export async function fetchDashboardStats() {
    const [
        { count: totalDoctors },
        { count: totalPatients },
        { count: totalAppointments },
        { data: revenue },
    ] = await Promise.all([
        supabase.from('doctors').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('profile_type', 'patient'),
        supabase.from('appointments').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('fee').eq('status', 'Completed'),
    ]);
    const totalRevenue = (revenue || []).reduce((sum, a) => sum + (a.fee || 0), 0);
    const platformRevenue = Math.round(totalRevenue * 0.1);
    return { totalDoctors, totalPatients, totalAppointments, totalRevenue, platformRevenue };
}
