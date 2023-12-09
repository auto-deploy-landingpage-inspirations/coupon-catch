import { Firestore } from '@google-cloud/firestore';
import Stripe from 'stripe';
import { firestore } from '../server';

const handleCustomerSubscriptionUpdated = async (session: Stripe.Checkout.Session) => {
  const customerId = session.customer as string;

  if (session.metadata && session.metadata.userId) {
    const fb_userId = session.metadata.userId;

  // Update Firestore
  try {
    await firestore.doc(`users/${fb_userId}`).update({
      stripeCustomerId: customerId
    });
    console.log(`Mapped Stripe customer ID to Firebase user: ${fb_userId}`);
  } catch (error) {
    console.error(`Error mapping Stripe customer ID to Firebase user ${fb_userId}:`, error);
  }
}
};

export default handleCustomerSubscriptionUpdated;

// Triggered When: A Checkout Session is completed successfully.

// Use Case: If you use Stripe Checkout to set up subscriptions, this event is also relevant. It indicates a successful setup of a subscription through Stripe's Checkout process.

// This si where youll setup mapping of ID and id creation