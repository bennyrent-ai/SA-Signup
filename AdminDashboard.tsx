
import React, { useEffect, useState } from 'react';
import { Signup, Availability } from '../types';
import { SHIFT_SLOTS } from '../constants';
import { fetchAllSignups, deleteSignup } from '../services/firebase';

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAllSignups();
      setSignups(data);
    } catch (err) {
      setError('Failed to fetch signups.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      await deleteSignup(id);
      setSignups(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  const getSlotCount = (id: string) => {
    return signups.reduce((acc, s) => {
      return acc + (s.selectedShifts.some(ss => ss.shiftId === id) ? 1 : 0);
    }, 0);
  };

  const exportToCSV = () => {
    if (signups.length === 0) return;

    const headers = ['Timestamp', 'Name', 'Email', 'Shift 1 Name', 'Shift 1 Availability', 'Shift 2 Name', 'Shift 2 Availability'];
    
    const rows = signups.map(s => {
      const shift1 = SHIFT_SLOTS.find(slot => slot.id === s.selectedShifts[0].shiftId);
      const shift2 = SHIFT_SLOTS.find(slot => slot.id === s.selectedShifts[1].shiftId);
      
      return [
        s.timestamp?.toDate ? s.timestamp.toDate().toLocaleString() : 'N/A',
        `"${s.name.replace(/"/g, '""')}"`,
        s.email,
        `"${shift1?.name || ''}"`,
        s.selectedShifts[0].availability,
        `"${shift2?.name || ''}"`,
        s.selectedShifts[1].availability
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sa_signups_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getBadgeColor = (avail: Availability) => {
    switch(avail) {
      case 'Full Semester': return 'bg-green-100 text-green-700 border-green-200';
      case 'Q1 Only': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Q2 Only': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const totalShiftsFilled = signups.length * 2;
  const totalCapacity = SHIFT_SLOTS.reduce((acc, slot) => acc + slot.capacity, 0);

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-w-6xl w-full mx-auto">
      <div className="bg-slate-900 p-8 text-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-bold">Admin Dashboard</h2>
            <p className="text-slate-400 mt-1">Real-time Spring 2026 Shift Management</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={exportToCSV}
              className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              Export CSV
            </button>
            <button 
              onClick={onBack}
              className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg"
            >
              Exit Portal
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {SHIFT_SLOTS.map(slot => {
            const count = getSlotCount(slot.id);
            const percent = (count / slot.capacity) * 100;
            return (
              <div key={slot.id} className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{slot.id.toUpperCase()}</span>
                  <span className={`text-xs font-bold ${count >= slot.capacity ? 'text-red-400' : 'text-indigo-400'}`}>{count}/{slot.capacity}</span>
                </div>
                <div className="text-sm font-bold mb-3 truncate" title={slot.name}>{slot.name}</div>
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${count >= slot.capacity ? 'bg-red-500' : 'bg-indigo-500'}`} 
                    style={{ width: `${Math.min(100, percent)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 flex items-center justify-between text-sm font-bold text-slate-400">
          <span>Overall Progress: {totalShiftsFilled} / {totalCapacity} Shifts Assigned</span>
          <span>{Math.round((totalShiftsFilled / totalCapacity) * 100)}% Capacity</span>
        </div>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="p-20 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-500">Retrieving signups...</p>
          </div>
        ) : error ? (
          <div className="p-20 text-center text-red-500 font-bold">{error}</div>
        ) : signups.length === 0 ? (
          <div className="p-20 text-center text-slate-400 font-medium">No students have signed up yet.</div>
        ) : (
          <div className="space-y-12">
            {SHIFT_SLOTS.map(slot => {
              const slotSignups = signups.filter(s => s.selectedShifts.some(ss => ss.shiftId === slot.id));
              if (slotSignups.length === 0) return null;

              return (
                <div key={slot.id} className="animate-in fade-in duration-500">
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-xl font-extrabold text-slate-800">{slot.name}</h3>
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{slotSignups.length} Signups</span>
                  </div>
                  <div className="overflow-x-auto bg-slate-50 rounded-2xl border border-slate-100">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Availability</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Signed On</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {slotSignups.map((s) => {
                          const shiftDetail = s.selectedShifts.find(ss => ss.shiftId === slot.id);
                          return (
                            <tr key={`${s.id}-${slot.id}`} className="hover:bg-indigo-50/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-bold text-slate-800">{s.name}</div>
                                <div className="text-xs text-slate-500">{s.email}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${getBadgeColor(shiftDetail?.availability || 'Full Semester')}`}>
                                  {shiftDetail?.availability}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs font-medium text-slate-400">
                                {s.timestamp?.toDate ? s.timestamp.toDate().toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button 
                                  onClick={() => s.id && handleDelete(s.id)}
                                  className="text-slate-300 hover:text-red-500 p-2 transition-colors rounded-lg hover:bg-red-50"
                                  title="Delete entire record"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
