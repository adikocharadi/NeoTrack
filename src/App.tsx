/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useAuth } from './lib/useAuth';
import { Dashboard } from './components/Dashboard';
import { BabyDetail } from './components/BabyDetail';
import { BabyForm } from './components/BabyForm';
import { Baby } from './types';
import { LogIn, Plus, LogOut, ChevronLeft } from 'lucide-react';

export default function App() {
  const { user, loading, login, logout } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'detail' | 'add'>('dashboard');
  const [selectedBaby, setSelectedBaby] = useState<Baby | null>(null);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
          <Plus size={40} />
        </div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">NeoTrack NICU</h1>
        <p className="mb-8 max-w-xs text-slate-500">
          Professional patient tracking for neonatal intensive care doctors.
        </p>
        <button
          onClick={login}
          className="flex items-center gap-3 rounded-full bg-slate-900 px-8 py-4 font-semibold text-white transition-all hover:bg-slate-800 active:scale-95 shadow-md"
        >
          <LogIn size={20} />
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {currentView !== 'dashboard' && (
              <button 
                onClick={() => {
                  setCurrentView('dashboard');
                  setSelectedBaby(null);
                }}
                className="mr-2 p-1 text-slate-500 hover:text-slate-900"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <h1 className="text-xl font-bold text-slate-900">
              {currentView === 'dashboard' ? 'NeoTrack' : currentView === 'detail' ? 'Baby Detail' : 'Add Profile'}
            </h1>
          </div>
          <button
            onClick={logout}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            title="Sign out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-lg">
        {currentView === 'dashboard' && (
          <Dashboard 
            onSelectBaby={(baby) => {
              setSelectedBaby(baby);
              setCurrentView('detail');
            }} 
            onAddBaby={() => setCurrentView('add')}
          />
        )}
        {currentView === 'detail' && selectedBaby && (
          <BabyDetail baby={selectedBaby} />
        )}
        {currentView === 'add' && (
          <BabyForm onComplete={() => setCurrentView('dashboard')} onCancel={() => setCurrentView('dashboard')} />
        )}
      </main>
    </div>
  );
}
