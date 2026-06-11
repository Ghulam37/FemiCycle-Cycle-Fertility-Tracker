/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  TrendingUp, 
  Droplets, 
  HelpCircle, 
  Info, 
  BookOpen, 
  CheckCircle 
} from 'lucide-react';

export default function SymptomEducation() {
  const mucusPhases = [
    {
      title: 'Post-Menstruation (Dry)',
      mucus: 'Dry, Sticky, or None',
      fertility: 'Very Low Fertility',
      desc: 'Estrogen is flat. No fluid blocks the cervix to shelter sperm. Survival rate is under 1-2 hours.',
      color: 'bg-slate-100 text-slate-700'
    },
    {
      title: 'Mid-Follicular (Creamy)',
      mucus: 'Creamy, thick, yellow or white',
      fertility: 'Transitional Fertility',
      desc: 'Estrogen begins climbing. Fluid feels like hand lotion. This can keep sperm viable for about 24-48 hours.',
      color: 'bg-amber-50 text-amber-700'
    },
    {
      title: 'Approaching Ovulation (Watery)',
      mucus: 'Watery, wet, slippery fluid',
      fertility: 'High Fertility',
      desc: 'High estrogen thins the fluid, allowing sperm to migrate easily. Highly conductive to fertilization.',
      color: 'bg-teal-brand-50 text-teal-brand-700'
    },
    {
      title: 'Peak Ovulation (Egg White)',
      mucus: 'Clear, stretchy, raw egg-white raw fluid (EWCM)',
      fertility: 'Peak Fertility Window',
      desc: 'The gold standard of fertility. Can stretch 2–4 inches. Nourishes and assists sperm to live for up to 5 days.',
      color: 'bg-emerald-100 text-teal-brand-900 font-semibold'
    }
  ];

  return (
    <section className="py-20 bg-white" id="education">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wider text-teal-brand-700 uppercase bg-teal-brand-50 rounded-full">
            <BookOpen className="h-3.5 w-3.5" /> Clinical Hormone Guide
          </span>
          <h2 className="mt-3 text-3xl font-display font-bold text-slate-800 sm:text-4xl tracking-tight">
            Understanding Cervical Mucus & Basal Temp (BBT)
          </h2>
          <p className="mt-3 text-md text-slate-600">
            Hormonal fluctuations affect visible secondary sex symptoms. Learn to recognize these parameters alongside our math calculations to read your cycle like a book.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Block: BBT Guide */}
          <div className="lg:col-span-12 xl:col-span-5 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border border-indigo-100 p-8 rounded-2xl space-y-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-sm">
              <TrendingUp className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-semibold text-slate-800 text-xl">
                Basal Body Temperature Patterns
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Your Basal Body Temperature is your body temperature at rest, measured with a high-accuracy double-decimal thermometer immediately upon waking.
              </p>
            </div>

            <div className="space-y-4 text-sm text-slate-700 font-sans">
              <div className="flex items-start gap-3">
                <span className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                <div>
                  <p className="font-semibold text-slate-800">Follicular Cool Phase</p>
                  <p className="text-xs text-slate-600">Average temperature is typically lower, between 97.0°F (36.1°C) and 97.7°F (36.5°C).</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="h-5 w-5 rounded-full bg-pink-100 text-pink-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                <div>
                  <p className="font-semibold text-slate-800">The Ovulation Dip</p>
                  <p className="text-xs text-slate-600">Just before ovulation, many users experience a subtle dip as estrogen peaks and luteinizing hormone triggers ovulation.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="h-5 w-5 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
                <div>
                  <p className="font-semibold text-teal-brand-700 flex items-center gap-1">Progesterone Thermal Spike</p>
                  <p className="text-xs text-slate-600">Immediately following ovulation, progesterone surges. Your baseline temperature jumps by 0.5°F (0.3°C) and remains high until your next period.</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/70 border border-slate-200 rounded-xl flex gap-3 items-center">
              <Info className="h-5 w-5 text-indigo-500 shrink-0" />
              <p className="text-[11px] text-slate-500 leading-snug">
                <strong>BBT Tip:</strong> Keep your digital thermometer directly on your bedside table. Measure before sitting up, drinking water, or speaking to get clean readings.
              </p>
            </div>
          </div>

          {/* Right Block: Cervical Mucus Table */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-6">
            <h3 className="font-display font-semibold text-slate-800 text-xl flex items-center gap-2">
              <Droplets className="h-5 w-5 text-teal-brand-500" />
              The Cervical Mucus Classification Index
            </h3>
            <p className="text-sm text-slate-650 leading-relaxed max-w-2xl">
              Cervical fluid acts as a selective filter. Tracking fluid consistency provides real-time hormone readings that corroborate cycle calculators.
            </p>

            <div className="space-y-4">
              {mucusPhases.map((phase, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row p-4 border border-slate-100 rounded-xl bg-slate-50 hover:bg-slate-100/50 transition gap-4 items-start">
                  <div className="sm:w-1/3 space-y-1 shrink-0">
                    <span className="text-xs font-bold text-slate-800 block">{phase.title}</span>
                    <span className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${phase.color}`}>
                      {phase.fertility}
                    </span>
                  </div>
                  <div className="sm:w-2/3 space-y-1">
                    <p className="text-xs font-semibold text-slate-700">Type: {phase.mucus}</p>
                    <p className="text-xs text-slate-500 leading-relaxed font-sans">{phase.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
