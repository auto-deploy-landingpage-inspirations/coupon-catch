"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("../server");
const handleCustomerSubscriptionUpdated = (session) => __awaiter(void 0, void 0, void 0, function* () {
    const customerId = session.customer;
    if (session.metadata && session.metadata.userId) {
        const fb_userId = session.metadata.userId;
        // Update Firestore
        try {
            yield server_1.firestore.doc(`users/${fb_userId}`).update({
                stripeCustomerId: customerId
            });
            console.log(`Mapped Stripe customer ID to Firebase user: ${fb_userId}`);
        }
        catch (error) {
            console.error(`Error mapping Stripe customer ID to Firebase user ${fb_userId}:`, error);
        }
    }
});
exports.default = handleCustomerSubscriptionUpdated;
// Triggered When: A Checkout Session is completed successfully.
// Use Case: If you use Stripe Checkout to set up subscriptions, this event is also relevant. It indicates a successful setup of a subscription through Stripe's Checkout process.
// This si where youll setup mapping of ID and id creation
