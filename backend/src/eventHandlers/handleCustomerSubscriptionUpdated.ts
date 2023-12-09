import { Firestore } from '@google-cloud/firestore';
import Stripe from 'stripe';
import { firestore } from '../server';


const handleCustomerSubscriptionUpdated = async (subscription: Stripe.Subscription) => {
  // Extract the relevant data from the subscription object
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  // Update Firestore
  try {










    
    // Query Firestore to find the user with the given Stripe customer ID
    const usersRef = firestore.collection('users');
    const querySnapshot = await usersRef.where('stripeCustomerId', '==', customerId).get();

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];

      // Update the user's payment status based on the subscription status
      await userDoc.ref.update({
        isPayingUser: status === 'active' ? true : false,
        sp_subscriptionId: status === 'active' ? subscriptionId : null,
        sp_customerId: customerId

        // Add other relevant fields if necessary
      });

      console.log(`Updated user ${userDoc.id}: Subscription status is ${status}.`);
    } else {
      console.log(`No user found with Stripe customer ID: ${customerId}`);
    }
  } catch (error) {
    console.error(`Error updating Firestore for Stripe customer ID ${customerId}:`, error);
  }
};

export default handleCustomerSubscriptionUpdated;

// Triggered When: There are any updates to a subscription (e.g., plan changes, pauses, or resumptions).

// Use Case: Useful for tracking changes in subscription status, like upgrades, downgrades, or pauses, which might affect the user's standing or access to services.




// Handling customer.subscription.updated for Validating Paying Users
// When this event is triggered, your primary goal should be to update your system's records to reflect the current state of the user's subscription. Here’s a typical approach:

// Identify the User: Extract the user's ID or relevant identifier from the event data.

// Check Subscription Status: Examine the status field of the subscription object. Key statuses include:

// active: The user is in good standing and has a valid, paid subscription.
// past_due: Payments are pending, indicating potential issues with the user's payment method.
// cancelled: The subscription has been cancelled.
// trialing: The user is in a trial period.
// Update User Records: Based on the status, update your database (like Firestore) to reflect the user's current subscription status. For example, you might have a field in your user records indicating whether the user is a current, paying subscriber.

// Handle Plan or Quantity Changes: If the event indicates a change in the plan or quantity, adjust your records accordingly. This might affect the user's access levels or features available to them within your application.

// Manage Expirations and Renewals: If your application handles renewals or expiration dates, update these dates based on the new subscription information.

// Notify the User (Optional): In some cases, you might want to notify the user of the changes to their subscription, especially if it affects their access or billing.

// Logging and Error Handling: Ensure that these operations are wrapped in appropriate error handling and logging mechanisms for debugging and auditing purposes.