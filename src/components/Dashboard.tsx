import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Baby } from '../types';
import { Search, Filter, Plus, Baby as BabyIcon, ChevronRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  onSelectBaby: (baby: Baby) => void;
  onAddBaby: () => void;
}

export function Dashboard({ onSelectBaby, onAddBaby }: DashboardProps) {
  const [babies, setBabies] = useState<Baby[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'admitted' | 'all'>('admitted');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = statusFilter === 'admitted' 
      ? query(collection(db, 'babies'), where('status', '==', 'admitted'), orderBy('createdAt', 'desc'))
      : query(collection(db, 'babies'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const babyData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Baby));
      setBabies(babyData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'babies');
    });

    return () => unsubscribe();
  }, [statusFilter]);

  const filteredBabies = babies.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.babyId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or ID..."
            className="w-full rounded-xl border-none bg-white px-10 py-3 text-slate-900 shadow-sm ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('admitted')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === 'admitted' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            Admitted
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading babies...</div>
      ) : filteredBabies.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-300">
            <BabyIcon size={32} />
          </div>
          <p className="text-slate-500">No babies found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredBabies.map((baby) => (
              <motion.button
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={baby.id}
                onClick={() => onSelectBaby(baby)}
                className="flex w-full items-center justify-between rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${
                    baby.sex === 'male' ? 'bg-blue-400' : baby.sex === 'female' ? 'bg-pink-400' : 'bg-slate-400'
                  }`}>
                    <BabyIcon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{baby.name}</h3>
                    <p className="text-sm font-medium text-slate-500">ID: {baby.babyId}</p>
                    <div className="mt-1 flex gap-2">
                       <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                         baby.status === 'admitted' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                       }`}>
                         {baby.status}
                       </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="text-slate-300" size={20} />
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}

      <button
        onClick={onAddBaby}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition-all hover:bg-blue-700 active:scale-90"
      >
        <Plus size={32} />
      </button>
    </div>
  );
}
