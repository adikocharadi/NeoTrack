import { differenceInDays, startOfDay } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateDOL(birthDate: Date, targetDate: Date = new Date()): number {
  // DOL 1 is the day of birth
  const startOfBirth = startOfDay(birthDate);
  const startOfTarget = startOfDay(targetDate);
  return differenceInDays(startOfTarget, startOfBirth) + 1;
}

export function calculatePMA(gaWeeks: number, gaDays: number, dol: number) {
  const totalDaysAtBirth = gaWeeks * 7 + gaDays;
  const totalDaysNow = totalDaysAtBirth + (dol - 1);
  return {
    weeks: Math.floor(totalDaysNow / 7),
    days: totalDaysNow % 7
  };
}

export function formatPMA(weeks: number, days: number) {
  return `${weeks}w ${days}d`;
}

export function calculateWeightStats(birthWeight: number, weights: { date: string, weight: number }[]) {
  const sortedWeights = [...weights].sort((a, b) => b.date.localeCompare(a.date));
  
  const todayWeight = sortedWeights[0]?.weight || null;
  const yesterdayWeight = sortedWeights[1]?.weight || null;
  const dayBeforeYesterdayWeight = sortedWeights[2]?.weight || null;

  const gainSinceYesterday = (todayWeight && yesterdayWeight) ? todayWeight - yesterdayWeight : null;
  
  const cumulativeGain = todayWeight ? todayWeight - birthWeight : null;
  const cumulativeGainPercent = todayWeight ? (cumulativeGain! / birthWeight) * 100 : null;

  // 3-day average gain (g/day)
  // If we have today and yesterday, it's 1 interval.
  // If we have today, yesterday, and day-before-yesterday, it's 2 intervals.
  let threeDayAvg = null;
  if (todayWeight && sortedWeights.length >= 2) {
    const oldestInWindow = sortedWeights.slice(0, 4); // Take up to 4 to have 3 intervals if possible
    // Wait, "3-Day Average Weight Gain" usually means (W_today - W_3_days_ago) / 3
    // Or average of daily gains over 3 days.
    // Let's use the delta over the available window up to 3 days.
    const lastN = sortedWeights.slice(0, 4);
    if (lastN.length >= 2) {
      const delta = lastN[0].weight - lastN[lastN.length - 1].weight;
      const days = differenceInDays(new Date(lastN[0].date), new Date(lastN[lastN.length - 1].date));
      threeDayAvg = days > 0 ? delta / days : null;
    }
  }

  return {
    todayWeight,
    yesterdayWeight,
    dayBeforeYesterdayWeight,
    gainSinceYesterday,
    cumulativeGain,
    cumulativeGainPercent,
    threeDayAvg
  };
}
