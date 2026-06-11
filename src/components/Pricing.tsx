import React, { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { PricingPlan } from '../types';
import CheckoutModal from './CheckoutModal';

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string } | null>(null);

  const plans: PricingPlan[] = [
    {
      id: 'trial',
      name: 'Free Trial',
      price: '0',
      period: '15 Days',
      description: 'Test the base algorithm and inputs safely before commitment.',
      features: [
        'Interactive 28-day cycle map',
        'Basic Ovulation estimations',
        'Cervical fluid logs',
        'Offline client-only state storage',
        'General health guides & warnings'
      ],
      isPopular: false,
      accentColor: 'border-slate-200'
    },
    {
      id: 'pro',
      name: 'Pro Member',
      price: billingPeriod === 'monthly' ? '15' : '12',
      period: 'month',
      description: 'Our most sought-after plan for couples predicting fertile times.',
      features: [
        'Unlimited Historical Cycles logger',
        'Symptom-Weighted algorithm calculations',
        'Full PDF cycle reports ready for doctors',
        'Advanced Basal body temperature charts',
        'Cervical fluid alkaline stage tracker',
        'Automatic cloud synchronization backup'
      ],
      isPopular: true,
      accentColor: 'border-teal-brand-500 ring-2 ring-teal-brand-100'
    },
    {
      id: 'premium',
      name: 'Premium Fertility Suite',
      price: billingPeriod === 'monthly' ? '39' : '31',
      period: 'month',
      description: 'Full-spectrum clinical reports and hormonal parameters logging.',
      features: [
        'Everything in Pro Membership',
        'Luteal Phase hormonal coefficient fine-tuning',
        'Irregular cycles mathematical adjustments',
        'Priority support chat',
        'Integrative nutrition & biological advice'
      ],
      isPopular: false,
      accentColor: 'border-slate-200'
    }
  ];


  return (
    <section className="py-20 bg-slate-900 text-white" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wider text-teal-brand-400 uppercase bg-teal-brand-500/10 rounded-full">
            💎 Plans & Memberships
          </span>
          <h2 className="mt-3 text-3xl font-display font-bold sm:text-4xl tracking-tight text-white">
            Transparent, Honest Pricing
          </h2>
          <p className="mt-3 text-md text-slate-300">
            No hidden clauses or targeted advertisement. Select the tier that matches your family planning and body awareness targets.
          </p>

          {/* Toggle Button */}
          <div className="mt-8 inline-flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                billingPeriod === 'monthly'
                  ? 'bg-teal-brand-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
                billingPeriod === 'yearly'
                  ? 'bg-teal-brand-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Annual Billing
              <span className="text-[10px] bg-slate-950 text-teal-brand-400 font-bold px-1.5 py-0.5 rounded">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
          {plans.map((p) => (
            <div 
              key={p.id}
              className={`relative bg-slate-800 border rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 ${
                p.isPopular ? 'scale-105 z-10 shadow-xl' : 'opacity-95 hover:opacity-100'
              } ${p.accentColor}`}
            >
              {p.isPopular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3.5 py-1 text-[10px] font-bold tracking-widest uppercase bg-gradient-to-r from-teal-brand-500 to-emerald-400 text-slate-950 rounded-full shadow-md">
                  <Sparkles className="h-3 w-3" /> Most Recommended
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h4 className="font-display font-semibold text-slate-400 uppercase text-xs tracking-wider">
                    {p.name}
                  </h4>
                  <div className="mt-2 flex items-baseline">
                    <span className="text-4xl font-extrabold tracking-tight text-white">${p.price}</span>
                    <span className="ml-1 text-sm text-slate-400">/{p.period}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed font-sans min-h-[40px]">
                    {p.description}
                  </p>
                </div>

                <ul className="space-y-3.5 border-t border-slate-700/60 pt-5 text-sm">
                  {p.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className="h-4.5 w-4.5 text-teal-brand-400 shrink-0 mt-0.5" />
                      <span className="text-slate-200 text-xs text-left leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-700/30">
                {p.id === 'trial' ? (
                  <a
                    href="#calculator-section"
                    className="block text-center py-3 px-4 rounded-xl text-xs font-bold transition cursor-pointer bg-slate-700 text-white hover:bg-slate-600"
                  >
                    Access Free Tools
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectedPlan({ name: p.name, price: p.price })}
                    className={`w-full block text-center py-3 px-4 rounded-xl text-xs font-bold transition cursor-pointer ${
                      p.isPopular
                        ? 'bg-teal-brand-500 text-slate-950 hover:bg-teal-brand-600'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                  >
                    {p.id === 'pro' ? 'Unlock Pro Membership' : 'Subscribe Premium Suite'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Note of confidence */}
        <p className="text-center text-xs text-slate-400 mt-12 max-w-xl mx-auto leading-relaxed">
          🔒 <strong>Risk-Free Trial:</strong> You are not locked to agreements. Upgrade or downgrade directly in your account center with zero penalties. We accept secure Stripe, Apple Pay, and local Visa networks.
        </p>

        {selectedPlan && (
          <CheckoutModal
            isOpen={!!selectedPlan}
            onClose={() => setSelectedPlan(null)}
            planName={selectedPlan.name}
            planPrice={selectedPlan.price}
            billingPeriod={billingPeriod}
          />
        )}

      </div>
    </section>
  );
}
