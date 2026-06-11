/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Calendar, 
  Sparkles, 
  Baby, 
  Sliders, 
  Activity, 
  FileDown, 
  CheckCircle2 
} from 'lucide-react';

interface FeatureCardProps {
  key?: React.Key;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}

function FeatureCard({ icon, title, description, badge }: FeatureCardProps) {
  return (
    <div className="group bg-white rounded-2xl border border-slate-100 p-6 transition-all duration-300 hover:shadow-lg hover:border-teal-brand-250 hover:-translate-y-1">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-brand-50 text-teal-brand-600 transition group-hover:bg-teal-brand-500 group-hover:text-white mb-5">
        {icon}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <h4 className="font-display font-semibold text-slate-800 text-lg group-hover:text-teal-brand-700 transition">
          {title}
        </h4>
        {badge && (
          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded-full uppercase">
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm text-slate-500 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export default function Features() {
  const currentFeatures: FeatureCardProps[] = [
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Cycle Tracking",
      description: "Logs period start date, length deviations, and symptom occurrences to map historical patterns and irregular variances of cycles.",
      badge: "Core"
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Ovulation Prediction",
      description: "Uses a sophisticated standard clinical algorithm checking luteal length variables to accurately forecast true ovulation release days.",
      badge: "Smart"
    },
    {
      icon: <Sliders className="h-6 w-6" />,
      title: "Fertility Window Calculator",
      description: "Finds the peak 6 days where sperm survival rates overlap with egg release times, maximizing biological opportunities.",
    },
    {
      icon: <Baby className="h-6 w-6" />,
      title: "Pregnancy Probability",
      description: "Calculates day-by-day conception probability on a scale from extremely safe down to high-percentage peak ovulation hours.",
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Symptom Tracking",
      description: "Log spotting, cervical fluid quality, basal temperatures, cramps, headaches, and libido spikes to tailor calculation insight rules.",
    },
    {
      icon: <FileDown className="h-6 w-6" />,
      title: "PDF Reports & Exports",
      description: "Generate clean printable, shareable exports summarizing cycle dynamics and logged symptoms, ready for physical medical consultations.",
      badge: "Pro"
    }
  ];

  return (
    <section className="py-20 bg-slate-50/70 border-b border-t border-slate-100" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Intro */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wider text-teal-brand-700 uppercase bg-teal-brand-50 rounded-full">
            🧠 Precision Algorithm
          </span>
          <h2 className="mt-3 text-3xl font-display font-medium text-slate-800 sm:text-4xl tracking-tight">
            Comprehensive Cycle Metrics
          </h2>
          <p className="mt-3 text-md text-slate-600">
            A trusted digital companion that demystifies gynecological science. Analyze your cycle data using clear math guidelines to understand changes, hormones, and fertility timelines.
          </p>
        </div>

        {/* Features Bento / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentFeatures.map((f, idx) => (
            <FeatureCard 
              key={idx}
              icon={f.icon}
              title={f.title}
              description={f.description}
              badge={f.badge}
            />
          ))}
        </div>

        {/* Bottom Banner Info */}
        <div className="mt-12 p-6 bg-white rounded-2xl border border-slate-150 flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-brand-50 text-teal-brand-600">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Offline First & Complete Data Privacy</p>
              <p className="text-xs text-slate-500">Your intimate biological records remain entirely localized on your secure preview sandbox storage.</p>
            </div>
          </div>
          <a
            href="#calculator-section" 
            className="text-xs font-semibold text-teal-brand-700 bg-teal-brand-50 hover:bg-teal-brand-100 px-4 py-2 rounded-xl transition cursor-pointer"
          >
            Launch Interactive Tool &rarr;
          </a>
        </div>

      </div>
    </section>
  );
}
