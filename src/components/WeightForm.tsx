import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Save, X } from 'lucide-react';

interface WeightFormProps {
  babyId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function WeightForm({ babyId, onComplete, onCancel }: WeightFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !formData.weight) return;
    setLoading(true);

    try {
      await addDoc(collection(db, 'babies', babyId, 'weights'), {
        babyId,
        date: formData.date,
        weight: Number(formData.weight),
        notes: formData.notes,
        recordedBy: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });

      onComplete();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `babies/${babyId}/weights`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center">
      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-lg space-y-6 rounded-3xl bg-white p-6 shadow-2xl animate-in slide-in-from-bottom"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Record New Weight</h3>
          <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Date of Recording</label>
            <input
              required
              type="date"
              className="w-full rounded-xl border-none bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Weight (grams)</label>
            <div className="relative">
              <input
                required
                type="number"
                placeholder="e.g. 1520"
                className="w-full rounded-xl border-none bg-slate-50 px-4 py-3 pr-10 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">g</span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Clinical Notes (Optional)</label>
            <textarea
              rows={3}
              className="w-full rounded-xl border-none bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Fed well, active..."
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl bg-slate-100 py-4 font-bold text-slate-600 transition-colors hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.weight}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 font-bold text-white transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
          >
            {loading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save size={20} />}
            Save Record
          </button>
        </div>
      </form>
    </div>
  );
}
