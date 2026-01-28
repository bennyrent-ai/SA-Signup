
import React from 'react';
import { Signup } from '../types';
import { SHIFT_SLOTS } from '../constants';

interface SuccessScreenProps {
  signup: Signup;
  onReset: () => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ signup, onReset }) => {
  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center max-w-2xl mx-auto border border-slate-100 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
      
      <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">You're Signed Up!</h2>
      <p className="text-slate-500 mb-10 text-lg">Your shift selection has been successfully recorded for Spring 2026.</p>
      
      <div className="bg-slate-50 rounded-2xl p-8 mb-10 border-2 border-dashed border-slate-200 text-left">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Your Confirmation Details</h3>
        
        <div className="space-y-6">
          <div className="flex justify-between border-b border-slate-100 pb-4">
            <span className="text-slate-500 font-bold">Name</span>
            <span className="text-slate-800 font-black">{signup.name}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-4">
            <span className="text-slate-500 font-bold">Email</span>
            <span className="text-slate-800 font-black">{signup.email}</span>
          </div>
          
          <div className="space-y-4 pt-2">
            <span className="text-indigo-600 font-black text-xs uppercase block">Selected Shifts:</span>
            {signup.selectedShifts.map((ss, idx) => {
              const slot = SHIFT_SLOTS.find(s => s.id === ss.shiftId);
              return (
                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                  <div>
                    <div className="text-slate-800 font-extrabold leading-tight">{slot?.name}</div>
                    <div className="text-[10px] font-black text-indigo-500 uppercase mt-1">{ss.availability}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
           <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
           <p className="text-xs font-bold text-indigo-800 italic">Please take a screenshot of this section for your records.</p>
        </div>
      </div>
      
      <button
        onClick={onReset}
        className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black py-4 rounded-2xl transition-all uppercase tracking-widest shadow-lg active:scale-95"
      >
        Done
      </button>
    </div>
  );
};

export default SuccessScreen;
