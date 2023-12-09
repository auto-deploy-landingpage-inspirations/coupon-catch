import { Firestore } from '@google-cloud/firestore';
import Stripe from 'stripe';
import { firestore } from '../server';

const handleInvoicePaymentFailed = async (invoice: Stripe.Invoice) => {
  // Extract userId from the invoice object
  const userId = invoice.customer as string;

  // Update Firestore
  try {
    await firestore.doc(`users/${userId}/info/settings`).update({
      isPayingUser: false
    });
    console.log(`Updated user ${userId}: set isPayingUser to false.`);
  } catch (error) {
    console.error(`Error updating Firestore for user ${userId}:`, error);
  }
};

export default handleInvoicePaymentFailed;

// Triggered When: A payment for a subscription invoice fails.

// Use Case: Important for identifying users whose payments have failed. This might put their account in a "past due" or "suspended" state, depending on your business logic. You may want to reach out to these users to update their payment methods or resolve billing issues.