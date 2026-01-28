
import React, { useState, useEffect } from 'react';
import { SHIFT_SLOTS } from '../constants';
import { SelectedShift, Availability, Signup } from '../types';
import { saveSignup, fetchAllSignups } from '../services/firebase';

interface StudentSignupProps {
  onSuccess: (signup: Signup) => void;
  onBack: () => void;
}

const StudentSignup: React.FC<StudentSignupProps> = ({ onSuccess, onBack }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedShiftIds, setSelectedShiftIds] = useState<string[]>([]);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, Availability>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signupCounts, setSignupCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const allSignups = await fetchAllSignups();
        const counts: Record<string, number> = {};
        SHIFT_SLOTS.forEach(slot => counts[slot.id] = 0);
        
        allSignups.forEach(s => {
          s.selectedShifts.forEach(shift => {
            if (counts[shift.shiftId] !== undefined) {
              counts[shift.shiftId]++;
            }
          });
        });
        setSignupCounts(counts);
      } catch (err) {
        console.error("Failed to load counts", err);
      } finally {
        setLoading(false);
      }
    };
    loadCounts();
  }, []);

  const toggleShift = (id: string, isFull: boolean) => {
    if (isFull && !selectedShiftIds.includes(id)) return;
    
    if (selectedShiftIds.includes(id)) {
      setSelectedShiftIds(prev => prev.filter(i => i !== id));
      const newMap = { ...availabilityMap };
      delete newMap[id];
      setAvailabilityMap(newMap);
    } else {
      if (selectedShiftIds.length >= 2) return;
      setSelectedShiftIds(prev => [...prev, id]);
      setAvailabilityMap(prev => ({ ...prev, [id]: 'Full Semester' }));
    }
  };

  const handleAvailabilityChange = (id: string, value: Availability) => {
    setAvailabilityMap(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedShiftIds.length !== 2) {
      setError('Please select exactly 2 shift slots.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const shifts: SelectedShift[] = selectedShiftIds.map(id => ({
      shiftId: id,
      availability: availabilityMap[id]
    }));

    const signupData = { name, email, selectedShifts: shifts };

    try {
      await saveSignup(signupData);
      onSuccess(signupData as Signup);
    } catch (err) {
      setError('Submission failed. A slot might have filled up or your connection dropped.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-20 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-500 font-medium">Loading available slots...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 max-w-4xl w-full mx-auto">
      <div className="bg-indigo-600 p-8 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-3xl font-bold">Shift Selection Form</h2>
            <p className="text-indigo-100 opacity-90 text-lg">Spring 2026 Student Assistant Program</p>
          </div>
          <button onClick={onBack} className="bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded-lg transition-colors text-sm font-semibold">Logout</button>
        </div>
        
        <div className="bg-indigo-700/50 rounded-xl p-4 border border-indigo-400/30 text-sm leading-relaxed">
          <strong className="block mb-1">Instructions:</strong>
          <ul className="list-disc list-inside space-y-1 text-indigo-50">
            <li>Select <strong>exactly 2</strong> shifts that fit your schedule.</li>
            <li>Each shift is a semester-long commitment.</li>
            <li>You can specify if you are available for the Full Semester, Q1 Only, or Q2 Only for each individual slot.</li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-10">
        <div>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800">1. Select Your Slots</h3>
              <p className="text-sm text-slate-500">Pick two unique time slots from the list below</p>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm transition-all ${selectedShiftIds.length === 2 ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'}`}>
              {selectedShiftIds.length} / 2 Selected
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SHIFT_SLOTS.map((slot) => {
              const count = signupCounts[slot.id] || 0;
              const remaining = slot.capacity - count;
              const isFull = remaining <= 0;
              const isSelected = selectedShiftIds.includes(slot.id);
              const isDisabled = !isSelected && (selectedShiftIds.length >= 2 || isFull);
              
              return (
                <div 
                  key={slot.id}
                  onClick={() => toggleShift(slot.id, isFull)}
                  className={`
                    group relative cursor-pointer p-5 rounded-2xl border-2 transition-all select-none
                    ${isSelected 
                      ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-50' 
                      : isFull 
                        ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                        : isDisabled
                          ? 'border-slate-100 bg-slate-50/50 opacity-40 grayscale cursor-not-allowed'
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="pr-4">
                      <p className={`font-bold text-lg leading-tight ${isSelected ? 'text-indigo-700' : isFull ? 'text-slate-400' : 'text-slate-800'}`}>
                        {slot.name}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        {isFull ? (
                          <span className="text-xs font-bold uppercase text-red-500 bg-red-50 px-2 py-0.5 rounded">Full</span>
                        ) : (
                          <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${remaining < 5 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>
                            {remaining} of {slot.capacity} spots remaining
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center transition-all
                      ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 group-hover:bg-slate-200 text-slate-400'}
                    `}>
                      {isSelected ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : isFull ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedShiftIds.length > 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-xl font-bold text-slate-800">2. Set Availability per Slot</h3>
            <div className="grid gap-4">
              {selectedShiftIds.map(id => {
                const slot = SHIFT_SLOTS.find(s => s.id === id);
                return (
                  <div key={id} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex-1">
                      <span className="text-indigo-600 font-bold block mb-1">SELECTED SLOT:</span>
                      <span className="text-slate-800 font-semibold text-lg leading-tight">{slot?.name}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(['Full Semester', 'Q1 Only', 'Q2 Only'] as Availability[]).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleAvailabilityChange(id, opt)}
                          className={`
                            px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex-1 lg:flex-none whitespace-nowrap
                            ${availabilityMap[id] === opt 
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' 
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
                            }
                          `}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <hr className="border-slate-100" />

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-800">3. Personal Details</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium"
                placeholder="e.g. Taro APU"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">APU Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium"
                placeholder="e.g. taro@apu.ac.jp"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm border border-red-100 flex items-center gap-3">
             <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || selectedShiftIds.length !== 2 || !name || !email}
          className={`
            w-full font-black py-5 rounded-2xl shadow-xl transition-all text-lg uppercase tracking-wider
            ${isSubmitting || selectedShiftIds.length !== 2 || !name || !email
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:-translate-y-1 shadow-indigo-200 active:scale-95'
            }
          `}
        >
          {isSubmitting ? 'Processing...' : 'Complete Shift Signup'}
        </button>
      </form>
    </div>
  );
};

export default StudentSignup;
