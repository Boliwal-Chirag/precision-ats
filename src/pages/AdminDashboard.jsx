import React, { useState, useEffect } from 'react';
import { Users, Activity, X, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [pipelineStats, setPipelineStats] = useState({ applied: 0, interviewing: 0, offered: 0, hired: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  // Funnel modal
  const [showFunnel, setShowFunnel] = useState(false);

  // Manage Users modal
  const [showUsers, setShowUsers] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    apiFetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setPipelineStats({
            applied: data.applied || 0,
            interviewing: data.interviewing || 0,
            offered: data.offered || 0,
            hired: data.hired || 0,
            total: data.total || 0,
          });
        }
      })
      .catch(err => console.error('Failed to fetch admin stats:', err))
      .finally(() => setLoading(false));
  }, []);

  const fetchUsers = () => {
    setUsersLoading(true);
    apiFetch('/api/admin/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('Failed to fetch users:', err))
      .finally(() => setUsersLoading(false));
  };

  const openUsers = () => {
    setShowUsers(true);
    fetchUsers();
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setUpdatingId(id);
    try {
      await apiFetch(`/api/admin/users/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const roleLabel = role => {
    if (role === 'ROLE_ADMIN') return { label: 'Admin', cls: 'bg-error/10 text-error' };
    if (role === 'ROLE_MANAGER') return { label: 'Manager', cls: 'bg-secondary/10 text-secondary' };
    if (role === 'ROLE_CANDIDATE') return { label: 'Candidate', cls: 'bg-amber-500/10 text-amber-500' };
    return { label: 'Employee', cls: 'bg-primary/10 text-primary' };
  };

  return (
    <div className="flex flex-col gap-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl tracking-tight font-semibold text-on-surface mb-2">System Administration</h1>
          <p className="text-lg text-on-surface-variant">Manage global settings and access control.</p>
        </div>
        <button className="px-6 py-2.5 bg-primary text-on-primary rounded-md border-0 hover:bg-primary/90 transition-all font-medium shadow-md">
          Generate Reports
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Manage Users card */}
        <div className="bg-surface-container-lowest p-8 rounded-lg shadow-[0_10px_30px_rgba(50,50,53,0.06)] hover:shadow-lg transition-shadow border border-outline-variant/15 flex flex-col gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-on-surface">User Management</h3>
            <p className="text-sm text-on-surface-variant mt-1 mb-4 leading-relaxed">Control roles, permissions, and audit logs across all departments.</p>
            <button
              onClick={openUsers}
              className="text-sm font-medium text-primary hover:underline"
            >
              Manage Users &rarr;
            </button>
          </div>
        </div>

        {/* Hiring Pipeline card */}
        <div className="bg-surface-container-lowest p-8 rounded-lg shadow-[0_10px_30px_rgba(50,50,53,0.06)] hover:shadow-lg transition-shadow border border-outline-variant/15 flex flex-col gap-4">
          <div className="w-12 h-12 bg-secondary-container text-on-secondary-container rounded flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-on-surface">Hiring Pipeline</h3>
            <div className="mt-4 mb-4 grid grid-cols-3 gap-2">
              {[
                { label: 'Applied', value: pipelineStats.applied },
                { label: 'Interview', value: pipelineStats.interviewing },
                { label: 'Hired', value: pipelineStats.hired },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center p-2 rounded bg-surface-container-low text-center">
                  <span className="text-xl font-semibold text-on-surface">{loading ? '-' : s.value}</span>
                  <span className="text-[0.65rem] text-on-surface-variant uppercase tracking-wider mt-1 font-semibold">{s.label}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowFunnel(true)}
              className="text-sm font-medium text-primary hover:underline"
            >
              View Funnel &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* ── Funnel Modal ──────────────────────────────────────────────────── */}
      {showFunnel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowFunnel(false)}>
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-lg p-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-on-surface">Hiring Funnel</h2>
              <button onClick={() => setShowFunnel(false)} className="text-on-surface-variant hover:text-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loading ? (
              <p className="text-on-surface-variant text-sm">Loading...</p>
            ) : (
              <div className="flex flex-col gap-4">
                {[
                  { stage: 'Total Applications', value: pipelineStats.total, color: 'bg-primary', pct: 100 },
                  { stage: 'In Interviews', value: pipelineStats.interviewing, color: 'bg-secondary', pct: pipelineStats.total > 0 ? Math.round((pipelineStats.interviewing / pipelineStats.total) * 100) : 0 },
                  { stage: 'Hired', value: pipelineStats.hired, color: 'bg-emerald-500', pct: pipelineStats.total > 0 ? Math.round((pipelineStats.hired / pipelineStats.total) * 100) : 0 },
                ].map(s => (
                  <div key={s.stage}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-on-surface font-medium">{s.stage}</span>
                      <span className="text-sm font-semibold text-on-surface">{s.value} <span className="text-on-surface-variant font-normal">({s.pct}%)</span></span>
                    </div>
                    <div className="h-3 bg-surface-container rounded-full overflow-hidden">
                      <div className={`h-full ${s.color} rounded-full transition-all`} style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-on-surface-variant mt-2">
                  Total applications tracked: <strong>{pipelineStats.total || pipelineStats.applied}</strong>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Manage Users Modal ────────────────────────────────────────────── */}
      {showUsers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowUsers(false)}>
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-3xl p-8 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-on-surface">Manage Users</h2>
              <div className="flex items-center gap-3">
                <button onClick={fetchUsers} className="text-on-surface-variant hover:text-on-surface" title="Refresh">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button onClick={() => setShowUsers(false)} className="text-on-surface-variant hover:text-on-surface">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {usersLoading ? (
              <p className="text-on-surface-variant text-sm">Loading users...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant/20">
                      <th className="text-left py-2 pr-4 text-on-surface-variant font-semibold uppercase tracking-wider text-xs">Name</th>
                      <th className="text-left py-2 pr-4 text-on-surface-variant font-semibold uppercase tracking-wider text-xs">Email</th>
                      <th className="text-left py-2 pr-4 text-on-surface-variant font-semibold uppercase tracking-wider text-xs">Role</th>
                      <th className="text-left py-2 pr-4 text-on-surface-variant font-semibold uppercase tracking-wider text-xs">Dept</th>
                      <th className="text-left py-2 text-on-surface-variant font-semibold uppercase tracking-wider text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => {
                      const r = roleLabel(u.role);
                      return (
                        <tr key={u.id} className="border-b border-outline-variant/10 hover:bg-surface-container/40">
                          <td className="py-3 pr-4 font-medium text-on-surface">{u.name}</td>
                          <td className="py-3 pr-4 text-on-surface-variant">{u.email}</td>
                          <td className="py-3 pr-4">
                            <span className={`text-[0.65rem] uppercase tracking-wider font-semibold px-2 py-1 rounded ${r.cls}`}>
                              {r.label}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-on-surface-variant">{u.department || '—'}</td>
                          <td className="py-3">
                            <button
                              disabled={updatingId === u.id}
                              onClick={() => toggleStatus(u.id, u.status)}
                              className={`text-[0.65rem] uppercase tracking-wider font-semibold px-2 py-1 rounded cursor-pointer border-0 transition-colors ${u.status === 'Active'
                                  ? 'bg-primary/10 text-primary hover:bg-primary/20'
                                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                                }`}
                            >
                              {updatingId === u.id ? '…' : u.status}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <p className="text-on-surface-variant text-sm mt-4">No users found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}