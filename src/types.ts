export type BabyStatus = 'admitted' | 'discharged' | 'expired' | 'transferred';
export type Sex = 'male' | 'female' | 'other';

export interface Baby {
  id: string;
  name: string;
  babyId: string; // Medical ID
  birthDateTime: any; // Firestore Timestamp
  gaWeeks: number;
  gaDays: number;
  birthWeight: number; // grams
  sex: Sex;
  status: BabyStatus;
  createdBy: string;
  createdAt: any;
  updatedAt: any;
}

export interface WeightEntry {
  id: string;
  babyId: string;
  date: string; // YYYY-MM-DD
  weight: number; // grams
  notes: string;
  recordedBy: string;
  createdAt: any;
}
