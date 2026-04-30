/**
 * Soul Elements — Stripe Integration
 * 
 * POST /api/create-checkout-session
 */

const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const crypto = require('crypto');
const { reportStore } = require('./report');

function getStripe() {
  return Stripe(process.env.STRIPE_SECRET_KEY);
}

const PRICES = {
  standard: process.env.STRIPE_STANDARD_PRICE_ID || 'price_1TRBMQHHO3x30BrPDNeywBmu',  // $49 — Origin Map: The Essential Blueprint
  grandmaster: process.env.STRIPE_GRANDMASTER_PRICE_ID || 'price_1TRBPSHHO3x30BrPwWk0Xcpp', // $99 — Origin Map: The Grand Master's Strategy
};

// Simple rate limiter for free coupons
const freeCouponUsage = new Map();
function checkFreeCouponRateLimit(ip) {
  const key = ip;
  const now = Date.now();
  const per10MinMs = 10 * 60 * 1000; // 10 minutes
  const perDayMs = 24 * 60 * 60 * 1000; // 24 hours
  const maxPerDay = 3;

  if (!freeCouponUsage.has(key)) {
    freeCouponUsage.set(key, { count: 1, firstUse: now, lastUse: now });
    return true;
  }

  const record = freeCouponUsage.get(key);

  // Check 10-minute cooldown
  if (now - record.lastUse < per10MinMs) {
    return false;
  }

  // Check daily limit
  if (now - record.firstUse > perDayMs) {
    // Reset daily window
    freeCouponUsage.set(key, { count: 1, firstUse: now, lastUse: now });
    return true;
  }

  if (record.count >= maxPerDay) return false;

  record.count++;
  record.lastUse = now;
  return true;
}

/**
 * Create Checkout Session
 * POST /api/create-checkout-session
 */
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { tier, reportData, coupon } = req.body;

    if (!tier || !PRICES[tier]) {
      return res.status(400).json({ error: 'Invalid tier. Use "standard" or "grandmaster".' });
    }

    // Handle coupon codes: skip Stripe
    if (coupon === 'FREE' && tier === 'standard') {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      if (!checkFreeCouponRateLimit(clientIp)) {
        return res.status(429).json({ error: 'Free coupon rate limit exceeded. Please wait before trying again.' });
      }
      const dummySessionId = `free_${Date.now()}_${crypto.randomUUID().split('-')[0]}`;
      if (reportData) {
        reportStore.set(dummySessionId, {
          data: reportData,
          timestamp: Date.now(),
        });
      }
      const frontendUrl = process.env.FRONTEND_URL || `http://localhost:${process.env.PORT || 3001}`;
      console.warn(`FREE coupon used — IP: ${clientIp}, time: ${new Date().toISOString()}, session: ${dummySessionId}`);
      return res.json({
        url: `${frontendUrl}/report?session_id=${dummySessionId}&tier=standard`,
        sessionId: dummySessionId,
        free: true,
      });
    }

    if (coupon === 'FREE2' && tier === 'grandmaster') {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      if (!checkFreeCouponRateLimit(clientIp)) {
        return res.status(429).json({ error: 'Free coupon rate limit exceeded. Please wait before trying again.' });
      }
      const dummySessionId = `free_${Date.now()}_${crypto.randomUUID().split('-')[0]}`;
      if (reportData) {
        reportStore.set(dummySessionId, {
          data: reportData,
          timestamp: Date.now(),
        });
      }
      const frontendUrl = process.env.FRONTEND_URL || `http://localhost:${process.env.PORT || 3001}`;
      console.warn(`FREE2 coupon used — IP: ${clientIp}, time: ${new Date().toISOString()}, session: ${dummySessionId}`);
      return res.json({
        url: `${frontendUrl}/report?session_id=${dummySessionId}&tier=grandmaster`,
        sessionId: dummySessionId,
        free: true,
      });
    }

    const stripe = getStripe();
    const frontendUrl = process.env.FRONTEND_URL || `http://localhost:${process.env.PORT || 3001}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price: PRICES[tier],
        quantity: 1,
      }],
      metadata: {
        report_tier: tier === 'grandmaster' ? 'grandmaster' : 'essential',
      },
      success_url: `${frontendUrl}/report?session_id={CHECKOUT_SESSION_ID}&tier=${tier}`,
      cancel_url: `${frontendUrl}/preview?canceled=true`,
      customer_creation: 'always',
      billing_address_collection: 'required',
      allow_promotion_codes: true,
    });

    // Store report data server-side keyed by session ID
    if (reportData) {
      reportStore.set(session.id, {
        data: reportData,
        timestamp: Date.now(),
      });
      // console.log(`📦 Report data stored for session: ${session.id}`);
    }

    // console.log(`✅ Checkout session created: ${session.id} (tier: ${tier})`);
    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({ error: error.message || 'Failed to create checkout session.' });
  }
});

module.exports = router;
