import React, { useState, useEffect } from 'react';
import { MoreHorizontal, X, Eye, MessageSquare, UserCheck } from 'lucide-react';
import { apiFetch } from '../services/api';

export default function MyTeam() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);
  const [viewingMember, setViewingMember] = useState(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(null);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = () => {
    setLoading(true);
    apiFetch('/api/manager/team')
      .then(res => res.json())
      .then(data => setTeam(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to fetch team', err))
      .finally(() => setLoading(false));
  };

  const handleViewProfile = (member) => {
    setViewingMember(member);
    setNotesDraft(member.notes || '');
    setOpenMenu(null);
  };

  const handleSaveNotes = () => {
    if (!viewingMember) return;
    apiFetch(`/api/manager/team/${viewingMember.id}/notes`, {
      method: 'PUT',
      body: JSON.stringify({ notes: notesDraft })
    })
    .then(res => res.json())
    .then(() => {
      setTeam(prev => prev.map(m => m.id === viewingMember.id ? { ...m, notes: notesDraft } : m));
      setViewingMember(prev => ({ ...prev, notes: notesDraft }));
      setViewingMember(null); // optional: close modal
    })
    .catch(err => console.error('Failed to save notes', err));
  };

  const handleUpdateStatus = (memberId, newStatus) => {
    // We would need a backend endpoint for status update for manager, or they can use the employee update api if they have permissions. For now we will update local state.
    setTeam(prev => prev.map(m => m.id === memberId ? { ...m, status: newStatus } : m));
    setShowStatusModal(null);
    setOpenMenu(null);
  };

  return (
    <div className="flex flex-col gap-10 max-w-6xl">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl tracking-tight font-semibold text-on-surface mb-2">My Team</h1>
          <p className="text-lg text-on-surface-variant">View and manage your direct reports and their skill allocations.</p>
        </div>
      </header>

      {loading ? (
        <p className="text-on-surface-variant text-sm">Loading team...</p>
      ) : (
      <div className="bg-surface-container-lowest rounded-lg shadow-[0_10px_30px_rgba(50,50,53,0.06)] overflow-visible border border-outline-variant/15">
        <table className="w-full text-left">
          <thead className="bg-surface-container-low border-b border-outline-variant/15">
            <tr>
              <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Employee</th>
              <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Role</th>
              <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-on-surface-variant text-center">Skill Match</th>
              <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-on-surface-variant text-center">Status</th>
              <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {team.map((member) => (
              <tr key={member.id} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {member.name ? member.name.split(' ').filter(n => n.length>0).map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?'}
                    </div>
                    <span className="font-semibold text-on-surface">{member.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-on-surface-variant text-sm">{member.role}</td>
                <td className="py-4 px-6 text-center">
                  <span className="inline-block px-3 py-1 rounded bg-secondary-container text-on-secondary-container text-sm font-semibold">
                    {member.match || 'N/A'}
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className={`text-[0.65rem] uppercase tracking-wider font-semibold px-2 py-1 rounded ${member.status === 'Active' ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>
                    {member.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="relative inline-block">
                    <button
                      onClick={() => setOpenMenu(openMenu === member.id ? null : member.id)}
                      className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded hover:bg-surface-container"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    {openMenu === member.id && (
                      <div className="absolute right-0 top-8 z-20 bg-surface-container-lowest rounded-lg shadow-xl border border-outline-variant/20 w-44 py-1 overflow-hidden">
                        <button
                          onClick={() => handleViewProfile(member)}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors text-left"
                        >
                          <Eye className="w-4 h-4 text-on-surface-variant" /> View Profile
                        </button>
                        <button
                          onClick={() => { setShowStatusModal(member.id); setOpenMenu(null); }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors text-left"
                        >
                          <UserCheck className="w-4 h-4 text-on-surface-variant" /> Update Status
                        </button>
                         <button
                          onClick={() => { window.location.href = `mailto:${member.email}`; setOpenMenu(null); }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors text-left"
                        >
                          <MessageSquare className="w-4 h-4 text-on-surface-variant" /> Send Email
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {/* View Profile / Notes Modal */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setViewingMember(null)}>
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-md p-8 mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-on-surface">{viewingMember.name}</h2>
                <p className="text-sm text-on-surface-variant">{viewingMember.role}</p>
              </div>
              <button onClick={() => setViewingMember(null)} className="text-on-surface-variant hover:text-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-3 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Skills</span>
                <span className="font-medium text-on-surface">{viewingMember.skills || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Skill Match</span>
                <span className="font-semibold text-on-secondary-container bg-secondary-container px-2 py-0.5 rounded">{viewingMember.match || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Status</span>
                <span className={`text-[0.65rem] uppercase tracking-wider font-semibold px-2 py-1 rounded ${viewingMember.status === 'Active' ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>{viewingMember.status}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2 block">Manager Notes</label>
              <textarea
                value={notesDraft}
                onChange={e => setNotesDraft(e.target.value)}
                rows={4}
                placeholder="Add private notes about this team member..."
                className="w-full bg-surface-container rounded-lg px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
            <button
              onClick={handleSaveNotes}
              className="mt-4 w-full px-4 py-2.5 bg-primary text-on-primary rounded-md font-medium text-sm border-0 hover:bg-primary/90 transition-all"
            >
              Save Notes
            </button>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowStatusModal(null)}>
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-sm p-8 mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-on-surface">Update Status</h2>
              <button onClick={() => setShowStatusModal(null)} className="text-on-surface-variant hover:text-on-surface"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-col gap-2">
              {['Active', 'Needs Review', 'On Leave', 'Inactive'].map(s => (
                <button
                  key={s}
                  onClick={() => handleUpdateStatus(showStatusModal, s)}
                  className="text-left px-4 py-3 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-sm font-medium text-on-surface"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Close dropdown on outside click */}
      {openMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
      )}
    </div>
  );
}
