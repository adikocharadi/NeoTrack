import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Baby, BabyStatus, Sex } from '../types';
import { X, Save } from 'lucide-react';

interface BabyFormProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function BabyForm({ onComplete, onCancel }: BabyFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    babyId: '',
    birthDate: new Date().toISOString().split('T')[0],
    birthTime: '12:00',
    gaWeeks: 30,
    gaDays: 0,
    birthWeight: 1500,
    sex: 'male' as Sex,
    status: 'admitted' as BabyStatus
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);

    try {
      const birthDateTime = new Date(`${formData.birthDate}T${formData.birthTime}`);
      
      await addDoc(collection(db, 'babies'), {
        name: formData.name,
        babyId: formData.babyId,
        birthDateTime: birthDateTime,
        gaWeeks: Number(formData.gaWeeks),
        gaDays: Number(formData.gaDays),
        birthWeight: Number(formData.birthWeight),
        sex: formData.sex,
        status: formData.status,
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      onComplete();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'babies');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Baby Name</label>
            <input
              required
              type="text"
              className="w-full rounded-xl border-none bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Baby John Doe"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Medical ID</label>
            <input
              required
              type="text"
              className="w-full rounded-xl border-none bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.babyId}
              onChange={(e) => setFormData({ ...formData, babyId: e.target.value })}
              placeholder="e.g. NICU-2026-X"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Birth Date</label>
              <input
                required
                type="date"
                className="w-full rounded-xl border-none bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Birth Time</label>
              <input
                required
                type="time"
                className="w-full rounded-xl border-none bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.birthTime}
                onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">GA Weeks</label>
              <input
                required
                type="number"
                min="20"
                max="45"
                className="w-full rounded-xl border-none bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.gaWeeks}
                onChange={(e) => setFormData({ ...formData, gaWeeks: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">GA Days</label>
              <input
                required
                type="number"
                min="0"
                max="6"
                className="w-full rounded-xl border-none bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.gaDays}
                onChange={(e) => setFormData({ ...formData, gaDays: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Birth Weight (g)</label>
            <input
              required
              type="number"
              className="w-full rounded-xl border-none bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.birthWeight}
              onChange={(e) => setFormData({ ...formData, birthWeight: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Sex</label>
              <select
                className="w-full rounded-xl border-none bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                value={formData.sex}
                onChange={(e) => setFormData({ ...formData, sex: e.target.value as Sex })}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Status</label>
              <select
                className="w-full rounded-xl border-none bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as BabyStatus })}
              >
                <option value="admitted">Admitted</option>
                <option value="discharged">Discharged</option>
                <option value="expired">Expired</option>
                <option value="transferred">Transferred</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl bg-slate-100 py-4 font-bold text-slate-600 transition-colors hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 font-bold text-white transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
          >
            {loading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save size={20} />}
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}
