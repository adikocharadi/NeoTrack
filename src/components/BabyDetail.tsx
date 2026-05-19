import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Baby, WeightEntry } from '../types';
import { WeightForm } from './WeightForm';
import { WeightChart } from './WeightChart';
import { calculateDOL, calculatePMA, formatPMA, calculateWeightStats, cn } from '../lib/utils';
import { Plus, Trash2, Scale, Calendar, Clock, TrendingUp, TrendingDown, History, Info, Activity, Sparkles, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface BabyDetailProps {
  baby: Baby;
}

export function BabyDetail({ baby }: BabyDetailProps) {
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'babies', baby.id, 'weights'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const weightData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WeightEntry));
      setWeights(weightData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `babies/${baby.id}/weights`);
    });

    return () => unsubscribe();
  }, [baby.id]);

  const dol = calculateDOL(baby.birthDateTime.toDate());
  const pma = calculatePMA(baby.gaWeeks, baby.gaDays, dol);
  const stats = calculateWeightStats(baby.birthWeight, weights);

  useEffect(() => {
    if (weights.length >= 2) {
      const fetchInsights = async () => {
        setAiLoading(true);
        try {
          const response = await fetch('/api/insights', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              baby,
              weights: weights.slice(0, 5), // last 5 weight entries
              dol,
              pma: formatPMA(pma.weeks, pma.days)
            })
          });
          const data = await response.json();
          setAiSummary(data.text);
        } catch (error) {
          console.error("Failed to fetch AI insights", error);
        } finally {
          setAiLoading(false);
        }
      };
      
      const timer = setTimeout(fetchInsights, 1000); // Debounce
      return () => clearTimeout(timer);
    }
  }, [weights.length, baby.id]);

  const handleDeleteWeight = async (weightId: string) => {
    if (!confirm('Are you sure you want to delete this recording?')) return;
    try {
      await deleteDoc(doc(db, 'babies', baby.id, 'weights', weightId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `babies/${baby.id}/weights/${weightId}`);
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header Info */}
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">{baby.name}</h2>
          <span className={cn(
            "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider",
            baby.status === 'admitted' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
          )}>
            {baby.status}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Calendar size={16} />
            <span>Birth: {format(baby.birthDateTime.toDate(), 'PPP')}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Clock size={16} />
            <span>Time: {format(baby.birthDateTime.toDate(), 'p')}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Scale size={16} />
            <span>Birth Wt: <strong className="text-slate-700">{baby.birthWeight}g</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Info size={16} />
            <span>GA: <strong className="text-slate-700">{baby.gaWeeks}w {baby.gaDays}d</strong></span>
          </div>
        </div>
      </section>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-blue-600 p-4 text-white shadow-md shadow-blue-200">
          <p className="text-xs font-bold uppercase tracking-wider opacity-80 decoration-white/20">Day of Life</p>
          <h4 className="text-3xl font-black">DOL {dol}</h4>
        </div>
        <div className="rounded-2xl bg-indigo-600 p-4 text-white shadow-md shadow-indigo-200">
          <p className="text-xs font-bold uppercase tracking-wider opacity-80">Postmenstrual Age</p>
          <h4 className="text-3xl font-black">{formatPMA(pma.weeks, pma.days)}</h4>
        </div>
      </div>

      {/* AI Summary Section */}
      <AnimatePresence>
        {(aiSummary || aiLoading) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-gradient-to-br from-indigo-50 to-blue-50 p-6 ring-1 ring-blue-100"
          >
            <div className="mb-2 flex items-center gap-2 text-blue-700">
              <Sparkles size={18} />
              <h3 className="text-sm font-bold uppercase tracking-wider">Clinical Insight</h3>
            </div>
            {aiLoading ? (
              <div className="flex items-center gap-2 py-2">
                <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:0.2s]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:0.4s]" />
                <p className="text-sm italic text-blue-400">Analyzing trends...</p>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-indigo-900/80 font-medium italic">
                "{aiSummary}"
              </p>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Weight Summary Card with CHART */}
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <Activity className="text-blue-600" size={20} />
             <h3 className="font-bold text-slate-900">Clinical Weight Stats</h3>
          </div>
        </div>

        <WeightChart weights={weights} birthWeight={baby.birthWeight} />

        <div className="mt-8 space-y-6">
          {/* Main Stats Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="mb-1 text-[10px] font-bold uppercase text-slate-400">Today</p>
              <p className="text-lg font-black text-slate-900">{stats.todayWeight ? `${stats.todayWeight}g` : '—'}</p>
            </div>
            <div className="text-center">
              <p className="mb-1 text-[10px] font-bold uppercase text-slate-400">Yesterday</p>
              <p className="text-lg font-bold text-slate-500">{stats.yesterdayWeight ? `${stats.yesterdayWeight}g` : '—'}</p>
            </div>
            <div className="text-center">
              <p className="mb-1 text-[10px] font-bold uppercase text-slate-400">Day Prior</p>
              <p className="text-lg font-medium text-slate-400">{stats.dayBeforeYesterdayWeight ? `${stats.dayBeforeYesterdayWeight}g` : '—'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="mb-1 text-[10px] font-bold uppercase text-slate-400">Daily Gain</p>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xl font-black",
                  (stats.gainSinceYesterday || 0) > 0 ? "text-emerald-600" : (stats.gainSinceYesterday || 0) < 0 ? "text-rose-600" : "text-slate-600"
                )}>
                  {stats.gainSinceYesterday !== null ? `${stats.gainSinceYesterday > 0 ? '+' : ''}${stats.gainSinceYesterday}g` : 'N/A'}
                </span>
                {stats.gainSinceYesterday !== null && (
                  stats.gainSinceYesterday > 0 ? <TrendingUp size={16} className="text-emerald-500" /> : <TrendingDown size={16} className="text-rose-500" />
                )}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="mb-1 text-[10px] font-bold uppercase text-slate-400">3-Day Avg</p>
              <p className="text-xl font-black text-slate-900">
                {stats.threeDayAvg !== null ? `${stats.threeDayAvg.toFixed(1)}g/d` : 'N/A'}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-dashed border-slate-100 p-4">
            <p className="mb-2 text-center text-[10px] font-bold uppercase text-slate-400">Cumulative Progress (vs Birth)</p>
            <div className="flex items-center justify-center gap-6">
               <div className="text-center">
                 <p className="text-2xl font-black text-slate-900">
                  {stats.cumulativeGain !== null ? `${stats.cumulativeGain > 0 ? '+' : ''}${stats.cumulativeGain}g` : '—'}
                 </p>
               </div>
               <div className="h-8 w-px bg-slate-100" />
               <div className="text-center">
                 <p className={cn(
                   "text-2xl font-black",
                   (stats.cumulativeGainPercent || 0) > 0 ? "text-emerald-600" : "text-slate-600"
                 )}>
                  {stats.cumulativeGainPercent !== null ? `${stats.cumulativeGainPercent > 0 ? '+' : ''}${stats.cumulativeGainPercent.toFixed(1)}%` : '—'}
                 </p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Weight History Table */}
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <History className="text-blue-600" size={20} />
             <h3 className="font-bold text-slate-900">Weight History</h3>
          </div>
        </div>

        {loading ? (
          <p className="py-4 text-center text-sm text-slate-400">Loading history...</p>
        ) : weights.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No weight entries recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pr-2 font-bold">Date</th>
                  <th className="pb-3 pr-2 font-bold">Weight</th>
                  <th className="pb-3 pr-2 font-bold">Notes</th>
                  <th className="pb-3 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {weights.map((w) => (
                  <tr key={w.id} className="group hover:bg-slate-50/50">
                    <td className="py-4 pr-2 font-medium text-slate-700">{format(new Date(w.date), 'MMM d')}</td>
                    <td className="py-4 pr-2">
                      <span className="font-bold text-slate-900">{w.weight}g</span>
                    </td>
                    <td className="py-4 pr-2 text-slate-500 line-clamp-1 max-w-[80px]">{w.notes || '—'}</td>
                    <td className="py-4 text-right">
                      <button 
                        onClick={() => handleDeleteWeight(w.id)}
                        className="rounded-full p-2 text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* FAB to add weight */}
      <button
        onClick={() => setShowWeightForm(true)}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 active:scale-95 transition-all"
      >
        <Plus size={32} />
      </button>

      {showWeightForm && (
        <WeightForm 
          babyId={baby.id} 
          onComplete={() => setShowWeightForm(false)} 
          onCancel={() => setShowWeightForm(false)} 
        />
      )}
    </div>
  );
}
