import React, { useState, useEffect } from 'react';
import { Mail, MapPin, Search, Building, X, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/api';

export default function EmployeesDashboard() {
  const [query, setQuery] = useState('');
  const [employees, setEmployees] = useState([]);
  const [fetchError, setFetchError] = useState('');
  const [loading, setLoading] = useState(true);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', role: '', department: '', location: '', email: '' });
  const [addError, setAddError] = useState('');

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // ── Fetch employees from API ──────────────────────────────────────────────
  const loadEmployees = () => {
    setLoading(true);
    setFetchError('');
    apiFetch('/api/employees')
      .then(res => {
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        return res.json();
      })
      .then(data => setEmployees(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('Failed to load employees:', err);
        setFetchError('Could not load employees from server.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadEmployees(); }, []);

  // ── Live filter ───────────────────────────────────────────────────────────
  const filtered = employees.filter(e =>
    [e.name, e.role, e.department, e.location, e.email].some(f =>
      (f || '').toLowerCase().includes(query.toLowerCase())
    )
  );

  // ── Add employee (client-side only — no POST endpoint yet) ────────────────
  const handleAdd = () => {
    if (!newEmployee.name || !newEmployee.email) {
      setAddError('Name and Email are required.');
      return;
    }
    const initials = newEmployee.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    setEmployees(prev => [...prev, { ...newEmployee, id: Date.now(), status: 'Active', initials }]);
    setNewEmployee({ name: '', role: '', department: '', location: '', email: '' });
    setAddError('');
    setShowAddModal(false);
  };

  // ── Edit employee ─────────────────────────────────────────────────────────
  const openEdit = (e, employee) => {
    e.preventDefault(); // prevent Link navigation
    e.stopPropagation();
    setEditEmployee({ ...employee });
    setEditError('');
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    if (!editEmployee.name || !editEmployee.email) {
      setEditError('Name and Email are required.');
      return;
    }
    setEditSaving(true);
    setEditError('');
    try {
      const res = await apiFetch(`/api/employees/${editEmployee.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editEmployee.name,
          email: editEmployee.email,
          department: editEmployee.department,
          location: editEmployee.location,
          status: editEmployee.status,
        }),
      });
      if (!res.ok) throw new Error('Update failed');
      const updated = await res.json();
      setEmployees(prev => prev.map(e => e.id === updated.id ? updated : e));
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update employee:', err);
      setEditError('Could not save changes. Please try again.');
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl tracking-tight font-semibold text-on-surface mb-2">Employees</h1>
          <p className="text-lg text-on-surface-variant">Manage and view all talent in the organization.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search talent..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-md bg-surface-container border-0 focus:ring-1 focus:ring-primary w-64 text-sm outline-none"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2 bg-on-surface text-surface rounded-md font-medium shadow-md whitespace-nowrap"
          >
            Add Employee
          </button>
        </div>
      </header>

      {loading && <p className="text-on-surface-variant text-sm">Loading employees…</p>}
      {fetchError && <p className="text-sm text-error">{fetchError}</p>}

      {!loading && filtered.length === 0 && (
        <p className="text-on-surface-variant text-sm">No employees match your search.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(employee => (
          <div key={employee.id} className="relative group">
            <Link to={`/profile/${employee.id}`} className="block">
              <div className="bg-surface-container-lowest p-6 rounded-lg shadow-[0_10px_30px_rgba(50,50,53,0.06)] hover:shadow-[0_10px_40px_rgba(50,50,53,0.1)] transition-all border border-outline-variant/10 h-full flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant font-bold">
                      {employee.initials}
                    </div>
                    <div>
                      <h3 className="font-semibold text-on-surface group-hover:text-primary transition-colors">{employee.name}</h3>
                      <p className="text-sm text-on-surface-variant">{employee.role}</p>
                    </div>
                  </div>
                  <span className={`text-[0.65rem] uppercase tracking-wider font-semibold px-2 py-1 rounded ${employee.status === 'Active' ? 'bg-primary/10 text-primary' : 'bg-surface-variant text-on-surface-variant'}`}>
                    {employee.status}
                  </span>
                </div>
                <div className="mt-auto pt-4 border-t border-outline-variant/15 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-on-surface-variant flex items-center gap-2"><Building className="w-3.5 h-3.5" /> Department</span>
                    <span className="font-medium text-on-surface">{employee.department}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-on-surface-variant flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Location</span>
                    <span className="font-medium text-on-surface">{employee.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-on-surface-variant flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> Email</span>
                    <span className="font-medium text-on-surface truncate max-w-[120px]">{employee.email}</span>
                  </div>
                </div>
              </div>
            </Link>
            {/* Edit button — sits on top of the card link */}
            <button
              onClick={(e) => openEdit(e, employee)}
              title="Edit employee"
              className="absolute top-4 right-14 z-10 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* ── Add Employee Modal ─────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAddModal(false)}>
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-md p-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-on-surface">Add New Employee</h2>
              <button onClick={() => setShowAddModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>
            {addError && <p className="text-sm text-red-400 mb-4">{addError}</p>}
            <div className="flex flex-col gap-4">
              {[
                { label: 'Full Name *', key: 'name', placeholder: 'Jane Doe' },
                { label: 'Email *', key: 'email', placeholder: 'jane@precision.com' },
                { label: 'Role / Title', key: 'role', placeholder: 'e.g. Frontend Engineer' },
                { label: 'Department', key: 'department', placeholder: 'e.g. Engineering' },
                { label: 'Location', key: 'location', placeholder: 'e.g. Remote' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 block">{f.label}</label>
                  <input
                    type="text"
                    value={newEmployee[f.key]}
                    onChange={e => setNewEmployee(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full bg-surface-container rounded-lg px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              ))}
              <button onClick={handleAdd} className="mt-2 px-5 py-2.5 bg-primary text-on-primary rounded-md font-medium border-0 hover:bg-primary/90 transition-all">
                Add Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Employee Modal ────────────────────────────────────────────── */}
      {showEditModal && editEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowEditModal(false)}>
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-md p-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-on-surface">Edit Employee</h2>
              <button onClick={() => setShowEditModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>
            {editError && <p className="text-sm text-red-400 mb-4">{editError}</p>}
            <div className="flex flex-col gap-4">
              {[
                { label: 'Full Name *', key: 'name', placeholder: 'Jane Doe' },
                { label: 'Email *', key: 'email', placeholder: 'jane@precision.com' },
                { label: 'Department', key: 'department', placeholder: 'e.g. Engineering' },
                { label: 'Location', key: 'location', placeholder: 'e.g. Remote' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 block">{f.label}</label>
                  <input
                    type="text"
                    value={editEmployee[f.key] || ''}
                    onChange={e => setEditEmployee(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full bg-surface-container rounded-lg px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              ))}
              {/* Status toggle */}
              <div>
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 block">Status</label>
                <select
                  value={editEmployee.status || 'Active'}
                  onChange={e => setEditEmployee(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-surface-container rounded-lg px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
              <button
                onClick={handleEdit}
                disabled={editSaving}
                className="mt-2 px-5 py-2.5 bg-primary text-on-primary rounded-md font-medium border-0 hover:bg-primary/90 transition-all disabled:opacity-60"
              >
                {editSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}