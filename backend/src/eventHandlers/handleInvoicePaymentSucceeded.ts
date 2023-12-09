import { Firestore } from '@google-cloud/firestore';
import Stripe from 'stripe';
import { firestore } from '../server';

const handleInvoicePaymentSucceeded = async (invoice: Stripe.Invoice) => {
  // Extract userId from the invoice object
  const userId = invoice.customer as string;

  // Update Firestore
  try {
    await firestore.doc(`users/${userId}/info/settings`).update({
      isPayingUser: true
    });
    console.log(`Updated user ${userId}: set isPayingUser to true.`);
  } catch (error) {
    console.error(`Error updating Firestore for user ${userId}:`, error);
  }
};

export default handleInvoicePaymentSucceeded;

// Triggered When: A payment for a subscription invoice succeeds.

// Use Case: This is crucial for identifying "paying" users. A successful invoice payment typically means the user's subscription is active and in good standing. It's essential for both initial payments and recurring billing cycles.