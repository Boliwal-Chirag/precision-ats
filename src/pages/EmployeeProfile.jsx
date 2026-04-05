import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Mail, Phone, MapPin, Building, Briefcase, X, Plus, Calendar, Star, Award, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';

export default function EmployeeProfile() {
  const { user } = useAuth();
  const { id } = useParams();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(null);
  const [newSkill, setNewSkill] = useState('');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchId = id || user?.id;
    if (!fetchId) return;

    setLoading(true);
    apiFetch(`/api/employees/${fetchId}`)
      .then(async res => {
        if (!res.ok) {
          const detail = await res.text();
          throw new Error(detail || `Server error ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setEmployee({
          ...data,
          skills: data.skills || ['Communication', 'Teamwork'],
          bio: data.notes || 'No bio provided.',
          phone: data.phone || '+91 98765 43210',
        });
      })
      .catch(err => {
        console.error('Failed to load employee:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [id, user]);

  useEffect(() => {
    if (employee) setDraft({ ...employee });
  }, [employee]);
  const handleSave = () => {
    // Optimistic save (should POST to actual API normally)
    setEmployee({ ...draft }); 
    setEditing(false); 
  };
  
  const handleEdit = () => {
    setDraft({ ...employee });
    setEditing(true);
  };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !draft.skills.includes(trimmed)) {
      setDraft(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
    }
    setNewSkill('');
  };
  const handleRemoveSkill = (skill) => {
    setDraft(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  if (loading) return <div className="p-8 text-on-surface-variant flex items-center justify-center">Loading profile...</div>;
  if (!employee) return <div className="p-8 text-on-surface flex items-center justify-center">Employee not found.</div>;

  const initials = employee.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const tabs = [
    { id: 'profile', label: 'My Profile' },
    { id: 'leaves', label: 'Leave Requests' },
    { id: 'performance', label: 'Performance' },
    { id: 'certifications', label: 'Certifications' }
  ];

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row items-start md:items-center gap-8 pb-6 border-b border-outline-variant/15">
        <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant text-3xl font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl tracking-tight font-semibold text-on-surface">{employee.name}</h1>
            <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded bg-primary/10 text-primary">
              {employee.status}
            </span>
          </div>
          <p className="text-lg text-on-surface-variant">{employee.role}</p>
        </div>
        <div>
          <button onClick={handleEdit} className="px-6 py-2.5 rounded-md text-on-primary bg-primary hover:bg-primary/90 transition-all font-medium border-0">
            Edit Profile
          </button>
        </div>
      </section>

      {/* Tabs Menu */}
      <div className="flex gap-4 border-b border-outline-variant/15">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content: Profile */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 flex flex-col gap-8">
            <section className="bg-surface-container-lowest p-8 rounded-lg shadow-[0_10px_30px_rgba(50,50,53,0.06)]">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant mb-6">About</h2>
              <p className="text-on-surface leading-relaxed text-lg">{employee.bio}</p>
            </section>
            <section className="bg-surface-container-lowest p-8 rounded-lg shadow-[0_10px_30px_rgba(50,50,53,0.06)]">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant mb-6">Skills & Expertise</h2>
              <div className="flex flex-wrap gap-3">
                {employee.skills.map((skill) => (
                  <span key={skill} className="px-4 py-2 bg-surface-container text-on-surface-variant font-medium rounded-md text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          </div>
          <div className="flex flex-col gap-6">
            <section className="bg-surface-container-low p-6 rounded-lg">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-5">Contact Details</h2>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 text-on-surface"><Mail className="w-4 h-4 text-on-surface-variant" /><span className="text-sm font-medium">{employee.email}</span></div>
                <div className="flex items-center gap-3 text-on-surface"><Phone className="w-4 h-4 text-on-surface-variant" /><span className="text-sm font-medium">{employee.phone}</span></div>
              </div>
            </section>
            <section className="bg-surface-container-low p-6 rounded-lg">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-5">Organization</h2>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 text-on-surface"><Briefcase className="w-4 h-4 text-on-surface-variant" /><span className="text-sm font-medium">{employee.role}</span></div>
                <div className="flex items-center gap-3 text-on-surface"><Building className="w-4 h-4 text-on-surface-variant" /><span className="text-sm font-medium">{employee.department}</span></div>
                <div className="flex items-center gap-3 text-on-surface"><MapPin className="w-4 h-4 text-on-surface-variant" /><span className="text-sm font-medium">{employee.location}</span></div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Tab Content: Leaves */}
      {activeTab === 'leaves' && (
        <section className="bg-surface-container-lowest p-8 rounded-lg shadow-[0_10px_30px_rgba(50,50,53,0.06)] flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant mb-2">Leave Requests</h2>
            <button onClick={() => setShowLeaveModal(true)} className="px-5 py-2 bg-primary text-on-primary rounded-md font-medium text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" /> New Request
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {employee.leaves && employee.leaves.length > 0 ? employee.leaves.map((leave) => (
              <div key={leave.id} className="flex justify-between items-center p-4 border border-outline-variant/15 rounded-lg bg-surface-container-low/30">
                <div>
                  <p className="font-semibold text-on-surface">{leave.type}</p>
                  <p className="text-sm text-on-surface-variant">{leave.dates}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded ${leave.status === 'Approved' ? 'bg-primary/10 text-primary' : 'bg-secondary-container text-on-secondary-container'}`}>
                  {leave.status}
                </span>
              </div>
            )) : <p className="text-on-surface-variant text-sm">No leave requests found.</p>}
          </div>
        </section>
      )}

      {/* Tab Content: Performance */}
      {activeTab === 'performance' && (
        <section className="bg-surface-container-lowest p-8 rounded-lg shadow-[0_10px_30px_rgba(50,50,53,0.06)] flex flex-col gap-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Past Performance Reviews</h2>
          <div className="flex flex-col gap-6">
            {employee.performanceReviews && employee.performanceReviews.length > 0 ? employee.performanceReviews.map((review) => (
              <div key={review.id} className="p-5 border border-outline-variant/15 rounded-lg bg-surface-container-low/30 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-on-surface">{review.period}</span>
                  <span className="flex items-center gap-1 text-primary text-sm font-semibold bg-primary/10 px-2 py-1 rounded">
                    <Star className="w-3.5 h-3.5" fill="currentColor" /> {review.rating}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">"{review.feedback}"</p>
              </div>
            )) : <p className="text-on-surface-variant text-sm">No performance reviews available.</p>}
          </div>
        </section>
      )}

      {/* Tab Content: Certifications */}
      {activeTab === 'certifications' && (
        <section className="bg-surface-container-lowest p-8 rounded-lg shadow-[0_10px_30px_rgba(50,50,53,0.06)] flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">My Certifications</h2>
            <button className="px-5 py-2 bg-surface-container text-on-surface-variant hover:text-on-surface rounded-md font-medium text-sm flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4" /> Add Certification
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {employee.certifications && employee.certifications.length > 0 ? employee.certifications.map((cert) => (
              <div key={cert.id} className="p-5 border border-outline-variant/15 rounded-lg bg-surface-container-low/30 flex items-start gap-4">
                <div className="w-10 h-10 rounded bg-secondary-container text-on-secondary-container flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface mb-1 leading-snug">{cert.name}</h3>
                  <p className="text-xs text-on-surface-variant">Issued: {cert.issueDate}</p>
                </div>
              </div>
            )) : <p className="text-on-surface-variant text-sm col-span-2">No certifications documented.</p>}
          </div>
        </section>
      )}

      {/* Edit Profile Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto py-8" onClick={() => setEditing(false)}>
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-lg p-8 mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-on-surface">Edit Profile</h2>
              <button onClick={() => setEditing(false)} className="text-on-surface-variant hover:text-on-surface"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
              {[
                { label: 'Full Name', key: 'name' },
                { label: 'Role / Title', key: 'role' },
                { label: 'Department', key: 'department' },
                { label: 'Email', key: 'email' },
                { label: 'Phone', key: 'phone' },
                { label: 'Location', key: 'location' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5 block">{f.label}</label>
                  <input type="text" value={draft[f.key]} onChange={e => setDraft(prev => ({ ...prev, [f.key]: e.target.value }))} className="w-full bg-surface-container rounded-lg px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5 block">Bio</label>
                <textarea value={draft.bio} onChange={e => setDraft(prev => ({ ...prev, bio: e.target.value }))} rows={3} className="w-full bg-surface-container rounded-lg px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2 block">Skills</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {draft.skills.map(skill => (
                    <span key={skill} className="flex items-center gap-1.5 px-3 py-1 bg-surface-container rounded-md text-sm font-medium text-on-surface-variant">
                      {skill}
                      <button onClick={() => handleRemoveSkill(skill)} className="text-on-surface-variant hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddSkill()} placeholder="Add a skill..." className="flex-1 bg-surface-container rounded-lg px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30" />
                  <button onClick={handleAddSkill} className="px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-outline-variant/15">
              <button onClick={() => setEditing(false)} className="flex-1 px-4 py-2.5 rounded-md text-sm font-medium text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-all border-0">Cancel</button>
              <button onClick={handleSave} className="flex-1 px-4 py-2.5 bg-primary text-on-primary rounded-md font-medium text-sm border-0 hover:bg-primary/90 transition-all">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Request Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto py-8" onClick={() => setShowLeaveModal(false)}>
           <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-sm p-8 mx-4" onClick={e => e.stopPropagation()}>
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-on-surface">Request Leave</h2>
                <button onClick={() => setShowLeaveModal(false)} className="text-on-surface-variant hover:text-on-surface"><X className="w-5 h-5" /></button>
             </div>
             <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5 block">Leave Type</label>
                  <select className="w-full bg-surface-container rounded-lg px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30">
                    <option>Vacation</option>
                    <option>Sick Leave</option>
                    <option>Personal Time Off</option>
                  </select>
                </div>
                <div>
                   <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5 block">Start Date</label>
                   <input type="date" className="w-full bg-surface-container rounded-lg px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                   <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5 block">End Date</label>
                   <input type="date" className="w-full bg-surface-container rounded-lg px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
             </div>
             <button onClick={() => setShowLeaveModal(false)} className="mt-6 w-full flex-1 px-4 py-2.5 bg-primary text-on-primary rounded-md font-medium text-sm border-0 hover:bg-primary/90 transition-all flex justify-center items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Submit Request
             </button>
           </div>
        </div>
      )}
    </div>
  );
}
