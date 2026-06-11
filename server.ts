import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

let stripe: Stripe | null = null;

// Lazy initialization of Stripe to avoid startup crashes if missing keys
function getStripe(): Stripe | null {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key) {
      stripe = new Stripe(key, {
        apiVersion: '2025-02-02-preview' as any,
      });
    }
  }
  return stripe;
}



async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser limit
  app.use(express.json());

  // 1. API: Get Stripe publishable key configuration
  app.get('/api/stripe-config', (req, res) => {
    try {
      const publishableKey = process.env.VITE_STRIPE_PUBLISHABLE_KEY || null;
      const stripeConfigured = !!process.env.STRIPE_SECRET_KEY && !!publishableKey;
      res.json({
        stripeConfigured,
        publishableKey,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 1b. API: Get Paystack public key configuration
  app.get('/api/paystack-config', (req, res) => {
    try {
      const publicKey = process.env.VITE_PAYSTACK_PUBLIC_KEY || null;
      const paystackConfigured = !!process.env.PAYSTACK_SECRET_KEY;
      res.json({
        paystackConfigured,
        publicKey,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });



  // 2b. API: Create Paystack Session
  app.post('/api/create-paystack-session', async (req, res) => {
    try {
      const { planName, planPrice, billingPeriod, originUrl, email } = req.body;

      if (!planName || !planPrice || !email) {
        return res.status(400).json({ error: 'planName, planPrice, and email are required parameters.' });
      }

      const secretKey = process.env.PAYSTACK_SECRET_KEY;
      if (!secretKey) {
        return res.status(400).json({
          error: 'Paystack is not configured. Please add PAYSTACK_SECRET_KEY in Settings/Secrets.',
          paystackConfigured: false
        });
      }

      // Parse the price (remove currency signs)
      const cleanedPriceInUSD = parseFloat(planPrice.replace(/[^0-9.]/g, ''));
      if (isNaN(cleanedPriceInUSD) || cleanedPriceInUSD <= 0) {
        return res.status(400).json({ error: `Invalid planPrice value: ${planPrice}` });
      }

      // Convert USD to South African Rand (ZAR) for local payments in South Africa
      const exchangeRate = 18.5; // standard rate index
      const amountInZAR = cleanedPriceInUSD * exchangeRate;
      const amountInCents = Math.round(amountInZAR * 100);

      const redirectUrl = originUrl || process.env.APP_URL || `http://localhost:${PORT}`;

      // Initialize Paystack transaction
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          amount: amountInCents,
          currency: 'ZAR',
          callback_url: `${redirectUrl}?paystack_success=true&plan_name=${encodeURIComponent(planName)}`,
          metadata: {
            planName,
            billingPeriod,
            amountInUSD: cleanedPriceInUSD
          }
        })
      });

      const data: any = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to initialize Paystack session');
      }

      res.json({ url: data.data.authorization_url, paystackConfigured: true });
    } catch (err: any) {
      console.error('Paystack Session creation Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // 3b. API: Verify Paystack transaction
  app.get('/api/verify-paystack-session', async (req, res) => {
    try {
      const { reference } = req.query;
      if (!reference || typeof reference !== 'string') {
        return res.status(400).json({ error: 'reference is required' });
      }

      const secretKey = process.env.PAYSTACK_SECRET_KEY;
      if (!secretKey) {
        return res.status(500).json({ error: 'Paystack is not configured.' });
      }

      const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${secretKey}`
        }
      });

      const data: any = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to verify transaction with Paystack');
      }

      res.json({
        success: data.data.status === 'success',
        status: data.data.status,
        plan_name: data.data.metadata?.planName || null
      });
    } catch (err: any) {
      console.error('Paystack Verification Error:', err);
      res.status(500).json({ error: err.message });
    }
  });



  // 2. API: Create Stripe Checkout Session
  app.post('/api/create-checkout-session', async (req, res) => {
    try {
      const { planName, planPrice, billingPeriod, originUrl } = req.body;

      if (!planName || !planPrice) {
        return res.status(400).json({ error: 'planName and planPrice are required parameters.' });
      }

      const client = getStripe();
      if (!client) {
        return res.status(400).json({
          error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY in Settings/Secrets.',
          stripeConfigured: false
        });
      }

      // Parse the price (remove $, e.g. "$19/mo" or "$149" or "$19.00")
      const cleanedPrice = parseFloat(planPrice.replace(/[^0-9.]/g, ''));
      if (isNaN(cleanedPrice) || cleanedPrice <= 0) {
        return res.status(400).json({ error: `Invalid planPrice value: ${planPrice}` });
      }
      const amountInCents = Math.round(cleanedPrice * 100);

      const redirectUrl = originUrl || process.env.APP_URL || `http://localhost:${PORT}`;

      // Set up line items for subscription or one-time depending on billing period
      const isSubscription = billingPeriod === 'yearly' || billingPeriod === 'monthly';

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `IVF Suite - ${planName}`,
                description: `Unlock premium access to IVF Suite. Billing: ${billingPeriod || 'one-time'}`,
              },
              unit_amount: amountInCents,
              ...(isSubscription && {
                recurring: {
                  interval: billingPeriod === 'yearly' ? 'year' : 'month',
                },
              }),
            },
            quantity: 1,
          },
        ],
        mode: isSubscription ? 'subscription' : 'payment',
        success_url: `${redirectUrl}?success=true&session_id={CHECKOUT_SESSION_ID}&plan_name=${encodeURIComponent(planName)}`,
        cancel_url: `${redirectUrl}?canceled=true`,
      };

      const session = await client.checkout.sessions.create(sessionParams);
      res.json({ url: session.url, stripeConfigured: true });
    } catch (err: any) {
      console.error('Stripe Checkout Session Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // 3. API: Verify Stripe checkout session status
  app.get('/api/verify-checkout-session', async (req, res) => {
    try {
      const { session_id } = req.query;
      if (!session_id || typeof session_id !== 'string') {
        return res.status(400).json({ error: 'session_id is required' });
      }

      const client = getStripe();
      if (!client) {
        return res.status(400).json({ error: 'Stripe is not configured.' });
      }

      const session = await client.checkout.sessions.retrieve(session_id);
      res.json({
        success: session.payment_status === 'paid',
        payment_status: session.payment_status,
        plan_name: session.metadata?.plan_name || null
      });
    } catch (err: any) {
      console.error('Stripe Verification Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Serve static assets or mount Vite dev middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
