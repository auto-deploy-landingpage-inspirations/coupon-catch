import express from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

const router = express.Router();

// import customerSubscriptionUpdated from "../eventHandlers/handleCustomerSubscriptionUpdated"
import invoicePaymentFailed from "../eventHandlers/handleInvoicePaymentFailed"
import invoicePaymentSucceeded from "../eventHandlers/handleInvoicePaymentSucceeded"
// import paymentIntentSucceeded from "../eventHandlers/handlePaymentIntentSucceeded"
// import paymentIntentFailed from "../eventHandlers/handlePaymentIntentFailed"
import customerSubscriptionDeleted from "../eventHandlers/handleCustomerSubscriptionDeleted"


router.post('/', express.raw({type: 'application/json'}), (request, response) => {
  const sig = request.headers['stripe-signature'];

  if (!sig || Array.isArray(sig)) {
    response.status(400).send('Invalid Stripe signature');
    return;
  }

  let event: Stripe.Event;

  const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET as string;
  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    if (err instanceof Error) {
      response.status(400).send(`Webhook Error: ${err.message}`);
    } else {
      response.status(500).send('An unknown error occurred');
    }
    return;
  }

// Handle the event
switch (event.type) {
  case 'payment_intent.succeeded':
    // ... existing handling code ...
    break;
  case 'invoice.payment_succeeded':
    invoicePaymentSucceeded(event.data.object as Stripe.Invoice);
    break;
  // ... handle other event types ...
  default:
    console.log(`Unhandled event type ${event.type}`);
}

  // Return a 200 response to acknowledge receipt of the event
  response.json({ received: true });
});

export default router;
