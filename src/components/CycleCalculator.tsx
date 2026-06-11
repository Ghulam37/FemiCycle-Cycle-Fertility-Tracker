/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Baby, 
  Activity, 
  Sparkles, 
  Heart, 
  FileText, 
  Thermometer, 
  Droplets,
  HelpCircle,
  TrendingUp,
  Smile,
  Info,
  ChevronDown,
  Printer,
  Settings2
} from 'lucide-react';
import { CycleConfig, CycleDayInfo, SymptomLog } from '../types';
import { generateCycleDays, predictNextCycles, formatDateLabel, parseLocalDate } from '../utils/cycleCalculations';
import { useAuth } from '../context/AuthContext';

export default function CycleCalculator() {
  const { user, userProfile, symptomLogs: cloudSymptomLogs, loginWithGoogle, updateProfile, saveSymptomLog } = useAuth();

  // Setup standard default dates relative to current simulation time (2026-06-10)
  // Let's set last period to exactly 9 days ago, so "Today" is Day 10 (early fertile window)!
  const defaultLastPeriod = '2026-06-01'; 
  
  const [localConfig, setLocalConfig] = useState<CycleConfig>({
    lastPeriodDate: defaultLastPeriod,
    cycleLength: 28,
    lutealPhase: 14
  });

  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(10); // Day 10 selected by default
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [localMeasurementUnit, setLocalMeasurementUnit] = useState<'F' | 'C'>('F');

  // Load symtoms for the selected day of cycle
  const [localSymptomLogs, setLocalSymptomLogs] = useState<Record<number, SymptomLog>>({
    1: { cramping: true, bloating: true, tenderBreasts: false, fatigue: true, headache: true, moodSwings: true, increasedLibido: false, tempReading: '98.1', mucusType: 'none' },
    10: { cramping: false, bloating: false, tenderBreasts: true, fatigue: false, headache: false, moodSwings: false, increasedLibido: true, tempReading: '97.4', mucusType: 'watery' },
    14: { cramping: true, bloating: false, tenderBreasts: true, fatigue: false, headache: false, moodSwings: false, increasedLibido: true, tempReading: '97.2', mucusType: 'egg-white' }
  });

  // Derived state depending on authentication
  const config = useMemo(() => {
    if (userProfile) {
      return {
        lastPeriodDate: userProfile.lastPeriodDate,
        cycleLength: userProfile.cycleLength,
        lutealPhase: userProfile.lutealPhase
      };
    }
    return localConfig;
  }, [userProfile, localConfig]);

  const measurementUnit = useMemo(() => {
    if (userProfile) {
      return userProfile.measurementUnit;
    }
    return localMeasurementUnit;
  }, [userProfile, localMeasurementUnit]);

  // Handle configuration changes securely
  const updateConfig = (updates: Partial<CycleConfig>) => {
    if (userProfile) {
      updateProfile(updates);
    } else {
      setLocalConfig(prev => ({ ...prev, ...updates }));
    }
  };

  const updateMeasurementUnit = (unit: 'F' | 'C') => {
    if (userProfile) {
      updateProfile({ measurementUnit: unit });
    } else {
      setLocalMeasurementUnit(unit);
    }
  };

  // Calculate standard cycle days
  const cycleDays = useMemo(() => {
    return generateCycleDays(config);
  }, [config]);

  // Handle selected day state cleanly
  const currentSelectedDayInfo = useMemo(() => {
    const day = cycleDays.find(d => d.dayOfCycle === selectedDayNumber);
    return day || cycleDays[0];
  }, [cycleDays, selectedDayNumber]);

  // Symptom logging functions linked to the selected day
  const currentSymptomState = useMemo((): SymptomLog => {
    if (user) {
      const dateKey = currentSelectedDayInfo.dateStr;
      return cloudSymptomLogs[dateKey] || {
        cramping: false,
        bloating: false,
        tenderBreasts: false,
        fatigue: false,
        headache: false,
        moodSwings: false,
        increasedLibido: false,
        tempReading: '',
        mucusType: 'none'
      };
    } else {
      return localSymptomLogs[selectedDayNumber] || {
        cramping: false,
        bloating: false,
        tenderBreasts: false,
        fatigue: false,
        headache: false,
        moodSwings: false,
        increasedLibido: false,
        tempReading: '',
        mucusType: 'none'
      };
    }
  }, [user, cloudSymptomLogs, localSymptomLogs, selectedDayNumber, currentSelectedDayInfo.dateStr]);

  const updateSymptom = (field: keyof SymptomLog, value: any) => {
    const currentLog = currentSymptomState;
    const updatedLog: SymptomLog = {
      ...currentLog,
      [field]: value
    };

    if (user) {
      saveSymptomLog(currentSelectedDayInfo.dateStr, updatedLog);
    } else {
      setLocalSymptomLogs(prev => ({
        ...prev,
        [selectedDayNumber]: updatedLog
      }));
    }
  };

  // Predict future period dates
  const futureCycles = useMemo(() => {
    return predictNextCycles(config.lastPeriodDate, config.cycleLength, 3);
  }, [config.lastPeriodDate, config.cycleLength]);

  // Determine current simulated day status (simulated today is June 10, 2026)
  const todayDateStr = '2026-06-10';
  const simulatedTodayIndex = useMemo(() => {
    return cycleDays.findIndex(d => d.dateStr === todayDateStr);
  }, [cycleDays]);

  // If today is in the cycle, get info, else standard index 0
  const todayInfo = useMemo(() => {
    if (simulatedTodayIndex !== -1) {
      return cycleDays[simulatedTodayIndex];
    }
    return null;
  }, [cycleDays, simulatedTodayIndex]);

  // Synchronize dynamic calendar load to current selected day if cycle length config changes
  useEffect(() => {
    if (selectedDayNumber > config.cycleLength) {
      setSelectedDayNumber(1);
    }
  }, [config.cycleLength]);

  // Quick preset dates for tester convenience
  const setQuickDate = (daysAgo: number) => {
    const d = new Date(2026, 5, 10); // June 10, 2026
    d.setDate(d.getDate() - daysAgo);
    
    // Format to YYYY-MM-DD
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    
    updateConfig({ lastPeriodDate: `${yyyy}-${mm}-${dd}` });
  };

  // Printing Summary Report PDF flow simulator
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8" id="calculator-section">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wider text-teal-brand-700 uppercase bg-teal-brand-50 rounded-full">
          🌸 Interactive Cycle Center
        </span>
        <h2 className="mt-2 text-3xl font-display font-bold text-slate-800 sm:text-4xl">
          Symptom-Aware Pregnancy & Ovulation Estimator
        </h2>
        <p className="mt-2 text-md text-slate-600 max-w-2xl mx-auto">
          Adjust your biological coefficients below. Select any day on your interactive cycle map to see pregnancy coefficients, log symptoms, or generate summaries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Parameters Slider & Advanced Config */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-display font-semibold text-slate-800 text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-teal-brand-500" />
              Cycle Settings
            </h3>
            <span className="text-xs text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md font-mono">
              Live updates
            </span>
          </div>

          {/* Cloud Saving status banner */}
          {user ? (
            <div className="p-3.5 bg-emerald-50 border border-emerald-100/60 rounded-xl flex items-center gap-2 text-[11px] text-emerald-800 font-sans leading-normal">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>
                <strong>Cloud Saving Active</strong>: Your tracking profile and logs are synchronized with your Google Account.
              </span>
            </div>
          ) : (
            <div className="p-3.5 bg-amber-50/50 border border-amber-200/40 rounded-xl flex items-start gap-2 text-[11px] text-amber-900 leading-normal">
              <HelpCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong>Local Storage Only</strong>: Your symptoms and configurations are cached in your browser. <button onClick={loginWithGoogle} className="underline font-bold text-amber-950 cursor-pointer bg-transparent border-0 py-0 px-0">Sign Up / Sign In</button> to backup.
              </div>
            </div>
          )}

          {/* Period start date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 flex justify-between">
              <span>Last Period Start Date</span>
            </label>
            <div className="relative">
              <input 
                type="date"
                value={config.lastPeriodDate}
                onChange={(e) => updateConfig({ lastPeriodDate: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-teal-brand-500 focus:bg-white text-slate-700 transition"
              />
            </div>
            
            {/* Quick offset buttons */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button 
                type="button" 
                onClick={() => setQuickDate(4)}
                className="text-[11px] text-center py-1 rounded bg-teal-brand-50 hover:bg-teal-brand-100 text-teal-brand-700 font-medium transition cursor-pointer"
              >
                4 days ago (June 6)
              </button>
              <button 
                type="button" 
                onClick={() => setQuickDate(9)}
                className="text-[11px] text-center py-1 rounded bg-teal-brand-50 hover:bg-teal-brand-100 text-teal-brand-700 font-medium transition cursor-pointer"
              >
                9 days ago (June 1)
              </button>
              <button 
                type="button" 
                onClick={() => setQuickDate(14)}
                className="text-[11px] text-center py-1 rounded bg-teal-brand-50 hover:bg-teal-brand-100 text-teal-brand-700 font-medium transition cursor-pointer"
              >
                14 days ago (May 27)
              </button>
            </div>
          </div>

          {/* Cycle Length Range Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-medium text-slate-700">
              <span>Cycle Duration</span>
              <span className="text-teal-brand-600 bg-teal-brand-50 px-2 py-0.5 rounded-full text-xs font-semibold font-mono">
                {config.cycleLength} Days
              </span>
            </div>
            <input 
              type="range" 
              min="21" 
              max="45"
              value={config.cycleLength}
              onChange={(e) => updateConfig({ cycleLength: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-brand-500"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-400 px-1">
              <span>Short (21d)</span>
              <span>Average (28d)</span>
              <span>Long (45d)</span>
            </div>
          </div>

          {/* Toggle Advanced Luteal phase settings */}
          <div className="border-t border-slate-100 pt-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-slate-600 hover:text-slate-800 text-sm font-medium transition cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Settings2 className="h-4 w-4 text-slate-400" />
                Advanced Biological Controls
              </span>
              <ChevronDown className={`h-4 w-4 transform transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-100 animate-fadeIn">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1">
                      Luteal Phase Duration
                      <span className="group relative cursor-pointer text-slate-400">
                        <Info className="h-3 w-3 inline" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-48 hidden group-hover:block bg-slate-800 text-white text-[10px] p-2 rounded shadow-md z-40 font-normal leading-normal">
                          The phase from ovulation to your next period. Typically 14 days.
                        </span>
                      </span>
                    </span>
                    <span className="text-slate-600 font-mono text-xs">{config.lutealPhase} Days</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="16"
                    value={config.lutealPhase}
                    onChange={(e) => updateConfig({ lutealPhase: parseInt(e.target.value) })}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-500"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-slate-400">
                    <span>Short (10d)</span>
                    <span>Standard (14d)</span>
                    <span>Long (16d)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-xs font-semibold text-slate-700">Temperature Log Units</span>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => updateMeasurementUnit('F')}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition cursor-pointer ${
                        measurementUnit === 'F' 
                          ? 'bg-white border-teal-brand-500 text-teal-brand-700 shadow-xs' 
                          : 'border-slate-200 bg-transparent text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      Fahrenheit (°F)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => updateMeasurementUnit('C')}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition cursor-pointer ${
                        measurementUnit === 'C' 
                          ? 'bg-white border-teal-brand-500 text-teal-brand-700 shadow-xs' 
                          : 'border-slate-200 bg-transparent text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      Celsius (°C)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick status report */}
          {todayInfo && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-teal-brand-50 to-emerald-50 border border-teal-brand-100 space-y-2.5">
              <div className="flex items-center gap-2 text-teal-brand-800">
                <Sparkles className="h-4 w-4 animate-pulse text-teal-brand-500" />
                <span className="text-xs font-semibold tracking-wider uppercase">Biological Status (Today)</span>
              </div>
              <p className="text-xs text-slate-600">
                Based on <span className="font-semibold text-slate-700">June 10, 2026</span>, you are currently in your <span className="font-semibold text-teal-brand-700">{todayInfo.phaseLabel}</span>, Day <span className="font-semibold text-slate-800">{todayInfo.dayOfCycle}</span> of your cycle.
              </p>
              <div className="flex items-center justify-between text-xs bg-white/60 p-2 rounded-lg border border-teal-brand-100/40">
                <span className="text-slate-500 font-medium">Pregnancy potential:</span>
                <span className={`font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full ${
                  todayInfo.conceptionChance === 'Peak' || todayInfo.conceptionChance === 'High'
                    ? 'bg-rose-100 text-rose-700 animate-pulse'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {todayInfo.conceptionChance} ({todayInfo.conceptionProb}%)
                </span>
              </div>
            </div>
          )}

          {/* Forecasted periods */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
              Predicted Next Cycles
            </h4>
            <div className="space-y-2 text-xs">
              {futureCycles.map((dateObj, idx) => (
                <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl border border-dotted border-slate-200 hover:bg-slate-50">
                  <span className="text-slate-600 font-medium">Cycle #{idx + 2} Period Start</span>
                  <span className="font-mono text-slate-800 font-semibold bg-white px-2 py-1 rounded shadow-xs border border-slate-100">
                    {formatDateLabel(dateObj)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Interactive Cycle Map and Calendar Layout */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Visual Cycle Progression Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-5 mb-6">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">Interactive Visual Map</span>
                <h3 className="font-display font-semibold text-slate-800 text-lg flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-indigo-500" />
                  Your {config.cycleLength}-Day Cycle Timeline
                </h3>
              </div>
              
              {/* Legend Indicator Pills */}
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-150">
                  <span className="h-2 w-2 rounded-full bg-rose-500"></span> Period
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-150">
                  <span className="h-2 w-2 rounded-full bg-amber-400"></span> Follicular
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-brand-50 text-teal-brand-800 border border-teal-brand-150 animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-teal-brand-500"></span> Fertile Window
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                  <span className="h-2 w-2 rounded-full bg-amber-600"></span> Luteal
                </span>
              </div>
            </div>

            {/* Clickable Cycle Bubble Track */}
            <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-8 lg:grid-cols-10 gap-2.5 mb-8">
              {cycleDays.map((day) => {
                const isSelected = day.dayOfCycle === selectedDayNumber;
                const isTodayStr = day.dateStr === todayDateStr;
                
                // Set color theme depending on phase
                let bubbleClass = "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200";
                
                if (day.isPeriod) {
                  bubbleClass = "bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200";
                } else if (day.isOvulation) {
                  // Special Ovulation highlight
                  bubbleClass = "bg-teal-brand-100 hover:bg-teal-brand-200 text-teal-brand-900 border-teal-brand-300 shadow-xs ring-2 ring-teal-brand-300 ring-offset-1";
                } else if (day.isFertile) {
                  bubbleClass = "bg-teal-brand-50 hover:bg-teal-brand-100 text-teal-brand-800 border-teal-brand-200";
                } else if (day.phase === 'luteal') {
                  bubbleClass = "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200";
                }

                return (
                  <button
                    key={day.dayOfCycle}
                    type="button"
                    onClick={() => setSelectedDayNumber(day.dayOfCycle)}
                    className={`relative p-2 rounded-xl text-center border cursor-pointer select-none transition-all flex flex-col justify-between items-center h-16 ${bubbleClass} ${
                      isSelected ? 'ring-2 ring-slate-800 border-transparent scale-105 shadow-md z-10' : ''
                    }`}
                  >
                    {/* Tiny Indicator representing "Today" in real life */}
                    {isTodayStr && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600" title="Today"></span>
                      </span>
                    )}

                    <span className="text-[10px] uppercase tracking-wider block font-mono font-bold opacity-60">
                      D{day.dayOfCycle}
                    </span>
                    
                    <span className="font-display font-bold text-sm">
                      {day.date.getDate()}
                    </span>

                    <span className="text-[9px] block leading-none font-mono font-semibold">
                      {day.date.toLocaleDateString('en-US', { weekday: 'narrow' })}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Split layout: Selected Day Details and Symptom Quick Logger */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              {/* Day details and Probability coefficients */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 font-sans space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">Selected Cycle Day</span>
                      <h4 className="font-display font-semibold text-slate-800">
                        {formatDateLabel(currentSelectedDayInfo.date)} (Cycle Day {currentSelectedDayInfo.dayOfCycle})
                      </h4>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                      Day {currentSelectedDayInfo.dayOfCycle}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-lg border border-slate-100">
                      <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase">Phase</span>
                      <span className={`text-sm font-bold flex items-center gap-1 ${
                        currentSelectedDayInfo.isPeriod ? 'text-rose-600' :
                        currentSelectedDayInfo.isOvulation ? 'text-teal-brand-700 font-extrabold' :
                        currentSelectedDayInfo.isFertile ? 'text-teal-brand-600' : 'text-slate-700'
                      }`}>
                        {currentSelectedDayInfo.isOvulation && <Sparkles className="h-3 w-3 inline text-teal-brand-500 animate-spin" />}
                        {currentSelectedDayInfo.phaseLabel}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-100">
                      <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase">Pregnancy Odds</span>
                      <span className={`text-sm font-bold block ${
                        currentSelectedDayInfo.conceptionChance === 'Peak' || currentSelectedDayInfo.conceptionChance === 'High' ? 'text-rose-600' : 'text-slate-500'
                      }`}>
                        {currentSelectedDayInfo.conceptionChance} ({currentSelectedDayInfo.conceptionProb}%)
                      </span>
                    </div>
                  </div>

                  {/* Medical / Statistical advice for this day */}
                  <div className="p-3 bg-white/60 rounded-lg border border-slate-100 text-xs text-slate-600 leading-relaxed">
                    {currentSelectedDayInfo.isPeriod && "During your period, estrogen and progesterone are low. Estrogen begins tracking upwards post-period to prepare for the follicular stage."}
                    {currentSelectedDayInfo.isOvulation && "🌟 Peak Fertility! An egg is fully released from the ovary and survives up to 24 hours. Intercourse within the past 4 days or today yields peak probability."}
                    {!currentSelectedDayInfo.isPeriod && currentSelectedDayInfo.isFertile && !currentSelectedDayInfo.isOvulation && "📈 High Fertility. Estrogen surge has triggers fertile, nourishing cervical mucus (creamy, watery, or raw egg white) helping sperm survive for up to 5 days."}
                    {!currentSelectedDayInfo.isPeriod && !currentSelectedDayInfo.isFertile && currentSelectedDayInfo.phase === 'follicular' && "This is a quiet phase. Energy levels begin climbing. Conception is mathematically low but educationally possible."}
                    {currentSelectedDayInfo.phase === 'luteal' && "Progesterone surge supports uterine lining. Pregnancy chance is low. PMS symptoms (bloating, breast tenderness, mild cramping) can occur during the luteal phase."}
                  </div>
                </div>

                {/* Simulated Data Export Widget */}
                <div className="flex gap-2">
                  <button 
                    onClick={handlePrint}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                  >
                    <Printer className="h-4 w-4" />
                    Print Summary Report
                  </button>
                </div>
              </div>

              {/* Dynamic Symptom Logging Area */}
              <div className="bg-slate-50/60 border border-slate-200/50 p-4 rounded-xl space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">Dynamic Wellness Log</span>
                  <h4 className="font-display font-bold text-slate-800 text-sm">
                    Symtom Logger — Day {currentSelectedDayInfo.dayOfCycle}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Check symptoms you experience today to save or compile. Logs will affect personalized fertility advice.
                  </p>
                </div>

                {/* Pain and Cycle Symptoms toggle buttons */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateSymptom('cramping', !currentSymptomState.cramping)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium cursor-pointer transition select-none ${
                        currentSymptomState.cramping 
                          ? 'border-brand-500 bg-brand-50 text-indigo-900 shadow-3xs' 
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Droplets className="h-4 w-4 text-rose-400" />
                      Cramps / Cramping
                    </button>

                    <button
                      type="button"
                      onClick={() => updateSymptom('bloating', !currentSymptomState.bloating)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium cursor-pointer transition select-none ${
                        currentSymptomState.bloating 
                          ? 'border-brand-500 bg-brand-50 text-indigo-900 shadow-3xs' 
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Activity className="h-4 w-4 text-amber-500" />
                      Mild Bloating
                    </button>

                    <button
                      type="button"
                      onClick={() => updateSymptom('tenderBreasts', !currentSymptomState.tenderBreasts)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium cursor-pointer transition select-none ${
                        currentSymptomState.tenderBreasts 
                          ? 'border-brand-500 bg-brand-50 text-indigo-900 shadow-3xs' 
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Heart className="h-4 w-4 text-pink-400" />
                      Tender Breasts
                    </button>

                    <button
                      type="button"
                      onClick={() => updateSymptom('headache', !currentSymptomState.headache)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium cursor-pointer transition select-none ${
                        currentSymptomState.headache 
                          ? 'border-brand-500 bg-brand-50 text-indigo-900 shadow-3xs' 
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Smile className="h-4 w-4 text-purple-400" />
                      Headaches
                    </button>

                    <button
                      type="button"
                      onClick={() => updateSymptom('increasedLibido', !currentSymptomState.increasedLibido)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium cursor-pointer transition select-none ${
                        currentSymptomState.increasedLibido 
                          ? 'border-brand-500 bg-brand-50 text-indigo-900 shadow-3xs' 
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      High Libido
                    </button>

                    <button
                      type="button"
                      onClick={() => updateSymptom('moodSwings', !currentSymptomState.moodSwings)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium cursor-pointer transition select-none ${
                        currentSymptomState.moodSwings 
                          ? 'border-brand-500 bg-brand-50 text-indigo-900 shadow-3xs' 
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Smile className="h-4 w-4 text-blue-400" />
                      Mood Swings
                    </button>
                  </div>

                  {/* Temperature slider input */}
                  <div className="space-y-1.5 p-2 bg-white rounded-lg border border-slate-200">
                    <label className="text-[10px] font-bold text-slate-500 uppercase flex justify-between items-center">
                      <span className="flex items-center gap-1">
                        <Thermometer className="h-3 w-3 text-red-400" />
                        Basal Body Temperature (BBT)
                      </span>
                      <span>{currentSymptomState.tempReading ? `${currentSymptomState.tempReading}°${measurementUnit}` : 'Not logged'}</span>
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="number"
                        step="0.1"
                        placeholder={measurementUnit === 'F' ? "98.2" : "36.8"}
                        value={currentSymptomState.tempReading}
                        onChange={(e) => updateSymptom('tempReading', e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded outline-none focus:border-indigo-400"
                      />
                    </div>
                  </div>

                  {/* Cervical Mucus selection */}
                  <div className="space-y-1 p-2 bg-white rounded-lg border border-slate-200">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">
                      Cervical Fluid Type
                    </label>
                    <select
                      value={currentSymptomState.mucusType}
                      onChange={(e) => updateSymptom('mucusType', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-1 text-xs outline-none"
                    >
                      <option value="none">Choose Type...</option>
                      <option value="dry">Dry / Dry feeling (Low Fertility)</option>
                      <option value="sticky">Sticky / Sticky fluid (Low Fertility)</option>
                      <option value="creamy">Creamy (Transitional Fertility)</option>
                      <option value="watery">Watery / Slippery (High Fertility)</option>
                      <option value="egg-white">Raw Egg White (Peak Fertile Window)</option>
                    </select>
                  </div>
                </div>

                {/* Symptom dynamic diagnosis notice */}
                {currentSymptomState.mucusType === 'egg-white' && (
                  <div className="p-2.5 bg-teal-brand-50 border border-teal-brand-200 rounded-lg text-[10px] text-teal-brand-800 leading-normal font-medium">
                    🔍 egg-white cervical fluid is highly alkaline and nourishing to sperm, typical directly before ovulation. Intercourse today maximizes probability of pregnancy.
                  </div>
                )}
                {currentSymptomState.cramping && currentSelectedDayInfo.phase === 'luteal' && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-800 leading-normal font-medium">
                    🍂 Cramping in the luteal stage is common as progesterone levels fluctuate. High hydration, warm pressure, and gentle stretching may relieve PMS cramps.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
