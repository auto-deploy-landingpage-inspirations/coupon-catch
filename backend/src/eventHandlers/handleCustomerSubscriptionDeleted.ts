import { Firestore } from '@google-cloud/firestore';
import Stripe from 'stripe';
import { firestore } from '../server';

const handleCustomerSubscriptionDeleted = async (invoice: Stripe.Invoice) => {
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

export default handleCustomerSubscriptionDeleted;

// Triggered When: A subscription is canceled or ends.

// Use Case: Essential for identifying when a user's subscription has been canceled or has expired. This event marks a user as no longer in good standing as a paying subscriber.