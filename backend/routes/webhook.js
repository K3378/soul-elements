/**
 * Soul Elements — Stripe Webhook Handler
 * 
 * Mounted before express.json() to receive raw body for signature verification.
 * Handles: checkout.session.completed
 */

const express = require('express');
const router = express.Router();
const Stripe = require('stripe');

function getStripe() {
  return Stripe(process.env.STRIPE_SECRET_KEY);
}

// Raw body needed for signature verification
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      // Dev mode: no signature verification
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error('Webhook verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const tier = session.metadata?.report_tier || 'essential';
      
      console.log(`✅ Payment received — ${tier} report`);
      console.log(`   Session: ${session.id}`);
      console.log(`   Customer: ${session.customer_details?.email || 'N/A'}`);
      console.log(`   Amount: $${(session.amount_total || 0) / 100}`);
      
      // TODO: Trigger PDF generation
      // await generatePDF(session.id, tier);
      
      break;
    }
    case 'checkout.session.expired': {
      console.log(`Session expired: ${event.data.object.id}`);
      break;
    }
    default:
      console.log(`Unhandled event: ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;
