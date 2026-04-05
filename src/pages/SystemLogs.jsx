import React, { useState, useEffect } from 'react';
import { ShieldAlert, UserPlus, FileEdit, Database, UserCheck, Briefcase, FileText, Trash2 } from 'lucide-react';
import { apiFetch } from '../services/api';

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/admin/logs')
      .then(res => res.json())
      .then(data => setLogs(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to fetch logs:', err))
      .finally(() => setLoading(false));
  }, []);

  const getLogConfig = (log) => {
    const action = log.action;
    const table = log.tableName;

    if (action === 'INSERT') {
      if (table === 'users') return { icon: UserPlus, color: 'text-emerald-400', label: 'New User Created' };
      if (table === 'jobs') return { icon: Briefcase, color: 'text-primary', label: 'Job Requisition Published' };
      if (table === 'applications') return { icon: FileText, color: 'text-amber-400', label: 'New Application Submitted' };
    }
    if (action === 'UPDATE') {
      if (table === 'users') return { icon: FileEdit, color: 'text-blue-400', label: 'User Record Updated' };
      if (table === 'applications') return { icon: UserCheck, color: 'text-emerald-400', label: 'Application Status Updated' };
    }
    if (action === 'DELETE') return { icon: Trash2, color: 'text-red-400', label: 'Record Deleted' };
    
    return { icon: Database, color: 'text-on-surface-variant', label: action };
  };

  const formatTime = (ts) => {
    const date = new Date(ts);
    return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col gap-10 max-w-4xl">
      <header>
        <h1 className="text-3xl tracking-tight font-semibold text-on-surface mb-2">System Logs</h1>
        <p className="text-lg text-on-surface-variant">Review recent auditable activities across the organization.</p>
      </header>

      <div className="bg-surface-container-lowest rounded-lg shadow-[0_10px_30px_rgba(50,50,53,0.06)] border border-outline-variant/15 p-6 min-h-[400px]">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant mb-6">Recent Activity Logs</h2>
        
        {loading ? (
          <div className="flex items-center justify-center h-32 text-on-surface-variant">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-on-surface-variant">No activity logs found.</div>
        ) : (
          <div className="relative pl-6 border-l-2 border-surface-container-high flex flex-col gap-8">
            {logs.map((log) => {
              const config = getLogConfig(log);
              return (
                <div key={log.id} className="relative">
                  <div className="absolute -left-[35px] w-6 h-6 rounded-full bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center">
                    <div className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')}`} />
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded bg-surface-container text-on-surface-variant flex items-center justify-center flex-shrink-0">
                      <config.icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-on-surface">{config.label}</h3>
                      <p className="text-sm text-on-surface-variant mt-1">{log.details}</p>
                      <p className="text-xs text-on-surface-variant/70 font-semibold mt-2 uppercase tracking-wide">
                        {formatTime(log.timestamp)} • System Audit
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
