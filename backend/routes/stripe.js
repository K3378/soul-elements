/**
 * Soul Elements — Stripe Integration
 * 
 * POST /api/create-checkout-session
 */

const express = require('express');
const router = express.Router();
const Stripe = require('stripe');

function getStripe() {
  return Stripe(process.env.STRIPE_SECRET_KEY);
}

const PRICES = {
  standard: 'price_1TRBMQHHO3x30BrPDNeywBmu',  // $49 — Origin Map: The Essential Blueprint
  grandmaster: 'price_1TRBPSHHO3x30BrPwWk0Xcpp', // $99 — Origin Map: The Grand Master's Strategy
};

/**
 * Create Checkout Session
 * POST /api/create-checkout-session
 */
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { tier, reportData } = req.body;

    if (!tier || !PRICES[tier]) {
      return res.status(400).json({ error: 'Invalid tier. Use "standard" or "grandmaster".' });
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
        report_data: reportData ? JSON.stringify(reportData).substring(0, 1000) : '',
      },
      success_url: `${frontendUrl}/report?session_id={CHECKOUT_SESSION_ID}&tier=${tier}`,
      cancel_url: `${frontendUrl}/preview?canceled=true`,
      customer_creation: 'always',
      billing_address_collection: 'required',
      allow_promotion_codes: true,
    });

    console.log(`✅ Checkout session created: ${session.id} (tier: ${tier})`);
    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session.' });
  }
});

module.exports = router;
