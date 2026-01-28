
import React, { useState } from 'react';
import { UserView, Signup } from './types';
import { STUDENT_CODE, ADMIN_CODE } from './constants';
import { isStandalone } from './services/firebase';
import AccessControl from './components/AccessControl';
import StudentSignup from './components/StudentSignup';
import AdminDashboard from './components/AdminDashboard';
import SuccessScreen from './components/SuccessScreen';

const App: React.FC = () => {
  const [view, setView] = useState<UserView>(UserView.LOGIN);
  const [error, setError] = useState<string | null>(null);
  const [lastSignup, setLastSignup] = useState<Signup | null>(null);

  const handleLogin = (code: string) => {
    setError(null);
    if (code === STUDENT_CODE) {
      setView(UserView.STUDENT);
    } else if (code === ADMIN_CODE) {
      setView(UserView.ADMIN);
    } else {
      setError('Invalid access code. Please try again.');
    }
  };

  const handleSignupSuccess = (signup: Signup) => {
    setLastSignup(signup);
    setView(UserView.SUCCESS);
  };

  const handleLogout = () => {
    setView(UserView.LOGIN);
    setLastSignup(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      {isStandalone() && view !== UserView.SUCCESS && (
        <div className="fixed top-0 left-0 w-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest py-1 text-center z-50">
          Running in Standalone Demo Mode (Local Storage)
        </div>
      )}

      <div className="w-full max-w-5xl">
        {view === UserView.LOGIN && (
          <AccessControl onLogin={handleLogin} error={error} />
        )}

        {view === UserView.STUDENT && (
          <StudentSignup onSuccess={handleSignupSuccess} onBack={handleLogout} />
        )}

        {view === UserView.ADMIN && (
          <AdminDashboard onBack={handleLogout} />
        )}

        {view === UserView.SUCCESS && lastSignup && (
          <SuccessScreen signup={lastSignup} onReset={handleLogout} />
        )}
      </div>

      <footer className="mt-8 text-slate-400 text-sm pb-8">
        SA Shift Selection System &copy; 2026 APU
      </footer>
    </div>
  );
};

export default App;
