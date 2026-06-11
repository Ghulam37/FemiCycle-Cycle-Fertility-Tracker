/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, HelpCircle } from 'lucide-react';

export default function MedicalDisclaimer() {
  return (
    <section className="py-12 bg-slate-50 border-t border-slate-200" id="disclaimer">
      <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <ShieldAlert className="h-5 w-5" />
        </div>
        
        <h3 className="font-display font-bold text-slate-800 text-lg">
          Important Scientific & Medical Disclaimer
        </h3>
        
        <div className="text-xs text-slate-500 leading-relaxed space-y-3 max-w-2xl mx-auto text-left py-4 px-6 bg-white rounded-xl border border-slate-200">
          <p>
            <strong>Educational Purposes Only:</strong> The ovulation calculations, pregnancy probability scales, symptom logs, and predictions offered by <em>FemiCycle – Cycle &amp; Fertility Tracker</em> are generated purely based on statistical mathematical averages (such as standard cycles lengths and luteal averages). This information is for general body awareness and educational logs only.
          </p>
          <p>
            <strong>Not Contraception:</strong> This calculator and predictive map must NOT be used as a primary or secondary form of birth control or contraception. Because endocrine cycles can fluctuate due to physical stress, travels, illnesses, hormones, and thyroid changes, your actual fertile window may deviate on any specific month.
          </p>
          <p>
            <strong>Professional Consulting:</strong> Always consult with a qualified, board-certified healthcare professional, OB/GYN, or reproductive endocrinologist for custom diagnostic profiles, fertility treatments, pre-natal vitamins prescriptions, or family planning solutions.
          </p>
        </div>
        
        <p className="text-[11px] text-slate-400">
          Developed in compliance with digital health safety awareness mandates. &copy; 2026 FemiCycle S.A. All Rights Reserved.
        </p>
      </div>
    </section>
  );
}
