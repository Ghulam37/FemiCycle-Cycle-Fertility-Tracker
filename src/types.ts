/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CycleConfig {
  lastPeriodDate: string; // YYYY-MM-DD
  cycleLength: number;    // 21 to 45
  lutealPhase: number;    // 10 to 16
}

export type CyclePhase = 'menstruation' | 'follicular' | 'fertile' | 'ovulation' | 'luteal';

export interface SymptomLog {
  cramping: boolean;
  bloating: boolean;
  tenderBreasts: boolean;
  fatigue: boolean;
  headache: boolean;
  moodSwings: boolean;
  increasedLibido: boolean;
  tempReading: string; // temperature in Fahrenheit or Celsius
  mucusType: 'dry' | 'sticky' | 'creamy' | 'watery' | 'egg-white' | 'none';
}

export interface CycleDayInfo {
  date: Date;
  dateStr: string;
  dayOfCycle: number;
  phase: CyclePhase;
  phaseLabel: string;
  isPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  conceptionChance: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Peak';
  conceptionProb: number; // percentage value e.g. 0 to 33
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular: boolean;
  accentColor: string;
}
