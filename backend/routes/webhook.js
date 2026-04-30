/**
 * Soul Elements — Stripe Webhook Handler
 * 
 * Mounted before express.json() to receive raw body for signature verification.
 * Handles: checkout.session.completed
 * 
 * Payment Flow:
 * 1. User completes Stripe checkout → webhook fires
 * 2. Logs payment + customer info
 * 3. Report data is already stored via pre-generate
 * 4. User is redirected to /report?sessionId=xxx
 * 5. User clicks "Download PDF" → GET /api/report/:sessionId/pdf
 *    → Server generates PDF with PDFKit (no Puppeteer needed)
 *    → Returns PDF as downloadable file
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
      const tier = session.metadata?.report_tier || 'standard';
      const customerEmail = session.customer_details?.email || 'N/A';
      const sessionId = session.id;
      const reportSessionId = session.metadata?.report_session_id;

      // console.log(`✅ Payment received — ${tier} report`);
      // console.log(`   Session: ${sessionId}`);
      // console.log(`   Customer: ${customerEmail}`);
      // console.log(`   Amount: $${((session.amount_total || 0) / 100).toFixed(2)}`);
      // console.log(`   Report Session: ${reportSessionId || 'N/A'}`);

      // PDF is generated on-demand when user clicks "Download PDF"
      // No server-side Puppeteer needed — using PDFKit (lightweight)
      // No email sending for v1 — Stripe auto-sends receipt
      // Future: add Resend integration for PDF email delivery

      break;
    }
    case 'checkout.session.expired': {
      // console.log(`Session expired: ${event.data.object.id}`);
      break;
    }
    default:
      // console.log(`Unhandled event: ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;
