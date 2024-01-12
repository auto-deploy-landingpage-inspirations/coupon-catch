"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
const router = express_1.default.Router();
const handleInvoicePaymentSucceeded_1 = __importDefault(require("../eventHandlers/handleInvoicePaymentSucceeded"));
router.post('/', express_1.default.raw({ type: 'application/json' }), (request, response) => {
    const sig = request.headers['stripe-signature'];
    if (!sig || Array.isArray(sig)) {
        response.status(400).send('Invalid Stripe signature');
        return;
    }
    let event;
    const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
    try {
        event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    }
    catch (err) {
        if (err instanceof Error) {
            response.status(400).send(`Webhook Error: ${err.message}`);
        }
        else {
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
            (0, handleInvoicePaymentSucceeded_1.default)(event.data.object);
            break;
        // ... handle other event types ...
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    // Return a 200 response to acknowledge receipt of the event
    response.json({ received: true });
});
exports.default = router;
