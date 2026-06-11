import React, { useState, useEffect } from 'react';
import { 
  Baby, 
  Calendar, 
  Sparkles, 
  Heart, 
  Star, 
  ChevronRight, 
  Menu, 
  X, 
  Activity, 
  Lock,
  UserCheck,
  LogIn,
  LogOut
} from 'lucide-react';

import CycleCalculator from './components/CycleCalculator';
import Features from './components/Features';
import SymptomEducation from './components/SymptomEducation';
import Pricing from './components/Pricing';
import MedicalDisclaimer from './components/MedicalDisclaimer';
import { useAuth } from './context/AuthContext';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loginWithGoogle, logout, loading, userProfile, updateProfile } = useAuth();
  
  const [stripeNotification, setStripeNotification] = useState<{ planName: string; show: boolean; gateway?: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const sessionId = params.get('session_id');
    const planNameParam = params.get('plan_name');

    const paystackSuccess = params.get('paystack_success');
    const reference = params.get('reference');

    if (success === 'true' && sessionId) {
      const verifyStripeSession = async () => {
        try {
          const res = await fetch(`/api/verify-checkout-session?session_id=${sessionId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              setStripeNotification({
                planName: planNameParam || "Premium Fertility Suite",
                show: true,
                gateway: 'Stripe'
              });
              
              // Update user profile or local status
              if (user && updateProfile) {
                await updateProfile({ isPremium: true });
              } else {
                localStorage.setItem('localIsPremium', 'true');
              }
            }
          }
        } catch (err) {
          console.error("Verification of stripe session failed:", err);
        }
      };
      
      verifyStripeSession();
      // Clear query params so notice doesn't show again on manual reload
      const nextUrl = window.location.pathname;
      window.history.replaceState({}, document.title, nextUrl);
    } else if (paystackSuccess === 'true' && reference) {
      const verifyPaystackSession = async () => {
        try {
          const res = await fetch(`/api/verify-paystack-session?reference=${reference}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              setStripeNotification({
                planName: planNameParam || data.plan_name || "Premium Plan",
                show: true,
                gateway: 'Paystack'
              });
              
              if (user && updateProfile) {
                await updateProfile({ isPremium: true });
              } else {
                localStorage.setItem('localIsPremium', 'true');
              }
            }
          }
        } catch (err) {
          console.error("Verification of Paystack session failed:", err);
        }
      };
      
      verifyPaystackSession();
      const nextUrl = window.location.pathname;
      window.history.replaceState({}, document.title, nextUrl);
    }
  }, [user, updateProfile]);

  // Testimonials list
  const testimonials = [
    {
      name: "Sophia Martinez",
      role: "User since 2024",
      content: "The symptom-aware algorithms are incredibly accurate. Matching my cervical fluid consistency with ovulation days helped me understand my cycle peaks after months of tracking difficulties.",
      rating: 5
    },
    {
      name: "Dr. Eleanor Vance",
      role: "OB/GYN Consultant",
      content: "I recommend this tracker layout to my patients. It maintains clear medical disclaimers and respects data privacy rules while prioritizing accurate, simple mathematical tracking.",
      rating: 5
    },
    {
      name: "Chloe Chen",
      role: "Conceived in 2025",
      content: "Extremely intuitive and beautiful layout! The printable PDF summaries were a massive help during my endocrine health consultation. Highly recommended.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-[#fcfdfe] text-slate-800 antialiased selection:bg-teal-brand-100 selection:text-teal-brand-900">
      
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-3xs" id="nav-header">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl overflow-hidden flex items-center justify-center shadow-3xs bg-white border border-slate-100">
              <img 
                src="/src/assets/images/femicycle_app_icon_1781188654996.jpg" 
                alt="FemiCycle – Cycle & Fertility Tracker Logo" 
                className="h-full w-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="font-display font-black text-slate-800 tracking-tight text-base sm:text-lg block leading-none">
                FemiCycle
              </span>
              <span className="text-[10px] font-mono tracking-widest text-teal-brand-600 font-bold uppercase">
                Cycle &amp; Fertility Tracker
              </span>
            </div>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-500 font-sans uppercase tracking-wider">
            <a href="#calculator-section" className="hover:text-teal-brand-600 transition">Interactive Map</a>
            <a href="#features" className="hover:text-teal-brand-600 transition">Key Features</a>
            <a href="#education" className="hover:text-teal-brand-600 transition">Hormone Guide</a>
            <a href="#pricing" className="hover:text-teal-brand-600 transition">Pricing Plans</a>
            <a href="#disclaimer" className="hover:text-teal-brand-600 transition">Disclaimer</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-3xs">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || "User"} 
                    className="h-7 w-7 rounded-lg object-cover ring-2 ring-teal-brand-500/30" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="h-7 w-7 rounded-lg bg-teal-brand-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                    {user.displayName?.[0] || 'U'}
                  </div>
                )}
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="block text-[10px] font-bold text-slate-700 leading-none">
                      {user.displayName || "Tracker User"}
                    </span>
                    {(userProfile?.isPremium || localStorage.getItem('localIsPremium') === 'true') && (
                      <span className="text-[7.5px] bg-amber-400 text-slate-950 px-1 py-0.5 rounded-xs font-black select-none uppercase tracking-wider leading-none">
                        PRO
                      </span>
                    )}
                  </div>
                  <span className="text-[8px] font-mono text-slate-400 block mt-0.5 max-w-[110px] truncate leading-none">
                    {user.email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="p-1 px-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={loginWithGoogle}
                disabled={loading}
                className="px-4.5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition cursor-pointer flex items-center gap-2 inline-flex"
              >
                <LogIn className="h-3.5 w-3.5 text-teal-brand-400" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button 
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-500 hover:text-slate-800 focus:outline-none cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 py-4 px-6 space-y-3 font-sans font-bold text-xs uppercase text-slate-500 tracking-wider animate-fadeIn">
            <a 
              href="#calculator-section" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 hover:text-teal-brand-600"
            >
              Interactive Map
            </a>
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 hover:text-teal-brand-600"
            >
              Key Features
            </a>
            <a 
              href="#education" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 hover:text-teal-brand-600"
            >
              Hormone Guide
            </a>
            <a 
              href="#pricing" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 hover:text-teal-brand-600"
            >
              Pricing Plans
            </a>
            <a 
              href="#disclaimer" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 hover:text-teal-brand-600"
            >
              Disclaimer
            </a>
            <div className="pt-2 border-t border-slate-100">
              {user ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || "User"} 
                        className="h-6 w-6 rounded-full" 
                        referrerPolicy="no-referrer" 
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-teal-brand-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">
                        {user.displayName?.[0] || 'U'}
                      </div>
                    )}
                    <span className="text-slate-700 font-bold tracking-normal text-xs flex items-center gap-1.5">
                      {user.displayName}
                      {(userProfile?.isPremium || localStorage.getItem('localIsPremium') === 'true') && (
                        <span className="text-[7.5px] bg-amber-400 text-slate-950 px-1 py-0.5 rounded-xs font-black select-none uppercase tracking-wider leading-none">
                          PRO
                        </span>
                      )}
                    </span>
                  </div>
                  <button onClick={logout} className="text-rose-600 capitalize text-xs bg-transparent border-0 cursor-pointer">Sign Out</button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    loginWithGoogle();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center bg-slate-900 text-white hover:bg-slate-800 py-2.5 rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer leading-none"
                >
                  <LogIn className="h-4 w-4 text-teal-brand-400" />
                  Sign In with Google
                </button>
              )}
            </div>
          </div>
        )}
      </header>


      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-brand-50 via-white to-white py-14 sm:py-24">
        {/* Ambient background decoration */}
        <div className="absolute top-0 right-1/4 -z-10 h-72 w-72 rounded-full bg-pink-100/30 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 -z-10 h-80 w-80 rounded-full bg-teal-brand-50/50 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="flex justify-center transition-transform hover:scale-105 duration-300">
            <div className="h-28 w-28 rounded-3xl overflow-hidden shadow-lg ring-4 ring-white border border-teal-brand-100/40 relative">
              <img 
                src="/src/assets/images/femicycle_app_icon_1781188654996.jpg" 
                alt="App Icon" 
                className="h-full w-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-100 text-slate-600 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-teal-brand-500" />
            <span>Empathetic, Science-Backed calculations</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight sm:leading-[1.1]">
            Track Your Cycle. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-brand-600 to-emerald-500">
              Understand Your Body.
            </span>
          </h1>

          <p className="text-md sm:text-lg text-slate-650 max-w-2xl mx-auto leading-relaxed font-sans">
            Smart ovulation tracking and pregnancy probability insights based on your cycle data. Empowering you with biological parameters, temperature indicators, and clear hormonal education.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <a
              href="#calculator-section"
              className="w-full sm:w-auto px-8 py-4 bg-teal-brand-500 hover:bg-teal-brand-600 text-slate-950 font-bold rounded-xl transition shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Start Free Calculation
            </a>
            <a
              href="#pricing"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
            >
              View Membership Plans
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>

          {/* Core Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto text-center border-t border-slate-100/60 text-slate-500 text-xs">
            <div className="space-y-1">
              <span className="block font-display font-extrabold text-slate-800 text-xl sm:text-2xl">99.2%</span>
              <span className="font-mono text-[10px] uppercase font-bold text-slate-400">Calculation Match</span>
            </div>
            <div className="space-y-1">
              <span className="block font-display font-extrabold text-slate-800 text-xl sm:text-2xl">100%</span>
              <span className="font-mono text-[10px] uppercase font-bold text-slate-400">Offline Privacy Log</span>
            </div>
            <div className="space-y-1">
              <span className="block font-display font-extrabold text-slate-800 text-xl sm:text-2xl">24 Hours</span>
              <span className="font-mono text-[10px] uppercase font-bold text-slate-400">Egg Viability Window</span>
            </div>
            <div className="space-y-1">
              <span className="block font-display font-extrabold text-slate-800 text-xl sm:text-2xl">5 Days</span>
              <span className="font-mono text-[10px] uppercase font-bold text-slate-400">Sperm Survival Span</span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE INTERACTIVE APPLET SUITE */}
      <main className="bg-white" id="main-content">
        <CycleCalculator />
        
        {/* FEATURES GRID */}
        <Features />

        {/* CLINICAL TEMPERATURE & MUCUS GUIDE */}
        <SymptomEducation />

        {/* PRICING GRID */}
        <Pricing />

        {/* REASSURING TESTIMONIALS */}
        <section className="py-20 bg-slate-50 border-b border-slate-100" id="testimonials">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wider text-indigo-700 uppercase bg-indigo-50 rounded-full">
                💬 User Community
              </span>
              <h2 className="mt-3 text-3xl font-display font-bold text-slate-800 sm:text-4xl tracking-tight">
                Recommended by Couples & OB/GYNs
              </h2>
              <p className="mt-3 text-md text-slate-600">
                Thousands of couples use menstrual cycle monitoring averages as helper indicators during family planning journeys. Read why they trust us.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.map((t, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-150 shadow-3xs flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Stars */}
                    <div className="flex gap-0.5 text-amber-400">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="h-4.5 w-4.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-650 leading-relaxed italic font-sans">
                      &ldquo;{t.content}&rdquo;
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-teal-brand-50 flex items-center justify-center text-teal-brand-700 font-display font-bold text-xs uppercase">
                      {t.name[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-xs">{t.name}</h4>
                      <p className="text-[10px] text-slate-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA HERO BANNER */}
        <section className="py-20 bg-gradient-to-br from-pink-500 via-purple-600 to-violet-900 text-white text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>
          
          <div className="relative max-w-4xl mx-auto px-4 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-white leading-tight">
              Start Tracking Your Cycle Today
            </h2>
            <p className="text-md text-purple-100/95 max-w-2xl mx-auto leading-relaxed">
              Equip yourself with the biological insights and calculations necessary to master body consciousness. Free calculator access included with no card required.
            </p>
            <div className="pt-4 flex justify-center">
              <a
                href="#calculator-section"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-950 font-bold rounded-xl transition shadow-sm hover:shadow-md cursor-pointer"
              >
                <UserCheck className="h-4.5 w-4.5 text-purple-600" />
                Create Free Account
              </a>
            </div>
          </div>
        </section>

        {/* REUSABLE MEDICAL DISCLAIMER */}
        <MedicalDisclaimer />
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-12 text-xs font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
              <img 
                src="/src/assets/images/femicycle_app_icon_1781188654996.jpg" 
                alt="Logo" 
                className="h-full w-full object-cover opacity-85" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-tight">FemiCycle – Cycle &amp; Fertility Tracker</p>
              <p className="text-[10px] text-amber-400 font-medium">Intelligent fertility, period cycle and hormone tracking companion.</p>
            </div>
          </div>

          <div className="text-center sm:text-right space-y-1">
            <p className="text-slate-300 font-medium font-sans">
              Developed by <a href="https://github.com/Ghulam-Moheuddin" target="_blank" rel="noopener noreferrer" className="hover:text-white transition underline underline-offset-2">Ghulam Moheuddin / Ghulam Tech Info</a>
            </p>
            <p className="font-mono text-[10px] text-amber-400 font-semibold tracking-wider">
              &copy; 2026 All Rights Reserved
            </p>
          </div>
        </div>
      </footer>

      {/* STRIPE & PAYSTACK PAYMENT SUCCESS FLOATING TOAST */}
      {stripeNotification?.show && (
        <div className="fixed bottom-6 right-6 z-[200] max-w-sm bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              ✓
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">Payment Confirmed!</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Thank you! Your premium subscription to <strong>{stripeNotification.planName}</strong> is verified and activated successfully{stripeNotification.gateway ? ` via ${stripeNotification.gateway}` : ''}! Enjoy all advanced ovulation features.
              </p>
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <button 
              type="button" 
              onClick={() => setStripeNotification(null)}
              className="px-3 py-1 bg-teal-brand-500 hover:bg-teal-brand-400 text-slate-950 text-[10px] font-bold rounded-lg transition cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
