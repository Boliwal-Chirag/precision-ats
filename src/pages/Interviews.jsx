import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, X, Star, CheckCircle } from 'lucide-react';
import { apiFetch } from '../services/api';

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFeedback, setActiveFeedback] = useState(null);
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [recommendation, setRecommendation] = useState('');
  
  // Custom confirm modal
  const [showConfirm, setShowConfirm] = useState(false);
  const [candidateToHire, setCandidateToHire] = useState(null);
  const [hiring, setHiring] = useState(false);

  useEffect(() => {
    apiFetch('/api/manager/interviews')
      .then(res => res.json())
      .then(data => setInterviews(Array.isArray(data) ? data.map(d => ({ ...d, feedback: null })) : []))
      .catch(err => console.error('Failed to load interviews:', err))
      .finally(() => setLoading(false));
  }, []);

  const openFeedback = (id) => {
    setActiveFeedback(id);
    setRating(0);
    setNotes('');
    setRecommendation('');
  };

  const submitFeedback = () => {
    if (!recommendation) return;
    setInterviews(prev =>
      prev.map(iv =>
        iv.id === activeFeedback
          ? { ...iv, feedback: { rating, notes, recommendation } }
          : iv
      )
    );
    setActiveFeedback(null);
  };

  const openHireConfirm = (candidateId, candidateName) => {
    setCandidateToHire({ id: candidateId, name: candidateName });
    setShowConfirm(true);
  };

  const handleHire = async () => {
    if (!candidateToHire) return;
    setHiring(true);
    try {
      const res = await apiFetch(`/api/manager/hire/${candidateToHire.id}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setInterviews(prev => prev.filter(iv => iv.id !== candidateToHire.id));
        setShowConfirm(false);
        setCandidateToHire(null);
        alert(data.message || `${candidateToHire.name} has been hired!`);
      } else {
        alert(data.error || 'Failed to hire candidate.');
      }
    } catch (err) {
      console.error('Hire error:', err);
      alert('An error occurred while hiring.');
    } finally {
      setHiring(false);
    }
  };

  const currentInterview = interviews.find(iv => iv.id === activeFeedback);

  if (loading) return <div className="p-8 text-on-surface-variant">Loading interviews…</div>;

  return (
    <div className="flex flex-col gap-10 max-w-5xl">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl tracking-tight font-semibold text-on-surface mb-2">Candidate Interviews</h1>
          <p className="text-lg text-on-surface-variant">Review upcoming candidate interviews and leave feedback.</p>
        </div>
      </header>

      {interviews.length === 0 && (
        <p className="text-on-surface-variant text-sm">No candidate interviews scheduled at this time.</p>
      )}

      <div className="flex flex-col gap-4">
        {interviews.map((interview) => (
          <div key={interview.id} className="bg-surface-container-lowest p-6 rounded-lg shadow-[0_10px_30px_rgba(50,50,53,0.06)] border border-outline-variant/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded bg-tertiary-container text-on-tertiary-container flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2">
                  {interview.candidate}
                  <span className="text-sm font-normal text-on-surface-variant">• {interview.role}</span>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
                    interview.status === 'Interviewing' 
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {interview.status || 'Applied'}
                  </span>
                </h3>
                <div className="flex items-center gap-4 text-sm text-on-surface-variant mt-1">
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {interview.date || 'TBD'} at {interview.time}</span>
                  <span className="flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> Video Call</span>
                </div>
                {interview.feedback && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= interview.feedback.rating ? 'text-amber-400 fill-amber-400' : 'text-on-surface-variant/30'}`} />
                      ))}
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${interview.feedback.recommendation === 'Hire' ? 'bg-emerald-500/10 text-emerald-400' : interview.feedback.recommendation === 'No Hire' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {interview.feedback.recommendation}
                    </span>
                    <span className="text-xs text-on-surface-variant">Feedback submitted</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-surface-container text-xs uppercase tracking-wider font-semibold text-on-surface-variant rounded">
                {interview.type}
              </span>
              <button
                onClick={() => openFeedback(interview.id)}
                className={`px-5 py-2 rounded-md font-medium shadow-sm transition-all border-0 ${interview.feedback ? 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high' : 'bg-primary text-on-primary hover:bg-primary/90'}`}
              >
                {interview.feedback ? 'Update Feedback' : 'Leave Feedback'}
              </button>
              <button
                onClick={() => openHireConfirm(interview.id, interview.candidate)}
                className="px-5 py-2 rounded-md font-medium shadow-sm transition-all border-0 bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" /> Hire
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Feedback Modal */}
      {activeFeedback && currentInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setActiveFeedback(null)}>
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-md p-8 mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold text-on-surface">Leave Feedback</h2>
              <button onClick={() => setActiveFeedback(null)} className="text-on-surface-variant hover:text-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-on-surface-variant mb-6">{currentInterview.candidate} — {currentInterview.role}</p>

            <div className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2 block">Overall Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setRating(s)} className="transition-transform hover:scale-110">
                      <Star className={`w-7 h-7 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-on-surface-variant/30'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2 block">Recommendation *</label>
                <div className="flex gap-2">
                  {['Hire', 'Hold', 'No Hire'].map(r => (
                    <button
                      key={r}
                      onClick={() => setRecommendation(r)}
                      className={`flex-1 py-2 rounded-md text-sm font-semibold border transition-all ${
                        recommendation === r
                          ? r === 'Hire' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : r === 'No Hire' ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-surface-container text-on-surface-variant border-transparent hover:border-outline-variant/30'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2 block">Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Share your observations about the candidate..."
                  className="w-full bg-surface-container rounded-lg px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-outline-variant/15">
              <button onClick={() => setActiveFeedback(null)} className="flex-1 px-4 py-2.5 rounded-md text-sm font-medium text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-all border-0">
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                disabled={!recommendation}
                className="flex-1 px-4 py-2.5 bg-primary text-on-primary rounded-md font-medium text-sm border-0 hover:bg-primary/90 transition-all disabled:opacity-40"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Hire Confirmation Modal */}
      {showConfirm && candidateToHire && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowConfirm(false)}>
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-sm p-8 mx-4 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold text-on-surface mb-2">Hire Candidate?</h2>
            <p className="text-sm text-on-surface-variant mb-8">
              Are you sure you want to promote <strong>{candidateToHire.name}</strong> to an active employee?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirm(false)} 
                className="flex-1 px-4 py-2.5 rounded-md text-sm font-medium text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-all border-0"
              >
                Cancel
              </button>
              <button
                onClick={handleHire}
                disabled={hiring}
                className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-md font-medium text-sm border-0 hover:bg-emerald-700 transition-all disabled:opacity-50"
              >
                {hiring ? 'Hiring...' : 'Yes, Hire'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
