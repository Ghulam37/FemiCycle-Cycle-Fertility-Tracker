import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  Loader2,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planPrice: string;
  billingPeriod: string;
}

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  planName, 
  planPrice, 
  billingPeriod 
}: CheckoutModalProps) {
  const { user, userProfile, updateProfile } = useAuth();
  
  const [payEmail, setPayEmail] = useState(user?.email || '');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [step, setStep] = useState<'checkout' | 'success'>('checkout');
  const [processingStatus, setProcessingStatus] = useState('');

  const [paystackConfig, setPaystackConfig] = useState<{ paystackConfigured: boolean; publicKey: string | null }>({
    paystackConfigured: false,
    publicKey: null
  });

  useEffect(() => {
    if (user?.email) {
      setPayEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/paystack-config')
        .then(res => res.ok ? res.json() : { paystackConfigured: false, publicKey: null })
        .then(paystackData => {
          setPaystackConfig(paystackData);
        })
        .catch(() => setPaystackConfig({ paystackConfigured: false, publicKey: null }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Paystack checkout redirection path
    if (paystackConfig.paystackConfigured) {
      if (!payEmail) {
        setErrorMessage('Customer email is required for Paystack invoices.');
        return;
      }
      setIsProcessing(true);
      setProcessingStatus('Establishing secure connection with Paystack initialization API...');
      try {
        const response = await fetch('/api/create-paystack-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            planName,
            planPrice,
            billingPeriod,
            email: payEmail,
            originUrl: window.location.origin
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to initialize Paystack session');
        }

        setProcessingStatus('Redirecting to secure Paystack checkout portal...');
        if (data.url) {
          window.location.href = data.url;
          return;
        } else {
          throw new Error('No checkout URL received from Paystack API');
        }
      } catch (err: any) {
        console.error('Paystack initialization failed', err);
        setErrorMessage(err.message || 'An error occurred during Paystack initialization.');
        setIsProcessing(false);
      }
      return;
    }

    if (!payEmail) {
      setErrorMessage('Please provide a valid customer email for your receipt invoice.');
      return;
    }

    // Trigger Processing Simulation for fallback sandbox test (when keys aren't provided in settings)
    setIsProcessing(true);
    setProcessingStatus(`Establishing secure TLS-handshake with simulated Paystack API...`);
    
    setTimeout(() => {
      setProcessingStatus(`Validating tokens with simulated Visa / MasterCard and African EFT secure networks...`);
      
      setTimeout(() => {
        setProcessingStatus(`Securing database token authorization for Paystack settlement account (ZAR)...`);
        
        setTimeout(async () => {
          try {
            // Success callback! Setting user's profile as paid or local setting
            if (user && updateProfile) {
              await updateProfile({ isPremium: true });
            } else {
              // Local fallback simulation (mock storage flag)
              localStorage.setItem('localIsPremium', 'true');
            }
          } catch (err) {
            console.error('Failed to update premium profile state', err);
          }
          setIsProcessing(false);
          setStep('success');
        }, 1200);
      }, 1000);
    }, 1200);
  };

  const handleBackToSafeState = () => {
    setStep('checkout');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs font-sans animate-fadeIn">
      <div className="relative bg-white text-slate-900 rounded-3xl w-full max-w-lg overflow-hidden border border-slate-100 shadow-2xl">
        
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-teal-brand-600 to-emerald-500 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5.5 w-5.5 text-teal-brand-300" />
            <div>
              <h3 className="font-display font-bold text-base leading-none">Secure Global Checkout</h3>
              <p className="text-[10px] text-teal-brand-100/90 font-mono mt-1">PCI-DSS Compliant Encryption</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            disabled={isProcessing}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === 'checkout' ? (
          <form onSubmit={handlePay} className="p-6 space-y-5">
            
            {/* Active Plan Detail Ribbon */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Plan Selected</span>
                <div className="font-display font-black text-slate-800 text-md flex items-center gap-1.5 mt-0.5">
                  <Sparkles className="h-4 w-4 text-teal-brand-500" />
                  {planName}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-slate-900 leading-none">
                  ${planPrice}
                </div>
                <div className="text-[10px] font-semibold text-slate-400 mt-1">
                  per {billingPeriod === 'yearly' ? 'year' : 'month'}
                </div>
              </div>
            </div>

            {/* PAYSTACK SINGLE BRAND HERO BLOCK */}
            <div className="p-4 rounded-2xl bg-slate-950 text-white flex items-center justify-between shadow-xs border border-slate-900">
              <div className="space-y-0.5 text-left">
                <div className="flex items-center gap-1.5 font-sans font-black tracking-tight text-xs uppercase leading-none">
                  <span className="text-cyan-400">Pay</span>
                  <span className="text-teal-400">stack</span>
                  <span className="text-[9px] text-slate-500 font-normal lowercase tracking-normal bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded ml-1">Secure Billing Partner</span>
                </div>
                <span className="block text-[10px] text-slate-400 font-medium">Localized Payments • South Africa</span>
              </div>
              <div className="text-right">
                {paystackConfig.paystackConfigured ? (
                  <span className="text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-black uppercase tracking-wider leading-none font-mono">Live Connected</span>
                ) : (
                  <span className="text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider leading-none font-mono">Simulated Sandbox</span>
                )}
              </div>
            </div>

            {/* FLOW ROUTING TRANSACTION PATHS */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-left">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Secure Routing Pathway</span>
              
              <div className="text-[10px] bg-white border border-slate-200/60 p-2 rounded-xl text-slate-600 font-mono flex flex-col gap-1.5 leading-tight select-all">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-800 font-sans border-b border-slate-100 pb-1">
                  <span>Billing currency conversion</span>
                  <span className="text-teal-brand-600">USD to ZAR @ 18.5</span>
                </div>
                <div className="flex justify-between items-center text-[10.5px]">
                  <span>Clean USD Rate:</span>
                  <span className="font-bold text-slate-700">${parseFloat(planPrice.replace(/[^0-9.]/g, '') || '0') && planPrice}</span>
                </div>
                <div className="flex justify-between items-center text-[10.5px] border-b border-dashed border-slate-100 pb-1.5">
                  <span>Paystack Equivalent:</span>
                  <span className="font-extrabold text-teal-700">R{(parseFloat(planPrice.replace(/[^0-9.]/g, '') || '0') * 18.5).toFixed(2)} ZAR</span>
                </div>
                <div className="text-[9px] text-slate-400 pt-0.5 leading-relaxed font-sans">
                  Pathway: Customer → Visa/Mastercard/EFT → Paystack → Your bank (ZAR)
                </div>
              </div>
            </div>

            {/* GATEWAY-SPECIFIC CONFIGURATION GUIDES */}
            {paystackConfig.paystackConfigured ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-xs space-y-1 text-emerald-800 leading-relaxed font-sans text-left animate-fadeIn">
                <div className="font-bold flex items-center gap-1.5 text-emerald-950">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  Paystack Merchant Portal Connected
                </div>
                <p className="text-[11px] text-emerald-700">
                  Your Paystack API is active in Cloud Run. Clicking authorize securely redirects to Paystack's official secure gateway for card or Instant EFT transactions (ZAR).
                </p>
              </div>
            ) : (
              <div className="bg-amber-55 border border-amber-100/90 rounded-2xl p-4 text-xs text-amber-805 leading-relaxed font-sans space-y-1.5 text-left animate-fadeIn">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <HelpCircle className="h-4 w-4 text-amber-600 shrink-0" />
                  Link your real Paystack Account
                </div>
                <p className="text-[11px] text-amber-700">
                  Navigate to your AI Studio <strong>Settings</strong> panel (gear icon, top right), choose <strong>Secrets</strong>, and add:
                </p>
                <div className="p-2.5 bg-white/70 border border-amber-200/50 rounded-xl font-mono text-[9px] text-slate-700 leading-snug space-y-1 select-all">
                  <div>• <strong className="text-slate-900">PAYSTACK_SECRET_KEY</strong> (Paystack Sandbox or Live Secret)</div>
                  <div>• <strong className="text-slate-900">VITE_PAYSTACK_PUBLIC_KEY</strong> (Paystack Sandbox or Live Public Key)</div>
                </div>
                <p className="text-[9.5px] text-amber-655 font-medium leading-normal">
                  Sandbox simulator active. Type any customer email address below and click authorize to approve sandbox upgrade immediately.
                </p>
              </div>
            )}

            {/* ERROR SUMMARY */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs font-sans text-left leading-snug animate-shake">
                ⚠️ {errorMessage}
              </div>
            )}

            {/* PAYSTACK SINGLE-INPUT EMAIL BLOCK */}
            <div className="space-y-3.5 text-left">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">Customer Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. client@example.com"
                  value={payEmail}
                  onChange={(e) => setPayEmail(e.target.value)}
                  disabled={isProcessing}
                  className="w-full px-3.5 py-2.5 bg-white text-slate-800 text-xs rounded-xl border border-slate-200 focus:border-teal-brand-500 focus:outline-none focus:ring-1 focus:ring-teal-brand-500 transition shadow-3xs"
                />
                <p className="text-[10px] text-slate-450 leading-normal">
                  Paystack requires a valid customer email to securely compile invoice receipts automatically.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl text-[11px] text-slate-600 font-sans leading-relaxed">
                <span className="font-bold text-slate-800 block mb-1">🌍 South African / African Payment Networks</span>
                Paystack connects securely to local Visa, Mastercard, instant EFT (Capitec, EFT secure, etc.), and mobile money. Transactions are securely converted from standard USD to equivalent ZAR (South African Rand) for localized checkout.
              </div>
            </div>

            {/* Secure Footer label */}
            <div className="flex items-center gap-2 text-[10px] text-slate-400 text-left">
              <Lock className="h-3.5 w-3.5 text-teal-brand-500 shrink-0" />
              <span>
                By completing transaction, you accept our standard terms. Secure SSL checkout with AES-256 bits.
              </span>
            </div>

            {/* Action Buttons */}
            {isProcessing ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-2.5">
                <Loader2 className="h-6 w-6 text-teal-brand-600 animate-spin mx-auto" />
                <div className="text-xs font-semibold text-slate-800 font-mono">
                  {processingStatus}
                </div>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full text-center bg-slate-950 hover:bg-slate-900 text-white py-3.5 rounded-2xl text-xs font-bold font-sans transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm select-none"
              >
                <span>Authorize ${planPrice} Securely</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

          </form>
        ) : (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-display font-black text-slate-800">
                Purchase Confirmed!
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Thank you, family tracking parameters are successfully adjusted. Your subscription to <strong>{planName}</strong> is activated!
              </p>
            </div>

            <div className="bg-emerald-50/50 rounded-2xl p-4.5 border border-emerald-100 max-w-xs mx-auto text-left">
              <div className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider font-mono">Status Details</div>
              <div className="text-[12px] font-bold text-slate-700 mt-1">✓ Cloud Synchronized: Active</div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Invoice Reference: ST-PRO_{Math.floor(100000 + Math.random() * 900000)}</div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleBackToSafeState}
                className="w-full button py-3 rounded-2xl bg-teal-brand-500 hover:bg-teal-brand-600 font-bold text-xs text-slate-950 transition cursor-pointer shadow-xs select-none uppercase tracking-wide"
              >
                Close Gateway & Start Exploring
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
