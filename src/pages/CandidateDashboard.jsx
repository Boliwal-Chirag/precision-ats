import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Clock, Presentation, Award, Briefcase } from 'lucide-react';

export default function CandidateDashboard() {
  const { user } = useAuth();
  
  // user.status determines current step: Applied, Interviewing, Offered, Hired
  const status = user?.status || 'Applied';
  
  const steps = [
    { name: 'Applied', icon: Clock, completed: ['Applied', 'Interviewing', 'Offered', 'Hired'].includes(status) },
    { name: 'Interviewing', icon: Presentation, completed: ['Interviewing', 'Offered', 'Hired'].includes(status) },
    { name: 'Offered', icon: Award, completed: ['Offered', 'Hired'].includes(status) },
    { name: 'Hired', icon: CheckCircle, completed: status === 'Hired' },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-10 w-full px-4">
      <div className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/15 shadow-sm">
        <h1 className="text-3xl tracking-tight font-semibold text-on-surface mb-2">Welcome, {user?.name.split(' ')[0]}</h1>
        <p className="text-lg text-on-surface-variant">Track your application pipeline below.</p>
        
        <div className="mt-10 mb-6 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/15 flex flex-col md:flex-row items-center gap-6">
           <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
             <Briefcase className="w-8 h-8" />
           </div>
           <div>
             <h2 className="text-xl font-bold text-on-surface">General Application</h2>
             <p className="text-on-surface-variant text-sm mt-1">Software Engineering Track &middot; Location Agnostic</p>
           </div>
        </div>

        <div className="mt-10 relative">
          {/* Progress Line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-container-high -translate-y-1/2 z-0 hidden md:block rounded-full"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6 md:gap-0">
            {steps.map((step, index) => {
              const active = status === step.name;
              return (
                <div key={index} className="flex flex-col items-center flex-1 text-center bg-surface-container-low md:bg-transparent">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md ${
                    step.completed ? 'bg-primary text-on-primary ring-4 ring-primary/20' : 'bg-surface-container text-on-surface-variant border-2 border-outline-variant/30'
                  }`}>
                    <step.icon className={`w-6 h-6 ${active && !step.completed ? 'animate-pulse' : ''}`} />
                  </div>
                  <h3 className={`mt-4 font-semibold ${step.completed ? 'text-primary' : 'text-on-surface-variant'}`}>{step.name}</h3>
                  {active && <span className="text-xs bg-secondary-container text-on-secondary-container px-2 py-1 rounded-full mt-2 font-bold tracking-wider uppercase">In Progress</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-14 bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/15 border-l-4 border-l-primary">
          <h3 className="font-bold text-lg text-on-surface mb-2">What's Next?</h3>
          {status === 'Applied' && <p className="text-on-surface-variant leading-relaxed">Our recruitment team is reviewing your application for open positions. If your profile matches what we're looking for, we will invite you to an introductory behavioral interview.</p>}
          {status === 'Interviewing' && <p className="text-on-surface-variant leading-relaxed">You are currently in the interview stages. Check your email for links to technical assessments and panel interview schedules with our product and engineering groups.</p>}
          {status === 'Offered' && <p className="text-on-surface-variant leading-relaxed">Congratulations! We have extended an offer to you. Please log in to your external candidate portal or review the docusign sent to your email to accept the offer.</p>}
          {status === 'Hired' && <p className="text-on-surface-variant leading-relaxed">Welcome aboard! Since you're officially hired, your profile will be automatically converted to an Employee account. Next time you log in, you will be redirected to the Precision ATS Employee Interface.</p>}
        </div>
      </div>
    </div>
  );
}
