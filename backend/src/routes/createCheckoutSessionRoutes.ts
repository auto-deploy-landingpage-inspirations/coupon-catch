import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from 'express';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY as string;
const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });

async function createCheckoutSession(req: Request, res: Response) {
  const { firebaseUserId, receiptId } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1OImH1IpyKVPSD8GCa3dU42H",
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `http://localhost:8100/dashboard/home/receipts/${receiptId}`,
      cancel_url: `http://localhost:8100/dashboard/home/receipts/${receiptId}`,
      automatic_tax: { enabled: true },
      metadata: { fb_userId: firebaseUserId },
      subscription_data: {
        // Subscription-specific data
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
      res.status(500).send(error.message);
    } else {
      console.error("An unexpected error occurred");
      res.status(500).send('An unexpected error occurred');
    }
  }
}

export default createCheckoutSession;
