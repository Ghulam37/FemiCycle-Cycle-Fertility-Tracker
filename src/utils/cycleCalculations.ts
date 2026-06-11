/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CycleConfig, CycleDayInfo, CyclePhase } from '../types';

/**
 * Normalizes a date string to midnight local time
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  // Subtract 1 from month to map to JS's 0-indexed months
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Format date nicely
 */
export function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Generates an array of days representing the full cycle
 */
export function generateCycleDays(config: CycleConfig): CycleDayInfo[] {
  const startDate = parseLocalDate(config.lastPeriodDate);
  const cycleLength = config.cycleLength;
  const lutealPhase = config.lutealPhase;

  // Ovulation day number of the cycle (1-indexed)
  // Example: 28 days - 14 luteal = Day 14 ovulation
  const ovulationCycleDay = cycleLength - lutealPhase; 
  
  // Fertile window days (1-indexed)
  // Typically 5 days before ovulation + ovulation day = 6 days total
  const fertileStartDay = Math.max(1, ovulationCycleDay - 5);
  const fertileEndDay = ovulationCycleDay;

  const days: CycleDayInfo[] = [];

  for (let i = 0; i < cycleLength; i++) {
    const currentDate = new Date(startDate.getTime());
    currentDate.setDate(startDate.getDate() + i);

    const dayOfCycle = i + 1;
    let phase: CyclePhase = 'follicular';
    let phaseLabel = 'Follicular Phase';
    let isPeriod = false;
    let isFertile = false;
    let isOvulation = false;
    let conceptionChance: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Peak' = 'Very Low';
    let conceptionProb = 0.05;

    // Period days (assume average 5 days duration of period)
    if (dayOfCycle <= 5) {
      isPeriod = true;
      phase = 'menstruation';
      phaseLabel = 'Menstruation';
    }

    // Ovulation on a specific day
    if (dayOfCycle === ovulationCycleDay) {
      isOvulation = true;
      phase = 'ovulation';
      phaseLabel = 'Ovulation Day';
      conceptionChance = 'Peak';
      conceptionProb = 33;
    } 
    // Fertile window surrounding ovulation
    else if (dayOfCycle >= fertileStartDay && dayOfCycle < ovulationCycleDay) {
      isFertile = true;
      phase = 'fertile';
      phaseLabel = 'Fertile Window';
      
      // Map chance probability leading up to ovulation
      const daysUntilOvulation = ovulationCycleDay - dayOfCycle;
      if (daysUntilOvulation === 1) {
        conceptionChance = 'High';
        conceptionProb = 30;
      } else if (daysUntilOvulation === 2) {
        conceptionChance = 'High';
        conceptionProb = 25;
      } else if (daysUntilOvulation === 3) {
        conceptionChance = 'Medium';
        conceptionProb = 15;
      } else if (daysUntilOvulation === 4) {
        conceptionChance = 'Low';
        conceptionProb = 10;
      } else if (daysUntilOvulation === 5) {
        conceptionChance = 'Low';
        conceptionProb = 5;
      }
    } 
    // Overlapping period check
    else if (dayOfCycle > ovulationCycleDay) {
      phase = 'luteal';
      phaseLabel = 'Luteal Phase';
      
      const daysPostOvulation = dayOfCycle - ovulationCycleDay;
      if (daysPostOvulation === 1) {
        // Egg can survive up to 24 hours, so high/medium chance remains briefly
        conceptionChance = 'Medium';
        conceptionProb = 12;
      } else {
        conceptionChance = 'Very Low';
        conceptionProb = 0.1;
      }
    }

    // If it is menstruation, probability is generally extremely low unless cycle is extremely short
    if (isPeriod && !isFertile && !isOvulation) {
      conceptionChance = 'Very Low';
      conceptionProb = 0.1;
    }

    const dateStr = currentDate.toISOString().split('T')[0];

    days.push({
      date: currentDate,
      dateStr,
      dayOfCycle,
      phase,
      phaseLabel,
      isPeriod,
      isFertile: isFertile || isOvulation, // Ovulation counts as fertile
      isOvulation,
      conceptionChance,
      conceptionProb
    });
  }

  return days;
}

/**
 * Predicts the next 3 cycle start dates
 */
export function predictNextCycles(startDateStr: string, cycleLengthStr: number, count: number = 3): Date[] {
  const dates: Date[] = [];
  const baseDate = parseLocalDate(startDateStr);
  
  for (let i = 1; i <= count; i++) {
    const nextDate = new Date(baseDate.getTime());
    nextDate.setDate(baseDate.getDate() + (cycleLengthStr * i));
    dates.push(nextDate);
  }
  
  return dates;
}
